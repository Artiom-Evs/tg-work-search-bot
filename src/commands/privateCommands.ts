import { Composer } from "telegraf";
import { CustomContext } from "../customContext";
import authMiddleware from "../middlewares/authMiddleware";
import { safeAction } from "../tools/telegram";
import { store } from "../middlewares/sessionMiddleware";
import { Api } from "telegram";

const privateCommands = new Composer<CustomContext>();

privateCommands.command("exit", authMiddleware, async (ctx) => {
    await safeAction(ctx.session.auth.session, async (client) => await client.invoke(new Api.auth.LogOut()));
    await store.delete(`${ctx.from.id}`);
    await ctx.reply("You have been successfully logged out.");
});

privateCommands.command("me", authMiddleware, async (ctx) => {
    const me = await safeAction(ctx.session.auth.session, async (client) => await client.getMe());
    if (me)
        await ctx.reply(`You are ${me.firstName} ${me.lastName} (${me.username}).`);
    else
        await ctx.reply("Failed to get information about your Telegram profile.");
});

export default privateCommands;
