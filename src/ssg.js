#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 5000;
const url = 'http://localhost:' + port;

// Start the Vite preview server
const viteProcess = spawn('npx', ['vite', 'preview', '--port', port.toString()], {
    stdio: 'pipe',
    shell: true
});

console.log(`\nInitializing processes...`);
console.log(`---------------------------------------`);
let started = false;
viteProcess.stdout.on('data', (data) => {
    const message = data.toString();
    if (!started && message.includes('http://')) {
      console.log(`Starting file generation:`);
      started = true;

      const crawlScript = path.resolve(__dirname, 'generator.js');
      const crawlProcess = spawn('node', [crawlScript, url], {
          stdio: 'inherit',
          shell: true,
      });

      crawlProcess.on('close', (code) => {
        console.log(`---------------------------------------`);
        if(code) {
          console.error(`Finished with error code ${code}`);
        } else {
          console.log(`All files have been successfully generated!\n`);
        }
        // Kill the Vite server
        viteProcess.kill();
      });
    }
});
