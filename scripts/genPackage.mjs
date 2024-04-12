// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import sh from 'node:child_process';
import {z} from 'zod';
import {getArgs, projectRoot} from './lib.mjs';
import {eslint, tsconfig, tsconfigSpec} from './samples/constants.mjs';

const args = getArgs(
  z.object({
    name: z.string(),
  }),
);
const outDir = path.join(projectRoot, 'packages', args.name);
fs.mkdirSync(outDir);

fs.cpSync(path.join(projectRoot, 'scripts', 'samples', 'package'), outDir, {
  force: true,
  recursive: true,
});

const pkgPath = path.join(outDir, 'package.json');
const pkg = fs.readFileSync(pkgPath, {encoding: 'utf8'});
fs.writeFileSync(pkgPath, pkg.replaceAll('${sample}', args.name), {
  encoding: 'utf8',
});

fs.writeFileSync(path.join(outDir, '.eslintrc.json'), JSON.stringify(eslint), {
  encoding: 'utf8',
});
fs.writeFileSync(path.join(outDir, 'tsconfig.json'), JSON.stringify(tsconfig), {
  encoding: 'utf8',
});

fs.writeFileSync(
  path.join(outDir, 'tsconfig.spec.json'),
  JSON.stringify(tsconfigSpec),
  {
    encoding: 'utf8',
  },
);

process.chdir(outDir);
sh.execSync('pnpm format && pnpm lint', {stdio: 'inherit'});
