import { Action, Phone, SceneEnter, SceneLeave, Wizard, WizardStep, } from "nestjs-telegraf";
import { Markup } from "telegraf";
import { WizardContext } from "telegraf/scenes";
import { CustomContext } from "../interfaces/custom-context.interface";
import { Logger } from "@nestjs/common";
import { TelegramClientService } from "src/telegram-client/telegram-client.service";

@Wizard("authorization")
export class AuthorizationScene {
    private readonly _logger = new Logger(AuthorizationScene.name);

    constructor(
        private readonly _clientService: TelegramClientService
    ) { }

    @SceneEnter()
    async enter(ctx: WizardContext) {
        await ctx.reply("Welcome! Please, enter your phone number:");
    }

    @WizardStep(1)
    async handlePhoneNumberInput(ctx: CustomContext) {
        const phone = ctx.text;

        if (phone && !phone.match(/^\+[\d\s]+$/)) {
            await ctx.reply("Invalid phone number format.");
            return;
        }

        ctx.scene.session.phoneNumber = phone;

        try {
            const sessionStr = await this._clientService.sendAuthorizationCode(phone);
            ctx.scene.session.telegramSession = sessionStr;

            await ctx.reply(`Enter secret code separated by space (for example: "12 345"):`);
            await ctx.wizard.next();
        }
        catch (e: any) {
            this._logger.error("Error while sending authorization code.", e);
            await ctx.reply("Error while sending authorization code. Try again!");
            await ctx.scene.reenter();
        }
    }

    @WizardStep(2)
    async handleSecretCodeInput(ctx: CustomContext) {
        const secretCode = ctx.text.replace(" ", "");

        if (secretCode && !secretCode.match(/[ 0-9]/)) {
            await ctx.reply("Invalid code format.");
            return;
        }

        ctx.scene.session.secretCode = secretCode;

        await ctx.reply(`Enter your password (if you don't use it, enter "-"):`);
        await ctx.wizard.next();
    }


    @WizardStep(3)
    async handlePasswordInput(ctx: CustomContext) {
        // user sends "-" when he doesn't use password
        const password = ctx.text === "-" ? "" : ctx.text;

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
            await ctx.reply("Error while login into Telegram. Try again!");
            await ctx.scene.reenter();
        }
    }
}
