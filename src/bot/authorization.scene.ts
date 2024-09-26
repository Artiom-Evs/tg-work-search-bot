import { Action, SceneEnter, SceneLeave, Wizard, WizardStep,  } from "nestjs-telegraf";
import { Markup } from "telegraf";
import { WizardContext } from "telegraf/typings/scenes";

@Wizard("authorization")
export class AuthorizationScene {
    @SceneEnter()
    async enter(ctx: WizardContext) {
        await ctx.reply("Please, enter your login");
        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Cancel", "cancel")
        ]);

        await ctx.reply("Please, enter your password", keyboard);
    }

    @SceneLeave()
    async leave(ctx) {
        await ctx.reply("Goodbye!");
    }

    @Action(/cancel/i)
    async cancel(ctx: WizardContext) {
        await ctx.reply("Authorization canceled");
        return ctx.scene.leave();
    }

    @WizardStep(1)
    async step1(ctx: WizardContext) {
        await ctx.reply("Please, enter your password");
        return ctx.wizard.next();
    }
}
