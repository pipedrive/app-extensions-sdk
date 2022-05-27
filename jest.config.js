module.exports = {
	testEnvironment: 'jsdom',
	collectCoverageFrom: ['src/**/*.ts'],
	coverageThreshold: {
		global: {
			statements: 0,
			branches: 0,
			functions: 0,
			lines: 0,
		},
	},
	coverageDirectory: 'coverage',
	moduleDirectories: ['node_modules', 'src'],
	testRegex: '__tests__/.*\\.test\\.[tj]s?$',
	snapshotSerializers: [],
};
