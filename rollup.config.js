import typescript from '@rollup/plugin-typescript';

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
				name: 'AppExtensionsSdk',
			},
		],
		plugins: [typescript({ tsconfig: './tsconfig.json' })],
	},
]
