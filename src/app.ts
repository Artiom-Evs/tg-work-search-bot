import { Scenes, Telegraf } from "telegraf";
import { CustomContext } from "./customContext";
import sessionMiddleware from "./middlewares/sessionMiddleware";
import authScene from "./scenes/authScene";
import publicCommands from "./commands/publicCommands";
import privateCommands from "./commands/privateCommands";

const botToken = process.env.BOT_TOKEN;

if (!botToken)
    throw new Error(`"BOT_TOKEN" environment variables should be defined.`);

const bot = new Telegraf<CustomContext>(botToken );
const stage = new Scenes.Stage<CustomContext>([ authScene ], { defaultSession: ({ }) });

bot.use(sessionMiddleware);
bot.use(stage.middleware());

bot.use(publicCommands);
bot.use(privateCommands);

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
bot.launch();
console.log("Bot is running...");
