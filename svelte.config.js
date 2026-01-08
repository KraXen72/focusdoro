import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// preprocess: vitePreprocess(),
	kit: {
		appDir: 'app',
		adapter: adapter({
			fallback: '404.html' // may differ from host to host
		}),
		alias: {
			'$utils/*': './src/utils/*',
			'$store/*': './src/store/*',
			'$typings/*': './src/typings/*'
		},
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/focusdoro' : ''
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore errors for paths that don't begin with base
				if (message.includes('does not begin with `base`')) {
					return;
				}
				throw new Error(message);
			}
		}
	},
	preprocess: vitePreprocess()
};

export default config;
