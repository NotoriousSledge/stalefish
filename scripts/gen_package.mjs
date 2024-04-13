// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import sh from 'node:child_process';
import {z} from 'zod';
import {get_args, project_root} from './lib.mjs';
import {
  ESLINT_CONFIG,
  TS_CONFIG,
  TS_CONFIG_SPEC,
} from './samples/constants.mjs';

const args = get_args(
  z.object({
    name: z.string(),
  }),
);
const out_dir = path.join(project_root, 'packages', args.name);
fs.mkdirSync(out_dir);

fs.cpSync(path.join(project_root, 'scripts', 'samples', 'package'), out_dir, {
  force: true,
  recursive: true,
});

const pkg_path = path.join(out_dir, 'package.json');
const pkg = fs.readFileSync(pkg_path, {encoding: 'utf8'});
fs.writeFileSync(pkg_path, pkg.replaceAll('${sample}', `${args.name}`), {
  encoding: 'utf8',
});

fs.writeFileSync(
  path.join(out_dir, '.eslintrc.json'),
  JSON.stringify(ESLINT_CONFIG),
  {
    encoding: 'utf8',
  },
);
fs.writeFileSync(
  path.join(out_dir, 'tsconfig.json'),
  JSON.stringify(TS_CONFIG),
  {
    encoding: 'utf8',
  },
);

fs.writeFileSync(
  path.join(out_dir, 'tsconfig.spec.json'),
  JSON.stringify(TS_CONFIG_SPEC),
  {
    encoding: 'utf8',
  },
);

process.chdir(out_dir);
sh.execSync('pnpm format && pnpm lint', {stdio: 'inherit'});
