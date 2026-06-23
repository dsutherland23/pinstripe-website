const fs = require('fs');
const path = require('path');

// Helper to recursively copy directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = stats && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const standaloneDir = path.join(__dirname, '.next', 'standalone');
if (fs.existsSync(standaloneDir)) {
  const serverOriginal = path.join(standaloneDir, 'server_original.js');
  const serverJs = path.join(standaloneDir, 'server.js');
  const wrapperJs = path.join(__dirname, 'server.js');

  if (fs.existsSync(serverJs)) {
    // 1. Rename .next/standalone/server.js to .next/standalone/server_original.js
    fs.renameSync(serverJs, serverOriginal);
    console.log('Successfully renamed standalone server.js to server_original.js');

    // 2. Copy our local server.js wrapper to .next/standalone/server.js
    if (fs.existsSync(wrapperJs)) {
      fs.copyFileSync(wrapperJs, serverJs);
      console.log('Successfully copied wrapper server.js to standalone directory');
    } else {
      console.error('ERROR: Local server.js wrapper not found at root!');
      process.exit(1);
    }
    
    // 3. Copy server_original.js to the root directory so the root server.js wrapper can find it
    const rootServerOriginal = path.join(__dirname, 'server_original.js');
    fs.copyFileSync(serverOriginal, rootServerOriginal);
    console.log('Successfully copied server_original.js to root directory');

  } else {
    console.error('ERROR: Standalone server.js not found in .next/standalone!');
    process.exit(1);
  }
} else {
  console.error('ERROR: .next/standalone directory not found. Standalone build might have failed.');
  process.exit(1);
}

// 4. Automatic Static Assets Deployment for Hostinger git pushes
// Hostinger clones/pulls the git repo to domains/pinstripesrentals.com/nodejs
// We automatically copy static files to domains/pinstripesrentals.com/public_html if it exists
const publicHtmlDir = path.join(__dirname, '..', 'public_html');
if (fs.existsSync(publicHtmlDir)) {
  console.log('Detected Hostinger public_html directory at:', publicHtmlDir);

  // Copy public/ assets -> public_html/
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    console.log('Copying public assets to public_html...');
    copyRecursiveSync(publicDir, publicHtmlDir);
    console.log('Successfully copied public assets.');
  }

  // Copy .next/static/ -> public_html/_next/static/
  const nextStaticDir = path.join(__dirname, '.next', 'static');
  const destNextStaticDir = path.join(publicHtmlDir, '_next', 'static');
  if (fs.existsSync(nextStaticDir)) {
    console.log('Copying .next/static assets to public_html/_next/static...');
    fs.mkdirSync(destNextStaticDir, { recursive: true });
    copyRecursiveSync(nextStaticDir, destNextStaticDir);
    console.log('Successfully copied static chunks.');
  }

  // Auto-inject Rewrite rules into .htaccess if missing
  const htaccessPath = path.join(publicHtmlDir, '.htaccess');
  if (fs.existsSync(htaccessPath)) {
    let htaccessContent = fs.readFileSync(htaccessPath, 'utf8');
    if (!htaccessContent.includes('RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f')) {
      console.log('Injecting static file rewrite & CDN cache rules into .htaccess...');
      const rules = `
# --- AUTO-GENERATED STATIC ASSETS REWRITE RULES ---
RewriteEngine On
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f
RewriteRule ^ - [L]

<IfModule mod_headers.c>
    SetEnvIf Request_URI "^/(images/|_next/)" is_static=1
    Header set Cache-Control "no-cache, no-store, must-revalidate" env=!is_static
    Header set Pragma "no-cache" env=!is_static
    Header set Expires "0" env=!is_static
</IfModule>
# --- END AUTO-GENERATED RULES ---
`;
      fs.writeFileSync(htaccessPath, htaccessContent.trim() + '\n' + rules);
      console.log('Successfully updated .htaccess.');
    } else {
      console.log('.htaccess already contains rewrite/cache rules.');
    }
  }
}
