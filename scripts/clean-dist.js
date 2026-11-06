const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      fs.rmSync(distPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
      break;
    } catch (err) {
      if (attempt === 4) {
        console.warn(
          'Warning: dist folder is partially locked by another process (e.g. running expo start or VS Code). Continuing build...'
        );
      } else {
        try {
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300);
        } catch {
          // Fallback if SharedArrayBuffer unavailable
        }
      }
    }
  }
}

