import { webcrypto } from 'node:crypto';
import typescript from '@rollup/plugin-typescript';

// serialize-javascript (used by @rollup/plugin-terser) uses the bare `crypto`
// global which is only available on Node 19+. Polyfill for Node 16-18.
// Must run before @rollup/plugin-terser is imported (ESM static imports are
// hoisted, so terser is loaded dynamically after the polyfill is applied).
if (typeof crypto === 'undefined') {
	globalThis.crypto = webcrypto;
}

const { default: terser } = await import('@rollup/plugin-terser');

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/index.js',
				format: 'cjs',
				sourcemap: true,
				exports: 'named',
			},
		],
		plugins: [typescript({ tsconfig: './tsconfig.json' })],
	},
	{
		input: 'src/umd.ts',
		output: [
			{
				file: 'dist/index.umd.js',
				format: 'umd',
				sourcemap: true,
				exports: 'default',
				name: 'AppExtensionsSDK',
				plugins: [terser()],
			},
		],
		plugins: [typescript({ tsconfig: './tsconfig.json' })],
	},
];
