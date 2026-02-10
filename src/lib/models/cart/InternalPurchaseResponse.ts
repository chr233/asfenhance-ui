/*
 * @Author       : Chr_
 * @Date         : 2026-02-10 15:36:42
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-02-10 15:39:28
 * @Description  :
 */
export interface OnlyPurchaseResponse {
	Success: boolean;
	Cost?: string;
	Currency?: string;
	BalancePrev?: string;
	BalanceNow?: string;
	BotName?: string;
	Message?: string;
}

export interface Result {
	[botName: string]: OnlyPurchaseResponse;
}

export interface InternalPurchaseResponse {
	Result: Result;
	Message: string;
	Success: boolean;
}
