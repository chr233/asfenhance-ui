/*
 * @Author       : Chr_
 * @Date         : 2026-02-09 11:23:05
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-02-09 15:04:39
 * @Description  :
 */
export interface Result {
	TransId?: string;
	TotalCoast?: string;
	PaymentUrl?: string;
	BotName?: string;
	Message?: string;
}

export interface ExternalPurchaseResponse {
	Result: Result;
	Message: string;
	Success: boolean;
}
