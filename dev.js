// ============================================================================
// STEAMED HAMS: ROOT DEV RUNNER
// Spawns both Backend and Frontend concurrently with colorized logging
// ============================================================================

const { spawn } = require('child_process');
const path = require('path');

console.log("\x1b[33m%s\x1b[0m", "============================================================");
console.log("\x1b[33m%s\x1b[0m", " STEAMED HAMS: THE WORST ENGINEER - DEVELOPMENT ENVIRONMENT ");
console.log("\x1b[33m%s\x1b[0m", " Starting Royal Backend and Steampunk Frontend...           ");
console.log("\x1b[33m%s\x1b[0m", "============================================================");

// Start backend
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', data => {
  process.stdout.write(`\x1b[36m[BACKEND]\x1b[0m ${data}`);
});
backend.stderr.on('data', data => {
  process.stderr.write(`\x1b[31m[BACKEND-ERR]\x1b[0m ${data}`);
});

// Start frontend
const frontend = spawn('node', ['dev-server.js'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', data => {
  process.stdout.write(`\x1b[32m[FRONTEND]\x1b[0m ${data}`);
});
frontend.stderr.on('data', data => {
  process.stderr.write(`\x1b[31m[FRONTEND-ERR]\x1b[0m ${data}`);
});

// Cleanup on exit
const cleanExit = () => {
  console.log("\n\x1b[33mShutting down Steam Engines...\x1b[0m");
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', () => {
  backend.kill();
  frontend.kill();
});
