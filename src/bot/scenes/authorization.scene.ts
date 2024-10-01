import { Action, Phone, SceneEnter, SceneLeave, Wizard, WizardStep, } from "nestjs-telegraf";
import { Markup } from "telegraf";
import { WizardContext } from "telegraf/scenes";
import { CustomContext } from "../interfaces/custom-context.interface";
import { Logger } from "@nestjs/common";
import { TelegramClientService } from "src/telegram-client/telegram-client.service";
import { Api } from "telegram";
import { Message } from "telegraf/typings/core/types/typegram";

@Wizard("authorization")
export class AuthorizationScene {
    private readonly _logger = new Logger(AuthorizationScene.name);

    constructor(
        private readonly _clientService: TelegramClientService
    ) { }

    @SceneEnter()
    async enter(ctx: CustomContext) {
        const message = await ctx.reply("Welcome! Please, enter your phone number:", Markup.inlineKeyboard([
            Markup.button.callback("Cancel", "cancel")
        ]));
        this.addToTempMessages(ctx, message);
    }

    @WizardStep(1)
    async handlePhoneNumberInput(ctx: CustomContext) {
        const phone = ctx.text;
        
        this.addToTempMessages(ctx);

        if (phone && !phone.match(/^\+[\d\s]+$/)) {
            const message = await ctx.reply("Invalid phone number format.");
            this.addToTempMessages(ctx, message);
            return;
        }

        ctx.scene.session.phoneNumber = phone;

        try {
            const sessionStr = await this._clientService.sendAuthorizationCode(phone);
            ctx.scene.session.telegramSession = sessionStr;

            const message = await ctx.reply(`Enter secret code separated by space (for example: "12 345"):`, Markup.inlineKeyboard([
                Markup.button.callback("Cancel", "cancel")
            ]));
            this.addToTempMessages(ctx, message);

            await ctx.wizard.next();
        }
        catch (e: any) {
            this._logger.error("Error while sending authorization code.", e);
            const message = await ctx.reply("Error while sending authorization code. Try again!");
            this.addToTempMessages(ctx, message);
            
            await ctx.scene.reenter();
        }
    }

    @WizardStep(2)
    async handleSecretCodeInput(ctx: CustomContext) {
        const secretCode = ctx.text.replace(" ", "");
        
        this.addToTempMessages(ctx);

        if (secretCode && !secretCode.match(/[ 0-9]/)) {
            const message = await ctx.reply("Invalid code format.");
            this.addToTempMessages(ctx, message);
            return;
        }

        ctx.scene.session.secretCode = secretCode;

        const message = await ctx.reply(`Enter your password (if you don't use it, enter "-"):`);
        this.addToTempMessages(ctx, message);

        await ctx.wizard.next();
    }


    @WizardStep(3)
    async handlePasswordInput(ctx: CustomContext) {
        // user sends "-" when he doesn't use password
        const password = ctx.text === "-" ? "" : ctx.text;

        this.addToTempMessages(ctx);

        try {
            const sessionStr = await this._clientService.signinUser(
                ctx.scene.session.telegramSession ?? "",
                ctx.scene.session.phoneNumber ?? "",
                ctx.scene.session.secretCode ?? "",
                password
            );

            ctx.session.auth = {
                isAuthorized: true,
                telegramSession: sessionStr
            };

            await ctx.reply("You are successfully authorized!");
            await ctx.scene.leave();
        }
        catch (err) {
            this._logger.error("Error while completing user authorization.", err);
            const message = await ctx.reply("Error while login into Telegram. Try again!");
            this.addToTempMessages(ctx, message);

            await ctx.scene.reenter();
        }
    }

    @Action("cancel")
    async cancel(ctx: CustomContext) {
        return ctx.scene.leave();
    }

    @SceneLeave()
    async leave(ctx: CustomContext) {
        console.debug("IDS:", ctx.scene.session.tempMessageIds);
        if (ctx.scene.session.tempMessageIds?.length > 0)
            await ctx.deleteMessages(ctx.scene.session.tempMessageIds);
    }

    private addToTempMessages(ctx: CustomContext, message?: Message.TextMessage) {
        if (message)
            (ctx.scene.session.tempMessageIds ??= []).push(message.message_id);
        else
            (ctx.scene.session.tempMessageIds ??= []).push(ctx.message.message_id);
    }
}
