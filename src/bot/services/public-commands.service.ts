import { Command, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import { CustomContext } from "../interfaces/custom-context.interface";

@Update()
export class PublicCommandsService {
    @Command("start")
    async start(ctx: CustomContext) {
        if (ctx.session.auth?.isAuthorized)
            await ctx.reply("You are already authorized!");
        else
            await ctx.scene.enter("authorization");
    }

    @Command("help")
    help(ctx: Context) {
        ctx.reply("This is a help message!");
    }
}
