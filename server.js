// Set limits for resource-constrained environments (Hostinger caps thread count)
process.env.UV_THREADPOOL_SIZE = '1';
process.env.TOKIO_WORKER_THREADS = '1';

const fs = require('fs');
const path = require('path');

// Look for .env.secure in multiple potential locations
// Storing it in the parent directory (/home/u887289907/domains/pinstripesrentals.com/.env.secure)
// ensures it is outside the nodejs/ deployment directory and won't be deleted by Git CI.
const envLocations = [
  path.join(__dirname, '.env.secure'),
  path.join(__dirname, '..', '.env.secure'),
  '/home/u887289907/domains/pinstripesrentals.com/.env.secure'
];

let envLoaded = false;
for (const envFile of envLocations) {
  if (fs.existsSync(envFile)) {
    try {
      const content = fs.readFileSync(envFile, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const eq = line.indexOf('=');
        if (eq > 0) {
          const key = line.substring(0, eq).trim();
          const val = line.substring(eq + 1).trim();
          // Unconditionally overwrite to bypass Apache .htaccess truncation bugs
          process.env[key] = val;
        }
      });
      console.log(`Successfully loaded environment variables from: ${envFile}`);
      envLoaded = true;
      break;
    } catch (err) {
      console.error(`Failed to read env file ${envFile}:`, err);
    }
  }
}

if (!envLoaded) {
  console.warn('WARNING: No .env.secure file was found in any location.');
}

// Now start the actual Next.js standalone server
require('./server_original.js');

