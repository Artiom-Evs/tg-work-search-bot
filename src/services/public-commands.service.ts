import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { BotService } from "./bot.service";
import { Composer } from "telegraf";
import { CustomContext } from "../types/custom-context.interfaces";

@Injectable()
export class PublicCommandsService extends Composer<CustomContext> implements OnModuleInit {
    constructor(
        @Inject(BotService) private readonly _bot: BotService
    ) {
        super();

        this.start((ctx) => {
            ctx.scene.enter("authorization");
        });

        this.help(async (ctx) => {
            await ctx.reply("I'm sorry! I can't help you yet :(");
        });
    }

    onModuleInit() {
        this._bot.use(this);
    }
}
