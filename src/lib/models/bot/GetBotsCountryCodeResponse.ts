/*
 * @Author       : Chr_
 * @Date         : 2026-02-08 21:23:13
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-02-09 11:23:12
 * @Description  :
 */
export interface BotRegion {
	requestcartgid: number;
	rgUserCountryOptions: Record<string, string>;
}

export interface Result {
	[botName: string]: BotRegion;
}

export interface IpcGetBotsCountryCodeResponse {
	Result?: Result;
	Message: string;
	Success: boolean;
}
