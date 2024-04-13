// @ts-check
import path from 'node:path';
import fs from 'node:fs';
import {build} from 'esbuild';
import {z} from 'zod';
import {exclude_external_dependencies, get_args, project_root} from './lib.mjs';

const formats = /** @type {const} */ ([
  {
    ext: '.cjs',
    name: 'cjs',
  },
  {
    ext: '.mjs',
    name: 'esm',
  },
]);

const args = get_args(
  z.object({
    package: z.string(),
    input: z.string(),
  }),
);

const package_dir = path.join(project_root, 'packages', args.package);
const out_dir = path.join(package_dir, 'dist');
const entry_points = [path.join(package_dir, args.input)];

for (const format of formats) {
  const out_file = `index${format.ext}`;
  const format_out = path.join(out_dir, format.name);
  fs.rmSync(format_out, {force: true, recursive: true});
  await build({
    format: format.name,
    entryPoints: entry_points,
    sourcemap: true,
    bundle: true,
    plugins: [exclude_external_dependencies],
    treeShaking: true,
    outfile: path.join(format_out, out_file),
    platform: 'node',
    outExtension: {'.js': '.cjs'},
  });
}
