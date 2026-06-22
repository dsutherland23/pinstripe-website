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
    """
    Zip the standalone build output for Hostinger Passenger deployment.
    
    Standalone builds produce:
      .next/standalone/          <- the runnable Node server (with server.js at root)
      .next/standalone/.next/    <- server-side files
      .next/static/              <- client-side JS/CSS (must be served separately)
      public/                    <- static public assets

    We include:
      - All of .next/standalone/**  (the actual server)
      - .next/static/**             (client assets, placed so server can find them)
      - public/**                   (static files)
      - src/                        (for db-init.ts)
      - package.json / package-lock.json
      - tsconfig.json
    """
    print("Zipping standalone build output for Hostinger...")
    
    exclude_from_zip = {'project.zip', 'deploy.py'}
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        
        # 1. Include .next/standalone/** -> maps to root of deployment
        standalone_dir = os.path.join('.next', 'standalone')
        if not os.path.isdir(standalone_dir):
            print("ERROR: .next/standalone/ not found. Did the build use output: 'standalone'?")
            sys.exit(1)
        
        for root, dirs, files in os.walk(standalone_dir):
            # Skip node_modules inside standalone (they're baked in)
            dirs[:] = [d for d in dirs if d not in {'cache'}]
            for file in files:
                if file in exclude_from_zip:
                    continue
                file_path = os.path.join(root, file)
                # Strip the .next/standalone/ prefix so files land at the deployment root
                archive_name = os.path.relpath(file_path, standalone_dir)
                zipf.write(file_path, archive_name)
        
        # 2. Include .next/static/** -> must be at .next/static/ relative to deployment root
        static_dir = os.path.join('.next', 'static')
        if os.path.isdir(static_dir):
            for root, dirs, files in os.walk(static_dir):
                dirs[:] = [d for d in dirs if d not in {'cache'}]
                for file in files:
                    file_path = os.path.join(root, file)
                    # Archive as .next/static/...
                    archive_name = os.path.relpath(file_path, '.')
                    zipf.write(file_path, archive_name)
        
        # 3. Include public/** -> must be at public/ relative to deployment root
        public_dir = 'public'
        if os.path.isdir(public_dir):
            for root, dirs, files in os.walk(public_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    archive_name = os.path.relpath(file_path, '.')
                    zipf.write(file_path, archive_name)
        
        # 4. Include src/ (for db-init.ts), package files, tsconfig
        for extra_dir in ['src']:
            if os.path.isdir(extra_dir):
                for root, dirs, files in os.walk(extra_dir):
                    dirs[:] = [d for d in dirs if d not in {'node_modules', '.next', 'cache'}]
                    for file in files:
                        if file.startswith('.env'):
                            continue
                        file_path = os.path.join(root, file)
                        archive_name = os.path.relpath(file_path, '.')
                        zipf.write(file_path, archive_name)
        
        for extra_file in ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts']:
            if os.path.isfile(extra_file):
                zipf.write(extra_file, extra_file)
        
        # 5. Include our server.js wrapper (load credentials from .env.secure)
        # The standalone build generates its own server.js - we rename it to server_original.js
        # and replace server.js with our wrapper that loads .env.secure first
        if os.path.isfile('server.js'):
            zipf.write('server.js', 'server.js')

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
    remote_base = "domains/pinstripesrentals.com/nodejs"
    
    # 1. Build local project first
    print("Building Next.js application locally (standalone mode)...")
    build_status = os.system("npm run build")
    if build_status != 0:
        print("Error: Local build failed. Halting deployment.")
        sys.exit(1)
    
    # Verify standalone was generated
    if not os.path.isdir(os.path.join('.next', 'standalone')):
        print("Error: .next/standalone/ was not created. Check next.config.ts has output: 'standalone'")
        sys.exit(1)
        
    # 2. Zip files (standalone-aware)
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
            # Extract zip into the nodejs folder (standalone root lands here)
            f"unzip -o project.zip -d {remote_base}/",
            # Rename the standalone server.js to server_original.js so our wrapper can require it
            # (only if server.js exists and server_original.js doesn't already exist)
            f"[ ! -f {remote_base}/server_original.js ] && cp {remote_base}/server.js {remote_base}/server_original.js || true",
            # Initialise / seed the MySQL database (idempotent — safe to run every deploy)
            (
                f"export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH && "
                f"cd {remote_base} && "
                f"DB_HOST=localhost "
                f"DB_PORT={db_port} "
                f"DB_NAME={db_name} "
                f"DB_USER={db_user} "
                f"DB_PASS='{db_pass}' "
                f"DB_SOCKET={db_socket} "
                f"npx tsx src/lib/db-init.ts"
            ),
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

        # 5. Write .htaccess with PassengerEnvVar directives via SFTP
        # (must use SFTP to avoid shell quoting issues with special chars in passwords)
        print("\nWriting Passenger configuration (.htaccess) via SFTP...")
        safe_pass = db_pass.replace('"', '\\"')
        safe_passcode = (admin_passcode or '').replace('"', '\\"')
        safe_resend = (resend_api_key or '').replace('"', '\\"')
        
        htaccess_content = (
            'PassengerAppRoot /home/u887289907/domains/pinstripesrentals.com/nodejs\n'
            'PassengerAppType node\n'
            'PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node\n'
            'PassengerStartupFile server.js\n'
            'PassengerBaseURI /\n'
            'PassengerRestartDir /home/u887289907/domains/pinstripesrentals.com/nodejs/tmp\n'
            'PassengerEnvVar NODE_OPTIONS "--require /home/u887289907/domains/pinstripesrentals.com/public_html/.builds/config/preload-timestamp.js --max-old-space-size=256"\n'
            'SetEnv LSNODE_CONSOLE_LOG console.log\n'
            f'PassengerEnvVar UV_THREADPOOL_SIZE 1\n'
            f'PassengerEnvVar TOKIO_WORKER_THREADS 1\n'
            f'PassengerEnvVar DB_HOST localhost\n'
            f'PassengerEnvVar DB_PORT {db_port}\n'
            f'PassengerEnvVar DB_NAME {db_name}\n'
            f'PassengerEnvVar DB_USER {db_user}\n'
            f'PassengerEnvVar DB_PASS "{safe_pass}"\n'
            f'PassengerEnvVar DB_SOCKET {db_socket}\n'
            f'PassengerEnvVar ADMIN_PASSCODE {safe_passcode}\n'
            f'PassengerEnvVar RESEND_API_KEY {safe_resend}\n'
            'RewriteRule ^\\.builds - [F,L]\n'
        )
        
        transport2 = paramiko.Transport((host, port))
        transport2.connect(username=user, password=password)
        sftp2 = paramiko.SFTPClient.from_transport(transport2)
        
        # Write .htaccess
        htaccess_path = "domains/pinstripesrentals.com/public_html/.htaccess"
        with sftp2.open(htaccess_path, 'w') as f:
            f.write(htaccess_content)
        
        # Write .env.secure (raw file - no shell interpretation, preserves all special chars)
        secure_env_content = (
            f"DB_HOST=localhost\n"
            f"DB_PORT={db_port}\n"
            f"DB_NAME={db_name}\n"
            f"DB_USER={db_user}\n"
            f"DB_PASS={db_pass}\n"
            f"DB_SOCKET={db_socket}\n"
            f"ADMIN_PASSCODE={admin_passcode or ''}\n"
            f"RESEND_API_KEY={resend_api_key or ''}\n"
        )
        with sftp2.open(f"{remote_base}/.env.secure", 'w') as f:
            f.write(secure_env_content)
        
        sftp2.close()
        transport2.close()
        
        # Set restrictive permissions on .env.secure
        ssh3 = paramiko.SSHClient()
        ssh3.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh3.connect(host, port, user, password)
        stdin, stdout, stderr = ssh3.exec_command(f"chmod 600 {remote_base}/.env.secure")
        stdout.channel.recv_exit_status()
        ssh3.close()
        print("Passenger .htaccess and .env.secure written successfully.")
        
        # 6. Touch restart file to trigger Passenger restart
        ssh2 = paramiko.SSHClient()
        ssh2.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh2.connect(host, port, user, password)
        stdin, stdout, stderr = ssh2.exec_command(
            f"mkdir -p {remote_base}/tmp && touch {remote_base}/tmp/restart.txt"
        )
        stdout.channel.recv_exit_status()
        ssh2.close()
        print("Passenger restart triggered.")
        
        print("\nDeployment successfully finished!")
    except Exception as e:
        print("SSH build execution failed:", e)
    finally:
        if os.path.exists(local_zip):
            os.remove(local_zip)

if __name__ == "__main__":
    main()

