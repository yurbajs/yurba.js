import { createTsupConfig } from '../../tsup.config.js';

export default createTsupConfig({
	entry: ['src/index.ts', 'bin/index.ts'],
	minify: 'terser',
	dts: {
		entry: ['src/index.ts'],
		resolve: true,
	},
});
