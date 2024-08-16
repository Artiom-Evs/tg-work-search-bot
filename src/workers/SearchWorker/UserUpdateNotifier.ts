import { Markup } from "telegraf";
import { getTelegrafBot } from "../../tools/telegram";
import { TargetUpdateInfo, UpdateInfo } from "./types";
import { message } from "telegram/client";

class UpserUpdateNotifier {
    private _bot = getTelegrafBot();

    constructor() {
        this.notifyUser = this.notifyUser.bind(this);
    }

    public async notifyUser(update: TargetUpdateInfo): Promise<void> {
        const keyboard = this.getKeyboard(update);
        const notificationText = this.getNotificationText(update);

        await this._bot.telegram.sendMessage(update.userId, notificationText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: "MarkdownV2"
        });
    }

    private getKeyboard(update: TargetUpdateInfo) {
        return Markup.inlineKeyboard([
            Markup.button.callback("Generate response", `generate_response_${update.chat.id}-${update.message.id}`),
            Markup.button.callback("Delete", "delete_notification"),
        ]);
    }

    private getLink(chatId: number, messageId?: number): string {
        return `https://t.me/c/${chatId}/${messageId ?? ""}`;
    }

        private getNotificationText(update: TargetUpdateInfo): string {
        const messageId = update.message.id;
        const chatId = Number(update.message.chat?.id ?? 0);
        const messageLink = this.getLink(chatId, messageId);
        const chatTitle = this.escapeText(update.chat.title);
        const summaryText = this.escapeText(update.summary);
        
        return `[Message](${messageLink}) found in the "${chatTitle}" chat\\.

Summary: ${summaryText}
        `;
    }

    private escapeText(text: string): string {
        return text.replace(/_/g, "\\_").replace(/-/g, "\\-").replace(/\./g, "\\.");
    }
}

const updateNotifier = new UpserUpdateNotifier();
export default updateNotifier;
