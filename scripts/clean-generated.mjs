import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const generatedPaths = ['dist', 'logs/coverage'];

for (const relativePath of generatedPaths) {
  const targetPath = path.join(rootDir, relativePath);

  if (existsSync(targetPath)) {
    rmSync(targetPath, { recursive: true, force: true });
    console.log(`Removed ${relativePath}`);
  }
}
