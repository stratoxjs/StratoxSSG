#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import ansi from './ansi.js';


/**
 * Parse argv to accessable flags
 * @param  {object} argv
 * @return {object}
 */
function parseArgs(argv) {
  const args = {};
  const regex = /^--(.+)/;
  for (let i = 2; i < argv.length; i++) {
    const match = argv[i].match(regex);
    if (match) {
      const key = match[1];
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = value;
    }
  }
  return args;
}


if (process.argv[2] !== 'build') {
  console.error(`\n${ansi(['bold', 'red'], 'Help!')}`);

  console.error(`\n${ansi(['bold'], 'To generate static files')}`);
  process.stdout.write(`${ansi(['bold'], 'Execute:')} ssg build\n\n`);

} else {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const args = parseArgs(process.argv);
  const ssl = args.ssl === 'true' || args.ssl === true;
  const host = args.host || 'localhost';
  const protocol = ssl ? 'https://' : 'http://';
  const port = (args.port && Number.isInteger(+args.port)) ? parseInt(args.port, 10) : 5193;
  const url = `${protocol}${host}:${port}`;

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
          if (!started && message.includes(protocol)) {
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

      viteProcess.on('close', (code) => {
        if(code) {
          clearInterval(ivt);
          console.error(`Finished with error code ${code}`);
        }
      });

    } else {
      console.error(`Vite build failed with exit code ${code}.`);
    }
  });

}

