export interface BotDetail {
  BotName: string;
  NickName: string | null;
  AccountFlags: number;
  PublishIP: string | null;
  IsLimited: boolean;
  IsLocked: boolean;
  Has2Fa: boolean;
  Enabled: boolean;
  Paused: boolean;
  KeepRunning: boolean;
  IsOnline: boolean;
  SteamId: string | null;
  WalletBalance: number;
  WalletCurrency: number;
}

export interface Result {
  [botName: string]: BotDetail;
}

export interface IpcGetBotsResponse {
  Result: Result;
  Message: string;
  Success: boolean;
}
