import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
	{
		ignores: ['node_modules/**', 'coverage/**', 'sonar/**', 'dist/**', '**/*-min.js', '**/*.min.js'],
	},
	...tsPlugin.configs['flat/recommended'],
	{
		languageOptions: {
			parser: tsParser,
			globals: {
				// es6
				Promise: 'readonly',
				// browser
				window: 'readonly',
				document: 'readonly',
				// node
				process: 'readonly',
				require: 'readonly',
				module: 'readonly',
				__dirname: 'readonly',
				// jest
				describe: 'readonly',
				it: 'readonly',
				expect: 'readonly',
				beforeEach: 'readonly',
				afterEach: 'readonly',
				jest: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/explicit-function-return-type': 'off',
		},
	},
	{
		files: ['**/*.js', '**/*.test.tsx', '**/*.test.ts'],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
];
