/*
 * @Author       : Chr_
 * @Date         : 2026-01-07 22:08:29
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-01-09 15:22:32
 * @Description  : 
 */

import type { ImportBotsPayload } from './models/ImportBotsPayload';
import type { IpcBasicResponse } from './models/IpcBasicResponse';
import type { IpcGetBotsResponse } from './models/IpcGetBotListResponse';
import type { IpcImportBotsResponse } from './models/IpcImportBotsResponse';

async function baseRequest<T>(
	method: string = 'GET',
	uri: string = '',
	ipcPassword?: string
): Promise<T> {
	const response = await fetch(uri, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(ipcPassword ? { Authentication: ipcPassword } : {})
		}
	});
	const data = await response.json() as Promise<T>;
	return data;
}

async function basePayloadRequest<T,V>(
	method: string = 'POST',
	uri: string = '',
	payload: V,
	ipcPassword?: string
): Promise<T> {
	const response = await fetch(uri, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...(ipcPassword ? { Authentication: ipcPassword } : {})
		},
		body:  JSON.stringify(payload) ,
	});
	const data = await response.json() as  Promise<T>;
	return data;
}

export async function getBotList(
	botNames: string = 'ASF',
	ipcPassword?: string
): Promise<IpcGetBotsResponse> {
	const response = await baseRequest<IpcGetBotsResponse>(
		'GET',
		`/Api/Import/GetBotList/${botNames}`,
		ipcPassword
	);
	return response;
}

export async function importBots(
	payload: ImportBotsPayload[],
	allowReplace: boolean = false,
	ipcPassword?: string
): Promise<IpcImportBotsResponse> {
	const response = await basePayloadRequest<IpcImportBotsResponse,ImportBotsPayload[]>(
		'POST',
		`/Api/Import/ImportBots?allowReplace=${allowReplace}`,
		payload,
		ipcPassword
	);
	return response;
}

export async function startBots(
	botNames: string = 'ASF',
	ipcPassword?: string
): Promise<IpcBasicResponse> {
	const response = await baseRequest<IpcBasicResponse>(
		'POST',
		`/Api/Bot/${botNames}/start`,
		ipcPassword
	);
	return response;
}

export async function stopBots(
	botNames: string = 'ASF',
	ipcPassword?: string
): Promise<IpcBasicResponse> {
	const response = await baseRequest<IpcBasicResponse>(
		'POST',
		`/Api/Bot/${botNames}/stop`,
		ipcPassword
	);
	return response;
}


