import os
import zipfile
import sys
import ftplib
import urllib.request
import ssl
import time

def zip_project(zip_path):
    print("Zipping standalone build output for Hostinger...")
    exclude_from_zip = {'project.zip', 'deploy.py', 'ftp_deploy.py'}
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 1. Include .next/standalone/**
        standalone_dir = os.path.join('.next', 'standalone')
        if not os.path.isdir(standalone_dir):
            print("ERROR: .next/standalone/ not found. Did the build run successfully?")
            sys.exit(1)
        
        for root, dirs, files in os.walk(standalone_dir):
            # Skip node_modules inside standalone (they're already on the server)
            dirs[:] = [d for d in dirs if d not in {'cache', 'node_modules'}]
            for file in files:
                if file in exclude_from_zip:
                    continue
                file_path = os.path.join(root, file)
                archive_name = os.path.relpath(file_path, standalone_dir)
                zipf.write(file_path, archive_name)
        
        # 2. Include .next/static/**
        static_dir = os.path.join('.next', 'static')
        if os.path.isdir(static_dir):
            for root, dirs, files in os.walk(static_dir):
                dirs[:] = [d for d in dirs if d not in {'cache'}]
                for file in files:
                    file_path = os.path.join(root, file)
                    archive_name = os.path.relpath(file_path, '.')
                    zipf.write(file_path, archive_name)
        
        # 3. Include public/**
        public_dir = 'public'
        if os.path.isdir(public_dir):
            for root, dirs, files in os.walk(public_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    archive_name = os.path.relpath(file_path, '.')
                    zipf.write(file_path, archive_name)
        
        # 4. Include src/
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
        
        if os.path.isfile('server.js'):
            zipf.write('server.js', 'server.js')
            
    print("Zipping complete.")

def load_env():
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
                        k = k.strip()
                        v = v.strip().strip("'").strip('"')
                        if k not in env:
                            env[k] = v
    for k, v in env.items():
        if k not in os.environ:
            os.environ[k] = v

def main():
    load_env()
    
    host = os.environ.get("FTP_HOST") or "212.85.28.186"
    user = os.environ.get("FTP_USER") or "u887289907"
    password = os.environ.get("FTP_PASS") or "Pinstripe!1"
    
    db_port = os.environ.get("DB_PORT") or "3306"
    db_name = os.environ.get("DB_NAME") or "u887289907_pinsdb"
    db_user = os.environ.get("DB_USER") or "u887289907_pinuser"
    db_pass = os.environ.get("DB_PASS") or "Q7!mV3p#8Lz2@cN5"
    db_socket = os.environ.get("DB_SOCKET") or "/var/lib/mysql/mysql.sock"
    admin_passcode = os.environ.get("ADMIN_PASSCODE") or "01717381932"
    resend_api_key = os.environ.get("RESEND_API_KEY") or ""
    
    local_zip = "project.zip"
    remote_base = "domains/pinstripesrentals.com/nodejs"
    public_html = "domains/pinstripesrentals.com/public_html"
    
    # 1. Local Zip
    zip_project(local_zip)
    
    # 2. FTP Upload
    print(f"Connecting to FTP {host}:21...")
    has_htaccess_bak = False
    try:
        ftp = ftplib.FTP(host, timeout=30)
        ftp.login(user, password)
        print("FTP Login successful!")
        
        # Rename existing .htaccess if any to temporarily disable Passenger (allows PHP to run)
        try:
            ftp.rename(f"{public_html}/.htaccess", f"{public_html}/.htaccess.bak")
            print("Temporarily renamed existing .htaccess to .htaccess.bak to disable Passenger.")
            has_htaccess_bak = True
        except Exception:
            print("No existing .htaccess found to rename (or rename failed).")

        # Upload project.zip
        print(f"Uploading {local_zip}...")
        with open(local_zip, 'rb') as f:
            ftp.storbinary(f'STOR {local_zip}', f)
        print("Upload of project.zip complete.")
        
        # Write .env.secure
        print("Writing .env.secure config...")
        secure_env_content = (
            f"DB_HOST=localhost\n"
            f"DB_PORT={db_port}\n"
            f"DB_NAME={db_name}\n"
            f"DB_USER={db_user}\n"
            f"DB_PASS={db_pass}\n"
            f"DB_SOCKET={db_socket}\n"
            f"ADMIN_PASSCODE={admin_passcode}\n"
            f"RESEND_API_KEY={resend_api_key}\n"
        )
        env_bytes = secure_env_content.encode('utf-8')
        import io
        ftp.storbinary(f'STOR {remote_base}/.env.secure', io.BytesIO(env_bytes))
        print("Wrote .env.secure successfully.")
        
        # Write deploy_helper.php
        print("Writing deploy_helper.php script...")
        php_content = f"""<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(300);

header('Content-Type: text/plain');

echo "--- Unzipping standalone build ---\\n";
$zipFile = '/home/u887289907/project.zip';
$extractTo = '/home/u887289907/{remote_base}/';

if (!file_exists($zipFile)) {{
    die("Error: project.zip not found at $zipFile");
}}

$zip = new ZipArchive;
$res = $zip->open($zipFile);
if ($res === TRUE) {{
    $zip->extractTo($extractTo);
    $zip->close();
    echo "Success: Extracted project.zip to $extractTo\\n";
    
    // Copy server.js to server_original.js if not already present
    $serverJs = $extractTo . 'server.js';
    $serverOrigJs = $extractTo . 'server_original.js';
    if (file_exists($serverJs) && !file_exists($serverOrigJs)) {{
        copy($serverJs, $serverOrigJs);
        echo "Copied server.js to server_original.js\\n";
    }}
}} else {{
    echo "Error: Failed to open zip file, code: $res\\n";
}}

echo "\\n--- Running Database Migrations & Seeding ---\\n";
$conn = new mysqli("localhost", "{db_user}", "{db_pass}", "{db_name}");
if ($conn->connect_error) {{
    echo "MySQL connection failed: " . $conn->connect_error . "\\n";
}} else {{
    // 1. settings table migration
    $result = $conn->query("ALTER TABLE settings ADD COLUMN gallery_enabled TINYINT(1) NOT NULL DEFAULT 1");
    if ($result) {{
        echo "Successfully added gallery_enabled column to settings table.\\n";
    }} else {{
        echo "Alter settings table result: " . $conn->error . " (expected if column already exists)\\n";
    }}
    
    // 2. categories table seeding
    $stmt = $conn->prepare("INSERT IGNORE INTO categories (id, name, icon, featured, `order`) VALUES (?, ?, ?, ?, ?)");
    if ($stmt) {{
        $cat_id = 'cat-9'; $cat_name = 'Snow-cone Machines'; $cat_icon = 'ice'; $cat_feat = 0; $cat_ord = 9;
        $stmt->bind_param("sssii", $cat_id, $cat_name, $cat_icon, $cat_feat, $cat_ord);
        if ($stmt->execute()) {{
            echo "Category 'cat-9' seeded or already exists.\\n";
        }} else {{
            echo "Error seeding category: " . $stmt->error . "\\n";
        }}
        $stmt->close();
    }} else {{
        echo "Prepare failed for category seeding: " . $conn->error . "\\n";
    }}
    
    // 3. inventory table seeding
    $stmt2 = $conn->prepare("INSERT IGNORE INTO inventory (id, title, category, description, price, deposit_amount, availability, dimensions, capacity, image, rating, reviews, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt2) {{
        $id = '9'; $title = 'Professional Snow-cone Machine'; $cat = 'Snow-cone Machines';
        $desc = 'High-yield commercial-grade snow-cone shaver. Easy to operate and produces perfectly crushed ice for cool summer treats.';
        $price = 75.00; $deposit = 20.00; $avail = 1; $dims = '16″ × 16″ × 24″'; $cap = '120 Cones / hr';
        $img = '/images/kids-snowcones.png'; $rat = 4.8; $revs = 15; $stock = 5;
        $stmt2->bind_param("ssssddisssdii", $id, $title, $cat, $desc, $price, $deposit, $avail, $dims, $cap, $img, $rat, $revs, $stock);
        if ($stmt2->execute()) {{
            echo "Snow-cone Machine item seeded or already exists.\\n";
        }} else {{
            echo "Error seeding Snow-cone Machine: " . $stmt2->error . "\\n";
        }}
        $stmt2->close();
    }} else {{
        echo "Prepare failed for inventory seeding: " . $conn->error . "\\n";
    }}
    
    $conn->close();
}}

echo "\\n--- Restarting Next.js Node app ---\\n";
$restartDir = $extractTo . 'tmp';
if (!is_dir($restartDir)) {{
    mkdir($restartDir, 0755, true);
}}
$restartFile = $restartDir . '/restart.txt';
touch($restartFile);
echo "Touched restart.txt to reload Passenger.\\n";
?>"""
        php_bytes = php_content.encode('utf-8')
        ftp.storbinary(f'STOR {public_html}/deploy_helper.php', io.BytesIO(php_bytes))
        print("Uploaded deploy_helper.php successfully.")
        ftp.quit()
        
    except Exception as e:
        print("FTP Deployment setup failed:", e)
        if os.path.exists(local_zip):
            os.remove(local_zip)
        sys.exit(1)
        
    # 3. Trigger deployment script via HTTP (Passenger is currently disabled)
    url = "https://pinstripesrentals.com/deploy_helper.php"
    print(f"\nTriggering extraction and migration via HTTP: {url} ...")
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    triggered_success = False
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
            print("\nDEPLOYMENT RESULTS:")
            print("========================================")
            print(html)
            print("========================================")
            triggered_success = True
    except Exception as e:
        print("HTTP request to trigger deployment failed:", e)
        ip_url = f"http://212.85.28.186/deploy_helper.php"
        print(f"Retrying via Hostinger server IP: {ip_url} ...")
        try:
            req = urllib.request.Request(ip_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx) as response:
                html = response.read().decode('utf-8')
                print("\nDEPLOYMENT RESULTS (IP):")
                print("========================================")
                print(html)
                print("========================================")
                triggered_success = True
        except Exception as ip_e:
            print("Direct IP request also failed:", ip_e)
            
    # 4. Clean up helper script & write final .htaccess (re-enables Passenger)
    print("\nCleaning up deploy_helper.php and re-enabling Passenger...")
    try:
        ftp = ftplib.FTP(host, timeout=30)
        ftp.login(user, password)
        
        # Write fresh .htaccess
        print("Writing final .htaccess to re-enable Passenger...")
        safe_pass = db_pass.replace('"', '\\"')
        safe_passcode = admin_passcode.replace('"', '\\"')
        safe_resend = resend_api_key.replace('"', '\\"')
        
        htaccess_content = (
            'PassengerAppRoot /home/u887289907/domains/pinstripesrentals.com/nodejs\n'
            'PassengerAppType node\n'
            'PassengerNodejs /opt/alt/alt-nodejs22/root/bin/node\n'
            'PassengerStartupFile server.js\n'
            'PassengerBaseURI /\n'
            'PassengerRestartDir /home/u887289907/domains/pinstripesrentals.com/nodejs/tmp\n'
            'PassengerEnvVar NODE_OPTIONS "--max-old-space-size=256"\n'
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
        htaccess_bytes = htaccess_content.encode('utf-8')
        import io
        ftp.storbinary(f'STOR {public_html}/.htaccess', io.BytesIO(htaccess_bytes))
        print("Wrote final .htaccess successfully.")
        
        # Delete temporary .htaccess.bak if present
        if has_htaccess_bak:
            try:
                ftp.delete(f"{public_html}/.htaccess.bak")
                print("Deleted temporary .htaccess.bak.")
            except Exception:
                pass
                
        # Delete deploy_helper.php
        try:
            ftp.delete(f"{public_html}/deploy_helper.php")
            print("deploy_helper.php successfully deleted from server.")
        except Exception:
            pass
            
        ftp.quit()
        print("Passenger re-enabled and helper cleaned up.")
    except Exception as e:
        print("Error during cleanup/re-enabling Passenger:", e)
        
    if os.path.exists(local_zip):
        os.remove(local_zip)
        
    if triggered_success:
        print("\nFTP Deployment completed successfully!")
    else:
        print("\nFTP Deployment completed, but triggering helper failed. App files are uploaded.")

if __name__ == "__main__":
    main()
