/*
 * @Author       : Chr_
 * @Date         : 2026-01-07 22:08:29
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-02-09 14:39:04
 * @Description  :
 */

import { ipcPassword } from '$lib/stores/tabStore';
import { get } from 'svelte/store';
import type { IpcBasicResponse } from './models/IpcBasicResponse';
import type { IpcGetBotsCountryCodeResponse as GetBotsCountryCodeResponse } from './models/bot/GetBotsCountryCodeResponse';
import type { IpcGetBotsResponse as GetBotsResponse } from './models/bot/GetBotsResponse';
import type { AddCartRequest } from './models/cart/AddCartRequest';
import type { ExternalPurchaseResponse } from './models/cart/ExternalPurchaseResponse';

async function baseRequest<T>(method: string = 'GET', uri: string = ''): Promise<T> {
	const ipcPwd = get(ipcPassword);
	const response = await fetch(uri, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(ipcPwd ? { Authentication: ipcPwd } : {})
		}
	});
	const data = (await response.json()) as Promise<T>;
	return data;
}

async function basePayloadRequest<T, V>(
	method: string = 'POST',
	uri: string = '',
	payload: V
): Promise<T> {
	const ipcPwd = get(ipcPassword);
	const response = await fetch(uri, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(ipcPwd ? { Authentication: ipcPwd } : {})
		},
		body: JSON.stringify(payload)
	});
	const data = (await response.json()) as Promise<T>;
	return data;
}

export async function getBotList(botNames: string = 'ASF'): Promise<GetBotsResponse> {
	const response = await baseRequest<GetBotsResponse>('GET', `/Api/Bot/${botNames}`);
	return response;
}

export async function startBots(botNames: string = 'ASF'): Promise<IpcBasicResponse> {
	const response = await baseRequest<IpcBasicResponse>('POST', `/Api/Bot/${botNames}/start`);
	return response;
}

export async function stopBots(botNames: string = 'ASF'): Promise<IpcBasicResponse> {
	const response = await baseRequest<IpcBasicResponse>('POST', `/Api/Bot/${botNames}/stop`);
	return response;
}

export async function getCountryCode(
	botNames: string = 'ASF'
): Promise<GetBotsCountryCodeResponse> {
	const response = await baseRequest<GetBotsCountryCodeResponse>(
		'POST',
		`/Api/Cart/GetCountryCode/${botNames}`
	);
	return response;
}

export async function cancelPayment(
	botName: string,
	transId: string
): Promise<ExternalPurchaseResponse> {
	const response = await baseRequest<ExternalPurchaseResponse>(
		'POST',
		`/Api/Cart/CancelPayment/${botName}?transId=${transId}`
	);
	return response;
}

export async function purchaseTransRegion(
	botName: string,
	countryCode: string,
	payment: string
): Promise<ExternalPurchaseResponse> {
	const response = await baseRequest<ExternalPurchaseResponse>(
		'POST',
		`/Api/Cart/PurchaseTransRegion/${botName}?countryCode=${countryCode}&payment=${payment}`
	);
	return response;
}

export async function purchaseExternal(
	botName: string,
	payment: string
): Promise<ExternalPurchaseResponse> {
	const response = await baseRequest<ExternalPurchaseResponse>(
		'POST',
		`/Api/Cart/PurchaseExternal/${botName}?payment=${payment}`
	);
	return response;
}

export async function clearCart(botNames: string = 'ASF'): Promise<IpcBasicResponse> {
	const response = await baseRequest<IpcBasicResponse>('POST', `/Api/Cart/ClearCart/${botNames}`);
	return response;
}

export async function addCart(
	botNames: string = 'ASF',
	items: AddCartRequest
): Promise<IpcBasicResponse> {
	const response = await basePayloadRequest<IpcBasicResponse, AddCartRequest>(
		'POST',
		`/Api/Cart/AddCart/${botNames}`,
		items
	);
	return response;
}
