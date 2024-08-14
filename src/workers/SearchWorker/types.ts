import { Api } from "telegram";

export interface TargetUpdateInfo {
    userId: number,
    chat: Api.Channel,
    message: Api.Message
}
