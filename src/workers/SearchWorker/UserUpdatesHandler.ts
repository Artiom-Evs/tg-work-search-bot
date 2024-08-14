import { Api, TelegramClient } from "telegram";
import { ChatItem, CustomSession } from "../../customContext";
import { store } from "../../middlewares/sessionMiddleware";
import { getClient, getTelegrafBot } from "../../tools/telegram";
import { Markup, Telegraf } from "telegraf";
import { Collection } from "mongodb";

export async function handleUserUpdates(userId: number): Promise<void> {
    const userData = await store.get(`${userId}`);

    if (!userData)
        throw new Error(`User with id "${userId}" not found.`);;

    const client = await getClient(userData.auth.session);
    const bot = getTelegrafBot();
    
    try {
        for (const chat of userData?.chats ?? []) {
            await handleUserChatUpdates(userId, userData, chat, client, bot);
        }
    }
    catch (e) {
        console.error("Error while handling user updates. User ID:", userId, ".", e);
    }
    finally {
        await client.disconnect();
        await store.set(`${userId}`, userData);
    }
}

async function handleUserChatUpdates(userId: number, userData: CustomSession, chat: ChatItem, client: TelegramClient, bot: Telegraf): Promise<void> {
    const updates = await client.getMessages(chat.id, {
        search: "wordpress",
        limit: 100,
        minId: chat.lastMessageId ?? 0
    });

    if (updates.length === 0) return;

    for (const message of updates) {
        await sendSearchNotification(userId, message, bot);
    }

    chat.lastMessageId = Math.max(...updates.map(u => u.id));
}

async function sendSearchNotification(userId: number, message: Api.Message, bot: Telegraf): Promise<void> {
    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("Delete", "delete_notification"),
    ]);

    const messageId = message.id;
    const messageChatId = message.chat?.id;
    
    const messageText = `https://t.me/c/${messageChatId}/${messageId}`
        + `\nI found a new message with the word "wordpress".`;

    await bot.telegram.sendMessage(userId, messageText, {
        reply_markup: keyboard.reply_markup
    });

    //console.debug("MESSAGE:", (userMessage as any)[0][0]);
}
