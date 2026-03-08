#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const REPO = 'https://github.com/hanniehoney/Capiis.git';
const name = process.argv[2] || 'Capiis';

// Colors
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const target = path.resolve(process.cwd(), name);

if (fs.existsSync(target)) {
  console.error(`\n  Directory ${bold(name)} already exists. Choose a different name or delete it first.\n`);
  process.exit(1);
}

console.log(`\n  Creating ${bold('Capiis')} in ${dim(target)}...\n`);

// Clone
try {
  execSync(`git clone --depth 1 ${REPO} "${target}"`, { stdio: 'pipe' });
  // Remove .git so user starts fresh
  fs.rmSync(path.join(target, '.git'), { recursive: true, force: true });
} catch (e) {
  console.error('  Failed to download Capiis. Check your network connection.\n');
  process.exit(1);
}

// Install dependencies
console.log('  Installing dependencies...\n');
try {
  execSync('npm install', { cwd: target, stdio: 'pipe' });
} catch (e) {
  console.error('  npm install failed. You can try running it manually:\n');
  console.error(`    cd ${name} && npm install\n`);
}

// Done
console.log(green('  Done!\n'));
console.log(`  ${bold('Next steps:')}\n`);
console.log(`    cd ${name}`);
console.log(`    claude   ${dim('# Claude Code')}`);
console.log(`    opencode ${dim('# OpenCode')}`);
console.log(`    ${dim('then type')} /capiis ${dim('to launch the dashboard')}\n`);
console.log(`  ${dim('First launch will guide you through setup -')}`);
console.log(`  ${dim('import a demo persona or enter your own data.')}\n`);
