import os
import zipfile
import sys
import time

# Ensure paramiko is available
try:
    import paramiko
except ImportError:
    print("Installing required package 'paramiko'...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko"])
    import paramiko

def zip_project(zip_path):
    print("Zipping local project files (including .next build)...")
    exclude_dirs = {'.git', 'node_modules', 'out'}
    exclude_files = {'project.zip', 'deploy.py'}
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files or file.endswith('.zip') or file.startswith('.env'):
                    continue
                file_path = os.path.join(root, file)
                archive_name = os.path.relpath(file_path, '.')
                zipf.write(file_path, archive_name)
    print("Zipping complete.")

def load_env():
    # Dynamic environment loader
    env = {}
    for filename in [".env.local", ".env"]:
        if os.path.exists(filename):
            with open(filename, "r") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        k, v = line.split("=", 1)
                        # Strip quotes and leading/trailing whitespace
                        k = k.strip()
                        v = v.strip().strip("'").strip('"')
                        # Precedence: .env.local takes priority, so only set if not already set
                        if k not in env:
                            env[k] = v
    # Merge with system environment variables
    for k, v in env.items():
        if k not in os.environ:
            os.environ[k] = v

def main():
    load_env()

    host = os.environ.get("FTP_HOST") or "212.85.28.186"
    user = os.environ.get("FTP_USER") or "u887289907"
    password = os.environ.get("FTP_PASS")
    port = int(os.environ.get("FTP_PORT") or 65002)

    db_host = os.environ.get("DB_HOST") or "localhost"
    db_port = os.environ.get("DB_PORT") or "3306"
    db_name = os.environ.get("DB_NAME")
    db_user = os.environ.get("DB_USER")
    db_pass = os.environ.get("DB_PASS")
    db_socket = os.environ.get("DB_SOCKET") or "/var/lib/mysql/mysql.sock"
    admin_passcode = os.environ.get("ADMIN_PASSCODE")
    resend_api_key = os.environ.get("RESEND_API_KEY")
    
    if not password:
        print("Error: FTP_PASS is not set in environment or env files. Halting deployment.")
        sys.exit(1)

    if not db_name or not db_user or not db_pass:
        print("Error: Database credentials (DB_NAME, DB_USER, DB_PASS) must be configured. Halting.")
        sys.exit(1)
    
    local_zip = "project.zip"
    remote_zip = "project.zip"
    
    # 1. Build local project first
    print("Building Next.js application locally...")
    build_status = os.system("npm run build")
    if build_status != 0:
        print("Error: Local build failed. Halting deployment.")
        sys.exit(1)
        
    # 2. Zip files
    zip_project(local_zip)
    
    # 3. Upload via SFTP
    print(f"Connecting to {host}:{port} via SFTP...")
    try:
        transport = paramiko.Transport((host, port))
        transport.connect(username=user, password=password)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        print(f"Uploading {local_zip} to {remote_zip}...")
        sftp.put(local_zip, remote_zip)
        sftp.close()
        transport.close()
        print("Upload complete.")
    except Exception as e:
        print("SFTP Upload failed:", e)
        if os.path.exists(local_zip):
            os.remove(local_zip)
        sys.exit(1)
        
    # 4. SSH into server to extract and reload
    print("Connecting via SSH to extract files and restart app...")
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(host, port, user, password)
        
        commands = [
            # Extract zip into the nodejs folder
            "unzip -o project.zip -d domains/pinstripesrentals.com/nodejs/",
            # Write the .env.local file on the server (injected from local credentials)
            (
                f"cat > domains/pinstripesrentals.com/nodejs/.env.local << 'ENVEOF'\n"
                f"DB_HOST={db_host}\n"
                f"DB_PORT={db_port}\n"
                f"DB_NAME={db_name}\n"
                f"DB_USER={db_user}\n"
                f"DB_PASS={db_pass}\n"
                f"DB_SOCKET={db_socket}\n"
                f"ADMIN_PASSCODE={admin_passcode or ''}\n"
                f"RESEND_API_KEY={resend_api_key or ''}\n"
                f"ENVEOF"
            ),
            # Install dependencies on the server
            "export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH && cd domains/pinstripesrentals.com/nodejs && npm install",
            # Initialise / seed the MySQL database (idempotent — safe to run every deploy)
            # Pass env vars explicitly to bypass dotenvx interception issues
            (
                f"export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH && "
                f"cd domains/pinstripesrentals.com/nodejs && "
                f"DB_HOST={db_host} "
                f"DB_PORT={db_port} "
                f"DB_NAME={db_name} "
                f"DB_USER={db_user} "
                f"DB_PASS='{db_pass}' "
                f"DB_SOCKET={db_socket} "
                f"npx tsx src/lib/db-init.ts"
            ),
            # Touch restart file to trigger Passenger restart
            "mkdir -p domains/pinstripesrentals.com/nodejs/tmp && touch domains/pinstripesrentals.com/nodejs/tmp/restart.txt",
            # Remove remote zip
            "rm project.zip"
        ]
        
        for cmd in commands:
            # Mask sensitive tokens in logs
            log_cmd = cmd
            if "DB_PASS=" in cmd or "cat >" in cmd:
                log_cmd = "[command containing sensitive configuration variables masked]"
            print(f"\nRunning SSH command: {log_cmd}")
            
            stdin, stdout, stderr = ssh.exec_command(cmd)
            
            # Print output in real-time
            while not stdout.channel.exit_status_ready():
                if stdout.channel.recv_ready():
                    out = stdout.channel.recv(1024).decode('utf-8', errors='ignore')
                    print(out, end='')
                if stderr.channel.recv_stderr_ready():
                    err = stderr.channel.recv_stderr(1024).decode('utf-8', errors='ignore')
                    print(err, end='', file=sys.stderr)
                    
            # Print any remaining output
            out = stdout.read().decode('utf-8', errors='ignore')
            if out:
                print(out, end='')
            err = stderr.read().decode('utf-8', errors='ignore')
            if err:
                print(err, end='', file=sys.stderr)
                
            status = stdout.channel.recv_exit_status()
            print(f"\nCommand finished with exit status: {status}")
            if status != 0 and "npm install" in cmd:
                print("Warning: npm install returned non-zero status.")
                
        ssh.close()
        print("\nDeployment successfully finished!")
    except Exception as e:
        print("SSH build execution failed:", e)
    finally:
        if os.path.exists(local_zip):
            os.remove(local_zip)

if __name__ == "__main__":
    main()
