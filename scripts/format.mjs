import fs from 'node:fs';
import sh from 'node:child_process';
import path from 'node:path';
import {project_root} from './lib.mjs';

process.chdir(project_root);
sh.execSync('pnpm prettier ./scripts --write --cache --log-level=warn');

for (const dir of fs.readdirSync('./packages')) {
  process.chdir(path.join(project_root, 'packages', dir));
  sh.execSync('pnpm format');
}
