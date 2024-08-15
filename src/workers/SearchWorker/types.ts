import { Api } from "telegram";

export interface UpdateInfo {
    userId: number,
    chat: Api.Channel,
    message: Api.Message
}

export interface TargetUpdateInfo extends UpdateInfo {
    summary: string
}
