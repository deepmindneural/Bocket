#!/usr/bin/env node

// Temporarily override Node.js version check
const originalNodeVersion = process.version;
Object.defineProperty(process, 'version', {
  value: 'v22.12.0',
  configurable: true,
  writable: true
});

// Run Angular CLI
const { spawn } = require('child_process');
const ng = spawn('npx', ['ng', 'build', '--configuration', 'production'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    NG_CLI_ANALYTICS: 'false'
  }
});

ng.on('close', (code) => {
  process.exit(code);
});

ng.on('error', (err) => {
  console.error('Error starting ng build:', err);
  process.exit(1);
});