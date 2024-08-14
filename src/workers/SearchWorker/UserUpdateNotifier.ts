import { Markup, Telegraf } from "telegraf";
import { getTelegrafBot } from "../../tools/telegram";
import { Api } from "telegram";

class UpserUpdateNotifier {
    private _bot = getTelegrafBot();

    constructor() {
        this.notifyUser = this.notifyUser.bind(this);
    }

    public async notifyUser(userId: number, message: Api.Message): Promise<void> {
        const messageId = message.id;
        const chatId = Number(message.chat?.id ?? 0);
        const link = this.getLink(chatId, messageId);
        const keyboard = this.getKeyboard();
        const notificationText = this.getNotificationText(link);

        await this._bot.telegram.sendMessage(userId, notificationText, {
            reply_markup: keyboard.reply_markup,
            parse_mode: "MarkdownV2"
        });
    }

    private getKeyboard() {
        return Markup.inlineKeyboard([
            Markup.button.callback("Delete", "delete_notification"),
        ]);
    }

    private getLink(chatId: number, messageId: number): string {
        return `https://t.me/c/${chatId}/${messageId}`;
    }

    private getNotificationText(link: string): string {
        return `[Message](${link}) found with the keyword "wordpress"\\.`;
    }
}

const updateNotifier = new UpserUpdateNotifier();
export default updateNotifier;
