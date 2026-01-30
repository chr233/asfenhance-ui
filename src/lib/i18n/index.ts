import { browser } from '$app/environment';
import { init, register } from 'svelte-i18n';

const defaultLocale = 'zh-cn';

export async function initLocale() {
	register('zh-cn', () => import('./locales/zh-cn.json'));
	register('en-us', () => import('./locales/en-us.json'));

	await init({
		fallbackLocale: defaultLocale,
		initialLocale: browser ? window.navigator.language : defaultLocale
	});
}
