import { Command, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";

@Update()
export class PublicCommandsService {
    @Command("start")
    async start(ctx: SceneContext) {
        await ctx.scene.enter("authorization");
    }

    @Command("help")
    help(ctx: Context) {
        ctx.reply("This is a help message!");
    }
}
