export interface BotDetail {
	BotName: string;
	Nickname: string | null;
	AvatarHash: string | null;
	AccountFlags: number;
	PublishIP: string | null;
	HasMobileAuthenticator: boolean;
	IsPlayingPossible: boolean;
	KeepRunning: boolean;
	IsConnectedAndLoggedOn: boolean;
	s_SteamID: string | null;
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
