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
        command: "chats",
        description: "Set chats to search"
    },
    {
        command: "prompts",
        description: "Set custom prompts"
    },
    {
        command: "me",
        description: "Get information about yourself"
    },
    {
        command: "exit",
        description: "Exit from the bot"
    }
];

export async function initBotCommands(): Promise<void> {
    const bot = getTelegrafBot();
    await bot.telegram.setMyCommands(commands);
}
