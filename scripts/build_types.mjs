import path from 'path';
import {createBundle} from 'dts-buddy';
import {z} from 'zod';
import {get_args, project_root} from './lib.mjs';

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

await createBundle({
  project: path.join(package_dir, 'tsconfig.json'),
  output: path.join(package_dir, 'types', 'index.d.ts'),
  include: ['./src'],
  modules,
});
