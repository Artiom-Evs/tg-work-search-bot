import { Api } from "telegram";

export interface ChatUpdateInfo {
    userId: number,
    chat: Api.Channel,
    message: Api.Message
}

export interface TargetChatUpdateInfo extends ChatUpdateInfo {
    summary: string
}
