export const TS_CONFIG = {
  $schema: 'https://json.schemastore.org/tsconfig',
  extends: '../../tsconfig.json',
  compilerOptions: {
    module: 'esnext',
    moduleResolution: 'node',
    baseUrl: '.',
    paths: {
      '@/*': ['./src/*'],
      '$/*': ['../*'],
    },
  },
};

export const TS_CONFIG_SPEC = {
  extends: './tsconfig.json',
  compilerOptions: {
    types: ['node'],
  },
  include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.d.ts'],
};

export const ESLINT_CONFIG = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['!**/*'],
};
