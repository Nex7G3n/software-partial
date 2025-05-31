const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: 'node',
	transform: {
		...tsJestTransformCfg,
	},
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/src/$1',
		'^test/(.*)$': '<rootDir>/test/$1',
		'^(\\.\\.?\\/.+)\\.js$': '$1',
	},
};
