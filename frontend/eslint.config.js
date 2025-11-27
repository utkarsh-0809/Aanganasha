// import js from '@eslint/js'
// import globals from 'globals'
// import react from 'eslint-plugin-react'
// import reactHooks from 'eslint-plugin-react-hooks'
// import reactRefresh from 'eslint-plugin-react-refresh'

// export default [
//   { ignores: ['dist'] },
//   {
//     files: ['**/*.{js,jsx}'],
//     languageOptions: {
//       ecmaVersion: 2020,
//       globals: globals.browser,
//       parserOptions: {
//         ecmaVersion: 'latest',
//         ecmaFeatures: { jsx: true },
//         sourceType: 'module',
//       },
//     },
//     settings: { react: { version: '18.3' } },
//     plugins: {
//       react,
//       'react-hooks': reactHooks,
//       'react-refresh': reactRefresh,
//     },
//     rules: {
//       ...js.configs.recommended.rules,
//       ...react.configs.recommended.rules,
//       ...react.configs['jsx-runtime'].rules,
//       ...reactHooks.configs.recommended.rules,
//       'react/jsx-no-target-blank': 'off',
//       'react-refresh/only-export-components': [
//         'warn',
//         { allowConstantExport: true },
//       ],
//     },
//   },
// ]

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';

export default [
  { ignores: ['dist'] },

  {
    files: ['**/*.{js,jsx}'],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },

    settings: {
      react: { version: '18.3' },
      // This helps import plugin resolve .js/.jsx files
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx'],
        },
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,  // << IMPORTANT
    },

    rules: {
      // default recommended eslint rules
      ...js.configs.recommended.rules,

      // react recommended rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // hooks rules
      ...reactHooks.configs.recommended.rules,

      // your custom rules
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // 🚨 THIS DETECTS CASE-SENSITIVE IMPORT ERRORS:
      'import/no-unresolved': 'error',
    },
  },
];
