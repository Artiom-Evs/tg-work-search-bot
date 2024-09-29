import { Action, Command, Update, Use } from "nestjs-telegraf";
import { Context, NarrowedContext } from "telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import { CustomContext, CustomSession } from "../interfaces/custom-context.interface";
import { TelegramClientService } from "src/telegram-client/telegram-client.service";
import { CallbackQuery, Update as TFUpdate } from "telegraf/typings/core/types/typegram";

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

    @Command("chats")
    async chats(ctx: CustomContext) {
        await ctx.scene.enter("chats-selection");
    }

    @Command("prompts")
    async prompts(ctx: CustomContext) {
        await ctx.scene.enter("prompts-management");
    }

    @Action("delete_notification")
    async deleteNotification(ctx: CustomContext) {
        await ctx.deleteMessage();
    }

    @Action(/generate_response_(.+)-(.+)/)
    async generateResponse(ctx: NarrowedContext<CustomContext, TFUpdate.CallbackQueryUpdate<CallbackQuery & { data: string; }>>) {
        const chatId = Number(ctx.callbackQuery.data.match(/generate_response_(.+)-(.+)/)?.[1]);
            const messageId = Number(ctx.callbackQuery.data.match(/generate_response_(.+)-(.+)/)?.[2]);
            
            if (chatId && messageId)
                await ctx.scene.enter("response-generation", { chatId, messageId });
            else
            await ctx.answerCbQuery("Invalid callback data!");
    }
}
