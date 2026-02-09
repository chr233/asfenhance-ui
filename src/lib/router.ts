/*
 * @Author       : Chr_
 * @Date         : 2026-01-31 18:55:10
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-02-09 15:42:06
 * @Description  :
 */
import AboutPage from '$lib/pages/AboutPage.svelte';
import BotListPage from '$lib/pages/BotListPage.svelte';
import CartPage from '$lib/pages/CartPage.svelte';
import { GlobeOutline, QuestionCircleOutline, UsersGroupOutline } from 'flowbite-svelte-icons';
import type { Component } from 'svelte';
import PurchaseTransferPage from './pages/PurchaseTransferPage.svelte';

export type RouterItem = {
	path?: string;
	label: string;
	icon?: Component;
	page?: Component;
};

const divider: RouterItem = { label: '分割线' };

export const routers: RouterItem[] = [
	{ path: '/bot-list', label: 'Bot 列表', icon: UsersGroupOutline, page: BotListPage },
	divider,
	{ path: '/cart', label: '购物车', icon: GlobeOutline, page: CartPage },
	{ path: '/purchase-transfer', label: '购买', icon: GlobeOutline, page: PurchaseTransferPage },
	{ path: '/purchase-transfer', label: '转区购买', icon: GlobeOutline, page: PurchaseTransferPage },
	divider,
	{ path: '/about', label: '关于', icon: QuestionCircleOutline, page: AboutPage }
];

export const DEFAULT_ROUTE = routers[0];

export function ifMathPath(targetPath: string): boolean {
	return location.pathname.toLocaleLowerCase().startsWith(targetPath);
}
