/** @type {import("eslint").Linter.Config} */

const config = {
  ignorePatterns: ['**/build', '**/coverage', '**/dist'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: true,
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: true,
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/array-type': [
      'error',
      {default: 'generic', readonly: 'generic'},
    ],
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {prefer: 'type-imports'},
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/method-signature-style': ['warn', 'property'],
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
        leadingUnderscore: 'forbid',
        trailingUnderscore: 'forbid',
        custom: {
          regex: '^(T|T[A-Z][A-Za-z]+)$',
          match: true,
        },
      },
      {
        selector: 'variable',
        format: ['snake_case', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'forbid',
      },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-inferrable-types': [
      'warn',
      {ignoreParameters: true},
    ],
    'import/default': 'off',
    'import/export': 'off',
    'import/namespace': 'off',
    'import/newline-after-import': 'warn',
    'import/no-cycle': 'warn',
    'import/no-duplicates': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-unresolved': 'off',
    'import/no-unused-modules': ['off', {unusedExports: true}],
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
      },
    ],
    'no-case-declarations': 'off',
    'no-empty': 'off',
    'no-prototype-builtins': 'off',
    'no-redeclare': 'off',
    'no-shadow': 'warn',
    'no-undef': 'off',
    'sort-imports': ['warn', {ignoreDeclarationSort: true}],
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-unnecessary-condition': 'off',
      },
    },
  ],
};

module.exports = config;
