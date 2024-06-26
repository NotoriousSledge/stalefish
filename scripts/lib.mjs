// @ts-check
import path from 'node:path';
import fs from 'node:fs';
import nodeURL from 'node:url';
import {deserializeArgumentList} from 'deez-argv';

export const dirname = path.dirname(nodeURL.fileURLToPath(import.meta.url));
export const project_root = path.join(dirname, '..');

/** @type {import("./types").ParseArgumentList} */
export const get_args = (schema) => {
  try {
    return schema.parse(deserializeArgumentList());
  } catch (e) {
    throw new ParseError(/** @type {never}*/ (e));
  }
};

/** @type {import("esbuild").Plugin} */
export const exclude_external_dependencies = {
  name: 'exlude-external-dependencies',
  setup(build) {
    let filter = /^./;

    build.onResolve({filter}, (args) => {
      if (args.kind === 'entry-point') {
        return {path: args.path, external: false};
      }

      if (args.path.startsWith('@/')) {
        return handle_local_src_import(args);
      }

      if (args.path.startsWith('$/')) {
        return handle_local_lib_import(args);
      }

      if (args.path.startsWith('.')) {
        return handleLocalImport(args);
      }

      return {path: args.path, external: true};
    });
  },
};

/** @param {import("esbuild").OnResolveArgs} args */
const handle_local_src_import = (args) => {
  const i = args.path.indexOf('/');
  const lib_name = args.importer.match(/.+packages\/(.+)\/src.*/)?.at(1);
  if (!lib_name) {
    return undefined;
  }

  const p = resolveImportExtension(
    path.join(project_root, 'packages', lib_name, 'src', args.path.slice(i)),
  );

  return {
    path: p,
    external: false,
  };
};

/** @param {import("esbuild").OnResolveArgs} args */
const handle_local_lib_import = (args) => {
  const i = args.path.indexOf('/');
  const p = resolveImportExtension(
    path.join(project_root, 'packages/lib/src', args.path.slice(i)),
  );

  return {
    path: p,
    external: false,
  };
};

/** @param {import("esbuild").OnResolveArgs} args */
function handleLocalImport(args) {
  const p = resolveImportExtension(path.resolve(args.resolveDir, args.path));

  return {
    path: p,
    external: false,
  };
}

/** @param {string} fp */

function resolveImportExtension(fp) {
  if (fs.existsSync(fp)) {
    fp += '/index.ts';
  } else {
    fp += '.ts';
  }

  return fp;
}

/**
 *
 *  * @description - A custom error class that interprets Zod-errors to a more common format.
 *
 *   */

export class ParseError extends Error {
  /** @param {import('zod').ZodError<unknown>} zodError */

  constructor(zodError) {
    super(format_zod_errors(zodError.format()));

    this.name = 'ParseError';

    this.stack = zodError.stack;
  }
}

/**
 *
 *  * @description - Formats Zod errors to a single readable string.
 *
 *   * @param {import("zod").ZodFormattedError<Map<string, string>, string>} errors
 *
 *    * */

export const format_zod_errors = (errors) => {
  return Object.entries(errors)
    .map(([name, value]) => {
      if ('_errors' in value) {
        return `${name}: ${value._errors.join(', ')}`;
      }

      return `${value.join(', ')}`;
    })
    .filter(Boolean)
    .join('\n');
};
