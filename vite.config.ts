import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const REVERSE_PROXY_HOST = 'http://100.105.249.10:2500';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],

	server: {
		host: '0.0.0.0',
		port: 8845,

		proxy: {
			'/Api': { target: REVERSE_PROXY_HOST },
			'/swagger': { target: REVERSE_PROXY_HOST }
		}
	}
});
