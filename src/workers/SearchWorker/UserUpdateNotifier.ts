import { Markup, Telegraf } from "telegraf";
import { getTelegrafBot } from "../../tools/telegram";
import { Api } from "telegram";
import { TargetUpdateInfo } from "./types";

class UpserUpdateNotifier {
    private _bot = getTelegrafBot();

    constructor() {
        this.notifyUser = this.notifyUser.bind(this);
    }

    public async notifyUser(update: TargetUpdateInfo): Promise<void> {
        const keyboard = this.getKeyboard();
        const notificationText = this.getNotificationText(update);

        await this._bot.telegram.sendMessage(update.userId, notificationText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: "MarkdownV2"
        });
    }

    private getKeyboard() {
        return Markup.inlineKeyboard([
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
        const chatTitle = this.escapText(update.chat.title);
        
        return `[Message](${messageLink}) found in the "${chatTitle}" chat\\.`;
    }

    private escapText(text: string): string {
        return text.replace(/_/g, "\\_").replace(/-/g, "\\-");
    }
}

const updateNotifier = new UpserUpdateNotifier();
export default updateNotifier;
