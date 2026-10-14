// @ts-check

import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import sortClassMembers from 'eslint-plugin-sort-class-members';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/*.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  perfectionist.configs['recommended-natural'],
  {
    plugins: {
      'sort-class-members': sortClassMembers,
    },
    rules: {
      'perfectionist/sort-classes': 'off',
      'sort-class-members/sort-class-members': [
        'error',
        {
          order: [
            '[static-properties]',
            '[properties]',
            '[private-properties]',
            'constructor',
            '[static-methods]',
            '[getters]',
            '[setters]',
            '[methods]',
            '[private-methods]',
          ],
        },
      ],
    },
  },
  {
    files: ['test/**/*.ts', '**/*.spec.ts'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowStaticOnly: true,
          allowWithDecorator: true,
        },
      ],
    },
  },
];
