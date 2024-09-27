import { Command, Update, Use } from "nestjs-telegraf";
import { Context } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import { CustomContext, CustomSession } from "../interfaces/custom-context.interface";
import { TelegramClientService } from "src/telegram-client/telegram-client.service";

@Update()
export class PrivateCommandsService {
    constructor(
        private readonly _clientService: TelegramClientService
    ) { }

    @Use()
    async filterUnauthorizedUsers(ctx: CustomContext, next: () => Promise<void>) {
        if (ctx.session.auth?.isAuthorized)
            await next();
        else
            await ctx.reply("You should be authorized.");
    }

    @Command("exit")
    async exit(ctx: CustomContext) {
        try {
            await this._clientService.signoutUser(ctx.session.auth?.telegramSession ?? "")
            await ctx.reply("You are successfully logged-out.");
            ctx.session = null;
        }
        catch {
            await ctx.reply("Error while sign-out from Telegram.");
        }
    }
}
