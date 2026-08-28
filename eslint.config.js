const tseslint = require('typescript-eslint');
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      // Dependencies
      '**/node_modules/**',

      // Build outputs
      '**/dist/**',
      '**/build/**',
      '**/lib/**',
      '**/.turbo/**',
      '**/cache/**',

      // Test outputs
      '**/coverage/**',
      '**/.type-coverage/**',
      '**/test-reports/**',

      // Generated files
      '**/*.min.js',
      '**/*.d.ts',
      '**/*.tsbuildinfo',
      '**/index.d.ts',

      // VitePress
      '**/.vitepress/dist/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/.temp/**',
      '**/apps/docs/api/**',
      '**/apps/docs/public/docs.json',
      '**/apps/docs/navigation.json',

      // Logs
      '**/*.log',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      '**/lerna-debug.log*',

      // IDE
      '**/.vscode/**',
      '**/.idea/**',
      '**/.DS_Store',

      // Env files
      '**/.env',
      '**/.env.*',

      // Test files
      '**/tests/test.js',
    ],
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-useless-catch': 'off',
      'no-useless-escape': 'off',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-useless-escape': 'off',
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
    },
  },
];
