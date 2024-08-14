import { Api, TelegramClient } from "telegram";
import { ChatItem, CustomSession } from "../../customContext";
import { store } from "../../middlewares/sessionMiddleware";
import { getClient, getTelegrafBot } from "../../tools/telegram";
import { Markup, Telegraf } from "telegraf";
import { Collection } from "mongodb";
import EventEmitter = require("events");
import { TargetUpdateInfo } from "./types";

export class UserUpdatesHandler {
    private _userId: number;

    public onError: (err: Error) => void = (err) => { throw err; };
    public onUpdate?: (update: TargetUpdateInfo) => Promise<void>;

    constructor(userId: number) {
        this._userId = userId;
    }

    public async handleUpdates(): Promise<void> {
        const userData = await store.get(`${this._userId}`);

        if (!userData) {
            this.onError(new Error(`User with id "${this._userId}" not found.`));
            return;
        }
        
        const client = await getClient(userData.auth.session);
        const bot = getTelegrafBot();
        
        try {
            for (const chat of userData?.chats ?? []) {
                await this.handleChatUpdates(userData, chat, client, bot);
            }
        }
        catch (e) {
            console.error("Error while handling user updates. User ID:", this._userId, ".", e);
        }
        finally {
            await client.disconnect();
            await store.set(`${this._userId}`, userData);
        }
    }

    private async handleChatUpdates(userData: CustomSession, chatItem: ChatItem, client: TelegramClient, bot: Telegraf): Promise<void> {
        const chat = await client.getEntity(chatItem.id) as Api.Channel;
        const updates = await client.getMessages(chatItem.id, {
            search: "wordpress",
            limit: 100,
            minId: chatItem.lastMessageId ?? 0
        });

        if (updates.length === 0) return;

        for (const message of updates) {
            await this.onUpdate?.({ userId: this._userId, chat, message });
        }

        chatItem.lastMessageId = Math.max(...updates.map(u => u.id));
    }
}
