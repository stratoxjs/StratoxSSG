#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import ansi from './ansi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 5000;
const url = 'http://localhost:' + port;

const viteBuild = spawn('npx', ['vite', 'build'], {
    stdio: 'inherit',
    shell: true
});

viteBuild.on('close', (code) => {
  if (code === 0) {

    // Start the Vite preview server
    const viteProcess = spawn('npx', ['vite', 'preview', '--port', port.toString()], {
        stdio: 'pipe',
        shell: true
    });

    process.stdout.write(`\n${ansi(['bold', 'blue'], 'Starting static file generation')}`);

    const ivt = setInterval(() => {
      process.stdout.write(ansi(['blue'], '.'));
    }, 100);

    let started = false;
    viteProcess.stdout.on('data', (data) => {
        const message = data.toString();
        if (!started && message.includes('http://')) {
          clearInterval(ivt);
          console.log(`\n`);
          started = true;

          const crawlScript = path.resolve(__dirname, 'generator.js');
          const crawlProcess = spawn('node', [crawlScript, url], {
              stdio: 'inherit',
              shell: true,
          });

          crawlProcess.on('close', (code) => {
            if(code) {
              console.error(`Finished with error code ${code}`);
            } else {
              console.log(`\n${ansi(['bold', 'green'], 'All files have been successfully generated!')}\n`);
            }
            // Kill the Vite server
            viteProcess.kill();
          });
        }
    });


  } else {
    console.error(`Vite build failed with exit code ${code}.`);
  }
});
