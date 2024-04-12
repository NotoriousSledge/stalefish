// @ts-check
import {deserializeArgumentList} from 'deez-argv';
import {globIterate} from 'glob';
import path from 'node:path';
import fs from 'node:fs';
import {z} from 'zod';
import {once} from 'node:events';
import test from 'node:test';
import {spec} from 'node:test/reporters';
import {build} from 'esbuild';
import {ParseError, excludeExternalDependencies, projectRoot} from './lib.mjs';

process.env['NODE_ENV'] = 'test';
const argSchema = z.object({
  package: z.string(),
});

let args;
try {
  args = argSchema.parse(deserializeArgumentList());
} catch (e) {
  throw new ParseError(e);
}

const outDir = path.join(projectRoot, 'dist', 'test', args.package);

const tsconfig = path.join(
  projectRoot,
  'packages',
  args.package,
  'tsconfig.spec.json',
);
const builtFiles = new Array();
/** @param {string} file */

const buildFile = async (file) => {
  const baseOut = path.join(
    outDir,
    path.basename(file).replace(/\.ts$/, '.mjs'),
  );

  let outfile = baseOut;

  let i = 1;

  while (builtFiles.includes(outfile)) {
    outfile = `${baseOut.slice(0, -4)}_${i++}.mjs`;
  }

  builtFiles.push(outfile);

  const input = path.resolve(file);

  if (fs.existsSync(outfile)) {
    fs.rmSync(outfile, {force: true, recursive: true});
  }

  await build({
    outfile,
    format: 'esm',
    platform: 'node',
    tsconfig,
    plugins: [excludeExternalDependencies],
    bundle: true,
    sourcemap: true,
    entryPoints: [input],
  });

  console.log("Built '%s' to '%s'", file, outfile);
};

/** @param {string[]} pattern */

const identifyAndBuild = async (pattern) => {
  const result = [];

  for await (const file of globIterate(pattern)) {
    result.push(buildFile(file));
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

process.chdir(path.join(projectRoot, 'packages', args.package));
const pattern = ['**/*.test.ts', '**/*.spec.ts'];

try {
  await identifyAndBuild(pattern)
    .then(() => process.chdir(projectRoot))
    .then(() => test.run({files: builtFiles, concurrency: true}))
    .then((s) => /** @type {spec} */ (s.compose(new spec())))
    .then((s) => s.on('data', write))
    .then((s) => once(s, 'end'));
} catch (e) {
  console.error(e);
  status = 1;
}

process.exit(status);
