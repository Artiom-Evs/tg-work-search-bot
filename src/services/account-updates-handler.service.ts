import { Inject, Injectable } from "@nestjs/common";
import { SESSION_STORE } from "../providers/session-store.provider";
import { ChatItem, CustomSession } from "../types/custom-context.interfaces";
import { SessionStore } from "telegraf";
import { getClient } from "../tools/telegram";
import { Api, TelegramClient } from "telegram";

@Injectable()
export class AccountUpdatesHandlerService {
    constructor(
        @Inject(SESSION_STORE) private readonly _sessions: SessionStore<CustomSession>
    ) { }

    async * getNewChatsMessages(userId: number): AsyncGenerator<[chat: Api.Channel, messages: Api.Message[]]> {
        const userData = await this._sessions.get(`${userId}`);

        if (!userData)
            throw new Error(`User with id "${userId}" not found.`);

        const client = await getClient(userData?.auth.session ?? "");

        for (const chatItem of userData?.chats ?? []) {
            const [chat, messages] = await this.getChatUpdates(userId, userData, chatItem, client);
            yield [chat, messages];
        }
    }

    async getChatUpdates(userId: number, userData: CustomSession, chatItem: ChatItem, client: TelegramClient): Promise<[chat: Api.Channel, messages: Api.Message[]]> {
        const chat = await client.getEntity(chatItem.id) as Api.Channel;

        let messages = await client.getMessages(chatItem.id, {
            limit: 100,
            minId: chatItem.lastMessageId ?? 0,
        });

        messages = messages.filter(m => Number((m.fromId as any)?.userId ?? 0) !== userId);

        return [chat, messages];
    }
}
