import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

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
