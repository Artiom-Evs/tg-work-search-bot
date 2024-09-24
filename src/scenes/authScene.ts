import { Scenes } from "telegraf";
import { CustomContext } from "../types/custom-context.interfaces";
import { getClient } from "../tools/telegram";

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

    const client = await getClient("");
    
    try {
        await client.sendCode({ apiId: client.apiId, apiHash: client.apiHash }, phoneNumber );
        await ctx.reply(`Please enter the code you received from Telegram separated by whitespace (for example, "1 2 3 4 5"):`);

        ctx.scene.session.phoneNumber = phoneNumber;
        ctx.session.auth.session = client.session.save() as any as string;
        return ctx.wizard.next();
    }
    catch (e: any) {
        console.error("Error while sending authorization code.", e);
        await ctx.reply(`Failed to send authorization code. Please try again. Error: ${e?.message ?? e}.`);
    }
    finally {
        await client.disconnect();
        await client.destroy();
    }
}

async function step3Handler(ctx: CustomContext) {
    ctx.scene.session.secretCode = ctx.text?.replace(" ", "");

    await ctx.reply(`Please enter your password (if you don't use it, enter "-"):`);
    return ctx.wizard.next();
}

async function step4Handler(ctx: CustomContext) {
    const client = await getClient(ctx.session.auth.session);
    
    try {
        await client.signInUser({ apiId: client.apiId, apiHash: client.apiHash }, {
            phoneNumber: ctx.scene.session.phoneNumber ?? "",
            phoneCode: async () => ctx.scene.session.secretCode ?? "",
            password: async () => (ctx.text && ctx.text != "-" ? ctx.text : ""),
            onError: (err) => { throw err }
        });

        ctx.session.auth = {
            isAuthorized: true,
            session: client.session.save() as any as string
        };
    }
    catch (e) {
        console.error("Error while sign-in Telegram.", e);
        await ctx.reply('Failed to sign in. Please check your credentials and try again.');
    }
    finally {
        await client.disconnect();
        await client.destroy();
    }
    await ctx.reply("You are successfully authorized!");
    return ctx.scene.leave();
}

export default authScene;
