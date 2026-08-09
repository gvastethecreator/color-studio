import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const [, , taskName, command, ...args] = process.argv;

if (!taskName || !command) {
  console.error('Usage: node scripts/run-with-log.mjs <task> <command> [...args]');
  process.exit(1);
}

const logsDir = join(process.cwd(), 'logs');
await mkdir(logsDir, { recursive: true });

const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const logFile = join(logsDir, `${timestamp}-${taskName}.log`);
const latestLogFile = join(logsDir, `latest-${taskName}.log`);

const startedAt = new Date();
let buffer = [
  `# Task: ${taskName}`,
  `# Command: ${command} ${args.join(' ')}`.trimEnd(),
  `# Started at: ${startedAt.toISOString()}`,
  '',
].join('\n');

process.stdout.write(`${buffer}\n`);

const binaryDirectory = join(process.cwd(), 'node_modules', '.bin');
const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ?? 'PATH';
const childEnvironment = {
  ...process.env,
  [pathKey]: `${binaryDirectory}${process.platform === 'win32' ? ';' : ':'}${process.env[pathKey] ?? ''}`,
};

const child = spawn(command, args, {
  shell: false,
  cwd: process.cwd(),
  env: childEnvironment,
  windowsHide: true,
});

child.stdout?.on('data', (chunk) => {
  const text = chunk.toString();
  buffer += text;
  process.stdout.write(text);
});

child.stderr?.on('data', (chunk) => {
  const text = chunk.toString();
  buffer += text;
  process.stderr.write(text);
});

const exitCode = await new Promise((resolve) => {
  child.on('error', (error) => {
    const message = `Unable to start ${command}: ${error.message}\n`;
    buffer += message;
    process.stderr.write(message);
    resolve(1);
  });
  child.on('close', (code) => resolve(code ?? 1));
});

const endedAt = new Date();
buffer += [
  '',
  `# Ended at: ${endedAt.toISOString()}`,
  `# Duration: ${endedAt.getTime() - startedAt.getTime()}ms`,
  `# Exit code: ${exitCode}`,
  '',
].join('\n');

await writeFile(logFile, buffer, 'utf8');
await writeFile(latestLogFile, buffer, 'utf8');

if (exitCode !== 0) {
  console.error(`\nCommand failed. Log saved to logs/${timestamp}-${taskName}.log`);
}

process.exit(Number(exitCode));
