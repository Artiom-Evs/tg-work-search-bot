import { Command, Update } from "nestjs-telegraf";
import { Context } from "telegraf";

@Update()
export class PublicCommandsService {
    @Command("start")
    start(ctx: Context) {
        ctx.reply("Hello! I am a bot!");
    }

    @Command("help")
    help(ctx: Context) {
        ctx.reply("This is a help message!");
    }
}
