import { Composer, Scenes, Telegraf } from "telegraf";
import { CustomContext } from "./customContext";
import authScene from "./scenes/authScene";
import authMiddleware from "./middlewares/authMiddleware";
import sessionMiddleware from "./middlewares/sessionMiddleware";

const botToken = process.env.BOT_TOKEN;

if (!botToken)
    throw new Error(`"BOT_TOKEN" environment variables should be defined.`);

const stage = new Scenes.Stage<CustomContext>([ authScene ], {
    defaultSession: ({ })
});

const publicCommands = new Composer<CustomContext>();
publicCommands.command("start", async (ctx) => await ctx.scene.enter("authorization"));
publicCommands.command("help", async (ctx) => await ctx.reply("I'm sorry! I can't help you yet :("));

const privateCommands = new Composer<CustomContext>();
privateCommands.command("exit", authMiddleware, async (ctx) => await ctx.reply("Functionality to exit does not implemented yet."));
privateCommands.command("me", authMiddleware, async (ctx) => await ctx.reply(JSON.stringify(ctx.session, null, 4)));

const bot = new Telegraf<CustomContext>(botToken );

bot.use(sessionMiddleware);
bot.use(stage.middleware());

bot.use(publicCommands);
bot.use(privateCommands);

publicCommands.start((ctx) => ctx.scene.enter("authorization"));

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
bot.launch();
console.log("Bot is running...");
