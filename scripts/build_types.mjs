import path from 'path';
import fs from 'node:fs';
import {createBundle} from 'dts-buddy';
import {z} from 'zod';
import {get_args, project_root} from './lib.mjs';
import tsconfig from 'tsconfig';

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
const config = await tsconfig
  .load(package_dir, 'tsconfig.json')
  .then((c) => c.config);

console.log(config);

await createBundle({
  project: path.join(project_root, 'tsconfig.json'),
  output: path.join(package_dir, 'types', 'index.d.ts'),
  include: [`${path.join(package_dir, 'src')}/*`],
  modules,
});
