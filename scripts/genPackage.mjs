// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import {deserializeArgumentList} from 'deez-argv';
import {z} from 'zod';
import {ParseError, projectRoot} from './lib.mjs';

const argSchema = z.object({
  name: z.string(),
});

let args;
try {
  args = argSchema.parse(deserializeArgumentList());
} catch (e) {
  throw new ParseError(/** @type {never}*/ (e));
}
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
