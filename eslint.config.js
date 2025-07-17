import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      'jsx-a11y': jsxA11y
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        __esri: 'readonly',
        esri: 'readonly',
        require: 'readonly',
        define: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // Base rules
      'no-prototype-builtins': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': ['error', { ignoreTranspilerName: false }],
      'react/jsx-no-comment-textnodes': 'warn',
      'react/no-unescaped-entities': 'warn',
      
      // Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Refresh rules
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      
      // Accessibility rules
      'jsx-a11y/alt-text': ['error', {
        elements: ['img'],
        img: ['Image']
      }],
      
      // Unused imports
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: ['**/*.{js,jsx}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/public/**',
      '**/*.config.js'
    ]
  }
];