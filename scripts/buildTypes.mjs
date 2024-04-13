import path from 'path';
import {createBundle} from 'dts-buddy';
import {z} from 'zod';
import {getArgs, projectRoot} from './lib.mjs';

const args = getArgs(
  z.object({
    package: z.string(),
    input: z.string(),
  }),
);
const packageDir = path.join(projectRoot, 'packages', args.package);

/** @type {Record<string, string>} */
const modules = {};
modules[`@stalefish/${args.package}`] = path.join(packageDir, args.input);

await createBundle({
  project: path.join(packageDir, 'tsconfig.json'),
  output: path.join(packageDir, 'types', 'index.d.ts'),
  include: ['./src'],
  modules,
});
