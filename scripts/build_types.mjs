import path from 'path';
import fs from 'node:fs';
import {createBundle} from 'dts-buddy';
import {z} from 'zod';
import {get_args, project_root} from './lib.mjs';
import {globIterate, globSync} from 'glob';

const args = get_args(
  z.object({
    package: z.string(),
    input: z.string(),
  }),
);
const package_dir = path.join(project_root, 'packages', args.package);

/** @type {Record<string, string>} */
const modules = {};
modules[`@stalefish/${args.package}`] = path.join(package_dir, args.input);

fs.rmSync(path.join(package_dir, 'types'), {force: true, recursive: true});
const pkg_config = JSON.parse(
  // @ts-ignore
  fs.readFileSync(path.join(package_dir, 'tsconfig.json')),
);

const root_config = JSON.parse(
  // @ts-ignore
  fs.readFileSync(path.join(project_root, 'tsconfig.json')),
);

const config = {
  ...root_config,
  ...{
    compilerOptions: {
      ...root_config['compilerOptions'],
      ...pkg_config['compilerOptions'],
    },
    include: Array.isArray(pkg_config['include'])
      ? pkg_config['include']
      : root_config['include'],
  },
};

const include = new Set(['./src/*.ts', '../lib/src/*.ts']);
for await (const file of globIterate('src/**/*.ts', {
  root: path.join(package_dir),
})) {
  include.add(path.basename(file));
}

for await (const file of globIterate('../lib/src/**/*.ts', {
  root: path.join(package_dir),
})) {
  include.add(path.basename(file));
}

console.log(include);

const tsconfig_path = path.join(package_dir, `resolved.tsconfig.json`);
fs.writeFileSync(tsconfig_path, JSON.stringify(config, null, 2));

await createBundle({
  project: tsconfig_path,
  output: path.join(package_dir, 'types', 'index.d.ts'),
  modules,
  include: Array.from(include),
});
