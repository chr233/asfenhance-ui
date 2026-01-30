/*
 * @Author       : Chr_
 * @Date         : 2025-08-06 22:42:14
 * @LastEditors  : Chr_
 * @LastEditTime : 2026-01-08 22:58:58
 * @Description  :
 */

export interface ImportBotsPayload {
  Enabled: boolean;
  Paused: boolean;
  BotName: string;
  SteamLogin?: string;
  SteamPassword?: string;
  IdentitySecret?: string ;
  SharedSecret?: string ;
}

export interface ImportBotsMessagePayload extends ImportBotsPayload {
  Message?: string;
  Processed: boolean;
}
