module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sonarjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended'
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.ts', '**/prisma/seed.ts'],
      rules: {
        'sonarjs/no-duplicate-string': 'off'
      }
    }
  ]
};
