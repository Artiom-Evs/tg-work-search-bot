import { BotCommand } from "telegraf/typings/core/types/typegram";
import { getTelegrafBot } from "./telegram";

const commands: BotCommand[] = [
    {
        command: "start",
        description: "Start the bot"
    },
    {
        command: "help",
        description: "Get help"
    },
    {
        command: "exit",
        description: "Exit from the bot"
    },
    {
        command: "me",
        description: "Get information about yourself"
    },
    {
        command: "chats",
        description: "Set chats to search"
    }
];

export async function initBotCommands(): Promise<void> {
    const bot = getTelegrafBot();
    await bot.telegram.setMyCommands(commands);
}
