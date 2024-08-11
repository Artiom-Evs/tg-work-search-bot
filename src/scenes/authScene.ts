import { Scenes } from "telegraf";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { CustomContext } from "../customContext";

const apiId = parseInt(process.env.API_ID ?? "");
const apiHash = process.env.API_HASH ?? "";

if (!apiId || !apiHash)
    throw new Error(`"API_ID" and "API_HASH" environment variables should be defined.`);

const authScene = new Scenes.WizardScene<CustomContext>(
    "authorization",
    step1Handler,
    step2Handler,
    step3Handler,
    step4Handler
);

authScene.use(async (ctx, next) => {
    if (ctx.session.auth.isAuthorized) {
        await ctx.reply("You are already authorized.");
        return ctx.scene.leave();
    }
    await next();
});

async function step1Handler(ctx: CustomContext) {
    await ctx.reply("Welcome! Please, enter your phone number:");
    return ctx.wizard.next();
}

async function step2Handler(ctx: CustomContext) {
    // TODO: implement phone number validation
    const phoneNumber = ctx.text ?? "";

    const session = new StringSession("");
    const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
    await client.connect();

    try {
        await client.sendCode({ apiId, apiHash }, phoneNumber );
        await ctx.reply(`Please enter the code you received from Telegram separated by whitespace (for example, "1 2 3 4 5"):`);

        ctx.scene.session.phoneNumber = phoneNumber;
        ctx.session.auth.session = session.save();
        return ctx.wizard.next();
    }
    catch (e: any) {
        console.error("Error while sending authorization code.", e);
        await ctx.reply(`Failed to send authorization code. Please try again. Error: ${e?.message ?? e}.`);
    }
    finally {
        await client.disconnect();
    }
}

async function step3Handler(ctx: CustomContext) {
    ctx.scene.session.secretCode = ctx.text?.replace(" ", "");

    await ctx.reply(`Please enter your password (if you don't use it, enter "-"):`);
    return ctx.wizard.next();
}

async function step4Handler(ctx: CustomContext) {
    const session = new StringSession(ctx.session.auth.session);
    const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });
    await client.connect();

    try {
        await client.signInUser({ apiId, apiHash }, {
            phoneNumber: ctx.scene.session.phoneNumber ?? "",
            phoneCode: async () => ctx.scene.session.secretCode ?? "",
            password: async () => (ctx.text && ctx.text != "-" ? ctx.text : ""),
            onError: (err) => { throw err }
        });

        ctx.session.auth = {
            isAuthorized: true,
            session: session.save()
        };
    }
    catch (e) {
        console.error("Error while sign-in Telegram.", e);
        await ctx.reply('Failed to sign in. Please check your credentials and try again.');
    }
    finally {
        await client.disconnect();
    }
    await ctx.reply("You are successfully authorized!");
    return ctx.scene.leave();
}

export default authScene;
