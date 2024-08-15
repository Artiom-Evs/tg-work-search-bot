import { Composer } from "telegraf";
import { CustomContext } from "../customContext";
import { safeAction } from "../tools/telegram";
import sessionMiddleware, { store } from "../middlewares/sessionMiddleware";
import authMiddleware from "../middlewares/authMiddleware";
import { Api } from "telegram";

const privateCommands = new Composer<CustomContext>();

privateCommands.command("exit", authMiddleware, async (ctx) => {
    await safeAction(ctx.session.auth.session, async (client) => await client.invoke(new Api.auth.LogOut()));
    await store.delete(`${ctx.from.id}`);
    await ctx.reply("You have been successfully logged out.");
});

privateCommands.command("me", authMiddleware, async (ctx) => {
    const me = await safeAction(ctx.session.auth.session, async (client) => await client.getMe());
    if (!me)
        return await ctx.reply("Failed to get information about your Telegram profile.");
    
    await ctx.reply(
`Name: ${me.firstName} ${me.lastName ?? ""}
Username: ${me.username}
Phone: ${me.phone ?? "-"}
`);
});

privateCommands.command("chats", authMiddleware, async (ctx) => await ctx.scene.enter("set-chats"));
privateCommands.command("prompts", authMiddleware, async (ctx) => await ctx.scene.enter("prompts"));

privateCommands.action("delete_notification", async (ctx) => await ctx.deleteMessage());

export default privateCommands;
