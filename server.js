// Set limits for resource-constrained environments (Hostinger caps thread count)
process.env.UV_THREADPOOL_SIZE = '1';
process.env.TOKIO_WORKER_THREADS = '1';

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log(`wrapper: Original process.env.PORT is: ${process.env.PORT}`);

// Intercept process.env.PORT if it's a domain socket path (not a pure number)
const originalPort = process.env.PORT;
let passengerSocket = null;

if (originalPort && isNaN(Number(originalPort))) {
  console.log(`wrapper: Detected Unix domain socket port: ${originalPort}`);
  passengerSocket = originalPort;
  // Set PORT to 3000 temporarily so Next.js doesn't crash on parsing
  process.env.PORT = '3000';
}

// Monkeypatch http.Server.prototype.listen to bind to Passenger socket if Next.js attempts to bind to 3000
const originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function(...args) {
  if (passengerSocket && (args[0] === 3000 || args[0] === '3000' || Number.isNaN(args[0]))) {
    console.log(`wrapper: Redirecting listen from 3000 to Passenger socket: ${passengerSocket}`);
    // Unix domain sockets take a single path argument
    return originalListen.call(this, passengerSocket, () => {
      console.log(`wrapper: Node server is now listening on Passenger socket: ${passengerSocket}`);
    });
  }
  return originalListen.apply(this, args);
};

// Look for .env.secure in multiple potential locations
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

