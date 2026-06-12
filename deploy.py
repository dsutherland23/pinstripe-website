import os
import sys
import ftplib

def load_ftp_credentials():
    credentials = {}
    env_paths = ['.env.local', '.env']
    for path in env_paths:
        if os.path.exists(path):
            with open(path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#') or '=' not in line:
                        continue
                    k, v = line.split('=', 1)
                    credentials[k.strip()] = v.strip()
            break # Stop after loading the first found env file
    return credentials

def upload_directory(ftp, local_path, remote_path):
    print(f"Syncing directory: {local_path} -> {remote_path}")
    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        remote_item = f"{remote_path}/{item}" if remote_path else item

        if os.path.isdir(local_item):
            # Skip node_modules or git if accidentally in target
            if item in ['.git', 'node_modules']:
                continue
            
            # Enter or create directory relatively
            try:
                ftp.cwd(item)
            except ftplib.all_errors:
                # Directory doesn't exist, create it
                ftp.mkd(item)
                ftp.cwd(item)
                
            upload_directory(ftp, local_item, remote_item)
            ftp.cwd("..") # Go back up one level
        else:
            # Upload file
            filename = os.path.basename(local_item)
            
            # CRITICAL WARNING: Avoid overwriting the database file on Hostinger if it exists
            if remote_item == "public_html/api/data/db.json" or remote_item == "api/data/db.json":
                try:
                    ftp.nlst(filename)
                    print(f" [SKIP] {remote_item} already exists on server (preserving live data).")
                    continue
                except ftplib.all_errors:
                    pass # File doesn't exist, proceed to upload

            print(f" [UP] {local_item} -> {remote_item}")
            with open(local_item, 'rb') as f:
                ftp.storbinary(f'STOR {filename}', f)

def main():
    print("Preparing Hostinger FTP deployment...")
    creds = load_ftp_credentials()
    
    ftp_host = creds.get('FTP_HOST')
    ftp_user = creds.get('FTP_USER')
    ftp_pass = creds.get('FTP_PASS')
    
    if not ftp_host or not ftp_user or not ftp_pass:
        print("Error: Missing FTP credentials in .env.local.")
        print("Please add the following variables to your .env.local file:")
        print("  FTP_HOST=your_ftp_host")
        print("  FTP_USER=your_ftp_username")
        print("  FTP_PASS=your_ftp_password")
        sys.exit(1)

    print(f"Connecting to {ftp_host}...")
    try:
        ftp = ftplib.FTP(ftp_host)
        ftp.login(ftp_user, ftp_pass)
        ftp.encoding = "utf-8"
        print("Login successful.")
        
        # Determine remote root path
        # In Hostinger, shared hosting files go to public_html/
        # Check if public_html exists
        remote_root = "public_html"
        try:
            ftp.cwd(remote_root)
        except ftplib.error_perm:
            remote_root = "" # Fallback if already in public_html
            print("Could not find 'public_html' directory. Deploying to current remote directory.")

        local_build_dir = "out"
        if not os.path.exists(local_build_dir):
            print(f"Error: Local build directory '{local_build_dir}' not found.")
            print("Please run 'npm run build' first.")
            ftp.quit()
            sys.exit(1)

        upload_directory(ftp, local_build_dir, remote_root)
        
        ftp.quit()
        print("\nDeployment completed successfully!")
    except Exception as e:
        print(f"\nDeployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
