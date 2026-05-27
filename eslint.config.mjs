import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const ignoredPaths = ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(ignoredPaths),
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['warn', 'all'],
      'import/no-anonymous-default-export': 'off',
    },
  },
  prettier,
]);

export default eslintConfig;
