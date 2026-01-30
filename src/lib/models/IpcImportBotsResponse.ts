/*
 * @Author       : Chr_
 * @Date         : 2026-01-09 15:27:24
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-01-09 15:27:46
 * @Description  :
 */

export interface BotDetail {
  BotName: string;
  Success: boolean;
  Message?: string;
}

export interface Result {
  [botName: string]: BotDetail;
}

export interface IpcImportBotsResponse {
  Result: Result;
  Message: string;
  Success: boolean;
}
