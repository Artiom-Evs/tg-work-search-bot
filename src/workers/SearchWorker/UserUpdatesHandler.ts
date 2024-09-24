import { Api, TelegramClient } from "telegram";
import { ChatItem, CustomSession } from "../../types/custom-context.interfaces";
import { store } from "../../middlewares/sessionMiddleware";
import { getClient, getTelegrafBot } from "../../tools/telegram";
import { Markup, Telegraf } from "telegraf";
import { Collection } from "mongodb";
import EventEmitter = require("events");
import { TargetUpdateInfo, UpdateInfo } from "./types";
import messageAnalyzer from "../../services/AI/MessageAnalyzer";
import { TargetMessageAIResponse } from "../../services/AI/types";
import { PromptNames } from "../../services/AI/constants";

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
        
        try {
            for (const chat of userData?.chats ?? []) {
                await this.handleChatUpdates(userData, chat, client);
            }
        }
        catch (e) {
            console.error("Error while handling user updates. User ID:", this._userId, ".", e);
        }
        finally {
            await client.disconnect();
            await client.destroy();
            await store.set(`${this._userId}`, userData);
        }
    }

    private async handleChatUpdates(userData: CustomSession, chatItem: ChatItem, client: TelegramClient): Promise<void> {
        const chat = await client.getEntity(chatItem.id) as Api.Channel;
        
        let messages = await client.getMessages(chatItem.id, {
            limit: 100,
            minId: chatItem.lastMessageId ?? 0,
        });

        messages = messages.filter(m => Number((m.fromId as any)?.userId ?? 0) !== this._userId);

        if (messages.length === 0) 
            return;

        const targetMessages = await messageAnalyzer.defineTargetMessages(messages, userData.customPrompts?.[PromptNames.DefineTargetMessages]);
        const targetUpdates = this.buildTargetUpdates(targetMessages, messages, chat);

        if (targetUpdates.length === 0) 
            return;

        for (const update of targetUpdates) {
            await this.onUpdate?.(update);
        }

        chatItem.lastMessageId = Math.max(...messages.map(m => m.id));
    }

    private buildTargetUpdates(targetMessages: TargetMessageAIResponse[], messages: Api.Message[], chat: Api.Channel): TargetUpdateInfo[] {
        return targetMessages.map(tm => {
            const message = messages.find(m => m.id === tm.messageId);

            if (!message) 
                throw new Error(`Uncorrect target message: ${JSON.stringify(tm, null, 4)}`)

            return {
                userId: this._userId,
                summary: tm.summary,
                chat,
                message,
            };
        })
    }
}
