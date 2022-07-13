import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/index.js',
			format: 'cjs',
			sourcemap: true,
			exports: 'named',
		},
		{
			file: 'dist/index.umd.js',
			format: 'umd',
			sourcemap: true,
			exports: 'named',
			name: 'AppExtensionsSdk',
		},
	],
	plugins: [typescript({ tsconfig: './tsconfig.json' })],
};
