import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const [, , taskName, command, ...args] = process.argv;

if (!taskName || !command) {
  console.error('Uso: bun run scripts/run-with-log.mjs <task> <command> [...args]');
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

const child = spawn(command, args, {
  shell: true,
  cwd: process.cwd(),
  env: process.env,
  windowsHide: false,
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
  console.error(`\nEl comando falló. Log guardado en logs/${timestamp}-${taskName}.log`);
}

process.exit(Number(exitCode));
