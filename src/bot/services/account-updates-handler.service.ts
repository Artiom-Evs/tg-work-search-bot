import { Inject, Injectable, Logger } from "@nestjs/common";
import { SESSION_STORE } from "../providers/session-store.provider";
import { ChatItem, CustomSession } from "../interfaces/custom-context.interface"
import { SessionStore } from "telegraf";
import { Api, TelegramClient } from "telegram";
import { TelegramClientFactory } from "src/telegram-client/telegram-client.factory";

@Injectable()
export class AccountUpdatesHandlerService {
    private readonly _logger = new Logger(AccountUpdatesHandlerService.name);

    constructor(
        @Inject(SESSION_STORE) private readonly _sessions: SessionStore<CustomSession>,
        private readonly _clientFactory: TelegramClientFactory
    ) { }

    async * getNewChatsMessages(userId: number): AsyncGenerator<[chat: Api.Channel, messages: Api.Message[]]> {
        let client: TelegramClient;

        try {
            const userData = await this._sessions.get(`${userId}`);

            if (!userData)
                throw new Error(`User with id "${userId}" not found.`);

            client = await this._clientFactory.createTelegramClient(userData.auth.telegramSession ?? "");

            for (const chatItem of userData?.chats ?? []) {
                const [chat, messages] = await this.getChatUpdates(userId, userData, chatItem, client);
                yield [chat, messages];
            }
        }
        catch (err) {
            this._logger.error("Error while getting updates of the user selected chats.", err);
        }
        finally {
            await client.disconnect();
            await client.destroy();
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
