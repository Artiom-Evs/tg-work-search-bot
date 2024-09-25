import { Inject, Injectable } from "@nestjs/common";
import { BotService } from "./bot.service";
import { TargetChatUpdateInfo } from "../types/chat-update-info.interfaces";
import { Markup } from "telegraf";
import markdownEscape = require("markdown-escape");

@Injectable()
export class BotMessageSenderService {
    constructor(
        @Inject(BotService) private readonly _bot: BotService
    ) { }

    async sendTargetMessageNotification(update: TargetChatUpdateInfo): Promise<void> {
        const keyboard = this.getTargetMessageKeyboard(update);
        const notificationText = this.getNotificationText(update);

        await this._bot.telegram.sendMessage(update.userId, notificationText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: "Markdown"
        });
    }

    private getTargetMessageKeyboard(update: TargetChatUpdateInfo) {
        return Markup.inlineKeyboard([
            Markup.button.callback("Generate response", `generate_response_${update.chat.id}-${update.message.id}`),
            Markup.button.callback("Delete", "delete_notification"),
        ]);
    }

    private getMessageLink(chatId: number, messageId?: number): string {
        return `https://t.me/c/${chatId}/${messageId ?? ""}`;
    }

        private getNotificationText(update: TargetChatUpdateInfo): string {
        const messageId = update.message.id;
        const chatId = Number(update.message.chat?.id ?? 0);
        const messageLink = this.getMessageLink(chatId, messageId);
        const chatTitle = markdownEscape(update.chat.title);
        const summaryText = markdownEscape(update.summary);
        
        return `[Message](${messageLink}) found in the "${chatTitle}" chat\\.

Summary: ${summaryText}
        `;
    }

}
