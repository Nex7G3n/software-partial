// @ts-check
import apiEslintConfig from './apps/api/eslint.config.mjs';
import clientEslintConfig from './apps/client/eslint.config.js';

export default [
	{
		ignores: ['**/dist'],
	},
	...apiEslintConfig,
	...clientEslintConfig,
];
