import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'coverage/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2024, sourceType: 'module' },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },
  {
    files: ['frontend/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['backend/**/*.js', 'tests/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Playwright specs run callbacks inside the page via page.evaluate().
    files: ['tests/e2e/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    // The shared core and catalog run in both environments and must not
    // touch browser or Node-specific globals.
    files: ['frontend/scripts/core/**/*.js', 'frontend/scripts/data/**/*.js'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'navigator', 'localStorage', 'location', 'process', 'Buffer'].map((name) => ({
          name,
          message: 'Shared core code must run in both the browser and Node.',
        })),
      ],
    },
  },
];
