const { spawn } = require('child_process');
const path = require('path');

module.exports = function run(portNum) {

  const port = (typeof portNum !== "number") ? 5000 : portNum;
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

        const crawlScript = path.resolve('./generator.js');
        const crawlProcess = spawn('node', [crawlScript, url, ["www1", "www2"]], {
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
}
