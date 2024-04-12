export const tsconfig = {
  $schema: 'https://json.schemastore.org/tsconfig',
  extends: '../../tsconfig.json',
  compilerOptions: {
    module: 'esnext',
    moduleResolution: 'node',
    baseUrl: '.',
    paths: {
      '@/': ['./src/*'],
      '$/': ['../*'],
    },
  },
};

export const tsconfigSpec = {
  extends: './tsconfig.json',
  compilerOptions: {
    types: ['node'],
  },
  include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.d.ts'],
};

export const eslint = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['!**/*'],
};
