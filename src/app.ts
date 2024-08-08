import { Telegraf, Context, Markup, session } from "telegraf";
import { Mongo } from "@telegraf/session/mongodb";
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

interface AuthSessionData {
    auth: {
        isAuthorized: boolean,
        session?: string,
        phoneNumber?: string,
        phoneCodeHash?: string,
        secretCode?: string
    }
}

interface CustomContext extends Context {
    session: AuthSessionData
}
const botToken = process.env.BOT_TOKEN;
const apiId = parseInt(process.env.API_ID ?? "");
const apiHash = process.env.API_HASH;
const mongodbUrl = process.env.MONGODB_URL;

if (!botToken || !apiId || !apiHash || !mongodbUrl)
    throw new Error(`"BOT_TOKEN", "API_ID", "API_HASH" andd "MONGODB_URL" environment variables should be defined.`);

const store = Mongo<CustomContext>({
    url: mongodbUrl,
    database: "tg_work_search_bot"
});
const sessionStore = session({
    getSessionKey: (ctx: Context) => `${ctx.from?.id}`,
    store
});

const bot = new Telegraf<CustomContext>(botToken );

bot.use(sessionStore);

bot.start(async (ctx) => {
    ctx.session ??= { auth: { isAuthorized: false } };

    if (ctx.session.auth.isAuthorized)
        await ctx.reply("You are already authorized.");
    else 
    await ctx.reply("Welcome! Please send me your phone number:");
});

bot.on("text", async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text;

    if (ctx.session.auth.isAuthorized) {
        await ctx.reply("You are already authorized.");
        return;
    }

    const auth = ctx.session.auth;

    if (!auth.phoneNumber) {
        auth.phoneNumber = text;

        const session = new StringSession("");
        const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
        await client.connect();
        
        try {
            const result = await client.sendCode({ apiId, apiHash }, auth.phoneNumber);
            
            auth.phoneCodeHash = result.phoneCodeHash;
            auth.session = session.save();
            await ctx.reply(`Please enter the code you received from Telegram separated by whitespace (for example, "1 2 3 4 5"):`);
        } 
        catch (e: any) {
            console.error("Error while sending authorization code.", e);
            await ctx.reply(`Failed to send authorization code. Please try again. Error: ${e?.message ?? e}.`);
        }
        finally {
            client.disconnect();
        }
    } 
    else if (!auth.secretCode) {
        auth.secretCode = text.replace(" ", "");
        await ctx.reply(`Please enter your password (if you don't use it, enter "-"):`);
    } 
    else {
        const session = new StringSession(auth.session);
        const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
        await client.connect();

        try {
            await client.signInUser({ apiId, apiHash }, {
                phoneNumber: auth.phoneNumber,
                phoneCode: async () => auth.secretCode ?? "",
                password: text != "-" ? async () => text : undefined,
                onError: (err) => { throw err }
            });

            ctx.session.auth = { 
                isAuthorized: true, 
                session: session.save()
            };

            const me = await client.getMe();
            await ctx.reply(`You are logged in as ${me.firstName} ${me.lastName} (@${me.username})`);
        } 
        catch (e) {
            console.error("Error while sign-in Telegram.", e);
            await ctx.reply('Failed to sign in. Please check your credentials and try again.');
        }
        finally {
            client.disconnect();
        }
    }
});

bot.launch();

console.log("Bot is running...");
