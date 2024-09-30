import { Injectable } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf, Markup, NarrowedContext } from "telegraf";
import { TargetChatUpdateInfo } from "../interfaces/chat-update-info.interfaces";
import markdownEscape = require("markdown-escape");

interface SendNotificationParams {
    update: TargetChatUpdateInfo;
    generatedResponseText: string;
    generatedResponseId: string;
}

@Injectable()
export class BotMessageSenderService {
    constructor(
        @InjectBot() private readonly _bot: Telegraf
    ) { }

    async sendTargetMessageNotification(params: SendNotificationParams): Promise<void> {
        const keyboard = this.getTargetMessageKeyboard(params.update, params.generatedResponseId);
        const notificationText = this.getNotificationText(params.update, params.generatedResponseText);

        await this._bot.telegram.sendMessage(params.update.userId, notificationText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: "Markdown"
        });
    }

    private getTargetMessageKeyboard(update: TargetChatUpdateInfo, generatedResponseId: string) {
        return Markup.inlineKeyboard([
            Markup.button.callback("Send", `send_preview_generated_response_${generatedResponseId}`),
            Markup.button.callback("Change response", `generate_response_${update.chat.id}-${update.message.id}`),
            Markup.button.callback("Delete", "delete_notification"),
        ]);
    }

    private getMessageLink(chatId: number, messageId?: number): string {
        return `https://t.me/c/${chatId}/${messageId ?? ""}`;
    }

        private getNotificationText(update: TargetChatUpdateInfo, generatedResponse: string): string {
        const messageId = update.message.id;
        const chatId = Number(update.message.chat?.id ?? 0);
        const messageLink = this.getMessageLink(chatId, messageId);
        const chatTitle = markdownEscape(update.chat.title);
        const summaryText = markdownEscape(update.summary);
        
        return `
i[Message](${messageLink}) found in the "${chatTitle}" chat\.

Text: ${markdownEscape(update.message.text)}

Summary: ${summaryText}

Generated response:
${generatedResponse}
`;
    }
}
