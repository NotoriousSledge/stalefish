// @ts-check
import path from 'node:path';
import fs from 'node:fs';
import {build} from 'esbuild';
import {z} from 'zod';
import {excludeExternalDependencies, getArgs, projectRoot} from './lib.mjs';

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

const args = getArgs(
  z.object({
    package: z.string(),
    input: z.string(),
  }),
);

const packageDir = path.join(projectRoot, 'packages', args.package);
const outDir = path.join(packageDir, 'dist');
const entryPoints = [path.join(packageDir, args.input)];

for (const format of formats) {
  const outFile = `index${format.ext}`;
  const formatOut = path.join(outDir, format.name);
  fs.rmSync(formatOut, {force: true, recursive: true});
  await build({
    format: format.name,
    entryPoints,
    sourcemap: true,
    bundle: true,
    plugins: [excludeExternalDependencies],
    treeShaking: true,
    outfile: path.join(formatOut, outFile),
    platform: 'node',
    outExtension: {'.js': '.cjs'},
  });
}
