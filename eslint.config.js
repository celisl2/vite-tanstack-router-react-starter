// @ts-check

import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  // Base TanStack config — covers TypeScript, imports, and general best practices
  ...tanstackConfig,

  // TanStack Query rules — catches missing queryKey deps, unstable references,
  // and other Query-specific bugs that TypeScript alone won't catch
  ...pluginQuery.configs['flat/recommended'],

  // TanStack Router rules — enforces correct route property order and other
  // router-specific patterns
  ...pluginRouter.configs['flat/recommended'],

  {
    rules: {
      // Re-enabled: circular imports cause subtle runtime bugs in React apps
      // (undefined values at module init, stale closures). Warn rather than
      // error so existing cycles surface gradually without blocking the build.
      'import/no-cycle': 'warn',

      // Kept off: import/order and sort-imports conflict with each other and
      // with the formatter. Use a single tool (Prettier) for ordering concerns.
      'import/order': 'off',
      'sort-imports': 'off',

      // Kept off: Array<T> vs T[] is a style preference — the tanstack base
      // config enforces one, turn this off to allow both.
      '@typescript-eslint/array-type': 'off',

      // Kept off: async route loaders and server functions often have async
      // signatures for consistency even when the body is synchronous.
      '@typescript-eslint/require-await': 'off',

      // Kept off: not using pnpm catalogs in this project.
      'pnpm/json-enforce-catalog': 'off',

      // Enforce explicit return types on exported functions and components.
      // Catches unintentional widening (e.g. returning `any` from an API call).
      '@typescript-eslint/explicit-module-boundary-types': 'warn',

      // Disallow console.log in committed code — use the pino logger instead.
      // console.warn and console.error are still allowed for exceptional cases.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Prefer const for variables that are never reassigned.
      'prefer-const': 'error',

      // Disallow unused expressions — they usually indicate a missing await
      // or a logic error.
      'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    },
  },

  {
    // Config files are CommonJS or use different conventions — exclude them
    // from the rules above that assume ESM application code.
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'vite.config.ts',
      'dist/**',
      'node_modules/**',
    ],
  },
]
