import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],

	server: {
		host: "0.0.0.0",
		port: 8645,

		proxy: {
			'/Api': { target: 'http://100.105.249.10:2500' },
			'/swagger': { target: 'http://100.105.249.10:2500' }
		}
	}
});
