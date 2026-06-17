// Wrapper: Load credentials from protected .env.secure file before starting Next.js
// This avoids Apache .htaccess special character issues (# treated as comment, etc.)
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env.secure');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.substring(0, eq).trim();
      const val = line.substring(eq + 1).trim();
      // Only set if not already set (allows PassengerEnvVar to override non-sensitive vars)
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

// Now start the actual Next.js standalone server
require('./server_original.js');

