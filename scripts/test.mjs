// @ts-check
import path from 'node:path';
import fs from 'node:fs';
import {once} from 'node:events';
import test from 'node:test';
import {spec} from 'node:test/reporters';
import {z} from 'zod';
import {globIterate} from 'glob';
import {build} from 'esbuild';
import {exclude_external_dependencies, get_args, project_root} from './lib.mjs';

process.env['NODE_ENV'] = 'test';
const args = get_args(
  z.object({
    package: z.string(),
  }),
);

const package_dir = path.join(project_root, 'packages', args.package);
const out_dir = path.join(package_dir, 'dist', 'test');

const tsconfig = path.join(package_dir, 'tsconfig.spec.json');
/** @type {Array<string>}*/
const built_files = [];
/** @param {string} file */

const build_file = async (file) => {
  const base_out = path.join(
    out_dir,
    path.basename(file).replace(/\.ts$/, '.mjs'),
  );

  let outfile = base_out;

  let i = 1;

  while (built_files.includes(outfile)) {
    outfile = `${base_out.slice(0, -4)}_${i++}.mjs`;
  }

  built_files.push(outfile);

  const input = path.resolve(file);

  if (fs.existsSync(outfile)) {
    fs.rmSync(outfile, {force: true, recursive: true});
  }

  await build({
    outfile,
    format: 'esm',
    platform: 'node',
    tsconfig,
    plugins: [exclude_external_dependencies],
    bundle: true,
    sourcemap: true,
    entryPoints: [input],
  });

  console.log("Built '%s' to '%s'", file, outfile);
};

/** @param {string[]} pattern */

const identify_and_build = async (pattern) => {
  const result = [];

  for await (const file of globIterate(pattern)) {
    result.push(build_file(file));
  }

  return Promise.all(result);
};

const dec = new TextDecoder();
const regex = new RegExp(/.{2}fail[\s][1-9]{1}\d*/g);
let status = 0;

/** @param {any} byte */

const write = (byte) => {
  process.stdout.write(byte);

  if (status) return;
  const matches = dec.decode(byte).match(regex);
  if (matches && matches.length > 0) {
    status = 1;
  }
};

/** @typedef {ReturnType<typeof test.run>} TestsStream} */

process.chdir(package_dir);
const pattern = ['**/*.test.ts', '**/*.spec.ts'];

try {
  await identify_and_build(pattern)
    .then(() => process.chdir(project_root))
    .then(() => test.run({files: built_files, concurrency: true}))
    .then((s) => /** @type {spec} */ (s.compose(new spec())))
    .then((s) => s.on('data', write))
    .then((s) => once(s, 'end'));
} catch (e) {
  console.error(e);
  status = 1;
}

process.exit(status);
