const ts = require('typescript');

const compilerOptions = {
	module: ts.ModuleKind.CommonJS,
	target: ts.ScriptTarget.ES2018,
	esModuleInterop: true,
};

module.exports = {
	process(sourceText, sourcePath) {
		const { outputText } = ts.transpileModule(sourceText, { compilerOptions, fileName: sourcePath });

		return { code: outputText };
	},
};
