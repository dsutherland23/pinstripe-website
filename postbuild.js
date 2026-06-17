const fs = require('fs');
const path = require('path');

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
  } else {
    console.error('ERROR: Standalone server.js not found in .next/standalone!');
    process.exit(1);
  }
} else {
  console.error('ERROR: .next/standalone directory not found. Standalone build might have failed.');
  process.exit(1);
}
