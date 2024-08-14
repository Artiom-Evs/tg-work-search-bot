import { Scenes, Telegraf } from "telegraf";
import { CustomContext } from "./customContext";
import sessionMiddleware from "./middlewares/sessionMiddleware";
import authScene from "./scenes/authScene";
import publicCommands from "./commands/publicCommands";
import privateCommands from "./commands/privateCommands";
import setChatsScene from "./scenes/setChatsScene";
import * as searchWorker from "./workers/SearchWorker";
import { getTelegrafBot } from "./tools/telegram";
import { initBotCommands } from "./tools/setBotCommands";

const bot = getTelegrafBot<CustomContext>();
const stage = new Scenes.Stage<CustomContext>([ authScene, setChatsScene ], { defaultSession: ({ }) });

bot.use(sessionMiddleware);
bot.use(stage.middleware());

bot.use(publicCommands);
bot.use(privateCommands);

process.once('SIGINT', () => { bot.stop('SIGTERM'); searchWorker.stop() });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); searchWorker.stop() });

bot.launch();
searchWorker.start();
initBotCommands();

console.log("Bot is running...");
