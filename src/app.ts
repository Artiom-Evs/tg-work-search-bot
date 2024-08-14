import { Scenes, Telegraf } from "telegraf";
import { CustomContext } from "./customContext";
import sessionMiddleware from "./middlewares/sessionMiddleware";
import authScene from "./scenes/authScene";
import publicCommands from "./commands/publicCommands";
import privateCommands from "./commands/privateCommands";
import setChatsScene from "./scenes/setChatsScene";
import { getTelegrafBot } from "./tools/telegram";

const bot = getTelegrafBot<CustomContext>();
const stage = new Scenes.Stage<CustomContext>([ authScene, setChatsScene ], { defaultSession: ({ }) });

bot.use(sessionMiddleware);
bot.use(stage.middleware());

bot.use(publicCommands);
bot.use(privateCommands);

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
bot.launch();
console.log("Bot is running...");
