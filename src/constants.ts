import { BotCommand } from "telegraf/typings/core/types/typegram";

export const BOT_COMMANDS: BotCommand[] = [
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
