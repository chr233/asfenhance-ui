/*
 * @Author       : Chr_
 * @Date         : 2026-01-30 18:06:07
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-01-30 18:06:23
 * @Description  :
 */
/*
 * @Author       : Chr_
 * @Date         : 2026-01-07 22:00:19
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-01-09 16:59:54
 * @Description  :
 */
/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{html,js,svelte,vue}'];
export const theme = {
	screens: {
		xs: '480px', // 超小屏幕
		sm: '640px',
		md: '768px',
		lg: '1024px',
		xl: '1280px',
		'2xl': '1536px'
	},
	extend: {} // 自定义扩展
};
export const plugins = [];
