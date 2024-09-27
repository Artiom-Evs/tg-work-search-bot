import { Action, SceneEnter, Wizard, WizardStep } from "nestjs-telegraf";
import { DefaultPrompts, PromptNames } from "src/ai/ai.constants";
import { Markup, NarrowedContext } from "telegraf";
import { CustomContext } from "../interfaces/custom-context.interface";
import { CallbackQuery, Update } from "telegraf/typings/core/types/typegram";

@Wizard("prompts-management")
export class PromptsManagementScene {
    @SceneEnter()
    async enter(ctx: CustomContext) {
        await this.sendStartMessage(ctx);
    }

    @WizardStep(1)
    async step1(ctx: CustomContext) {
        ctx.session.customPrompts ??= {};
        ctx.session.customPrompts[ctx.scene.session.promptName ?? ""] = ctx.text?.trim() ?? "";

        await ctx.deleteMessage();
        await ctx.sendMessage(`Your prompt has been successfully updated.`);
        await ctx.scene.reenter();
    }

    @Action(/prompt_(.+)/)
    async prompt(ctx: NarrowedContext<CustomContext, Update.CallbackQueryUpdate<CallbackQuery & { data: string; }>>) {
        const promptName = ctx.callbackQuery.data.match(/prompt_(.+)/)?.[1];
        if (!promptName)
            return;

        ctx.scene.session.promptName = promptName;
        const currentPrompt = ctx.session.customPrompts?.[promptName];

        await ctx.deleteMessage();

        if (currentPrompt) {
            const defaultKeyboard = Markup.inlineKeyboard([
                Markup.button.callback("Edit", "edit"),
                Markup.button.callback("Reset", "reset"),
                Markup.button.callback("Cancel", "cancel")
            ]);
            const message = `Your current prompt is:\n\n${currentPrompt}`;

            await ctx.reply(message, defaultKeyboard);
        }
        else {
            const defaultPrompt = DefaultPrompts[promptName as PromptNames];
            const defaultKeyboard = Markup.inlineKeyboard([
                Markup.button.callback("Customize", "edit"),
                Markup.button.callback("Cancel", "cancel")
            ]);

            const message = `Your current prompt is default:\n\n${defaultPrompt}`;

            await ctx.sendMessage(message, defaultKeyboard);
        }

    }

    @Action("edit")
    async edit(ctx: CustomContext) {
        const currentPrompt = ctx.session.customPrompts?.[ctx.scene.session.promptName ?? ""] ?? DefaultPrompts[ctx.scene.session.promptName ?? ""];
        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Cancel", "cancel")
        ]);

        await ctx.deleteMessage();
        await ctx.reply(`Your current prompt is:\n\n${currentPrompt}.\n\nEnter a new prompt:`, keyboard);
    }

    @Action("reset")
    async reset(ctx: CustomContext) {
        delete ctx.session.customPrompts?.[ctx.scene.session.promptName ?? ""];
        await ctx.deleteMessage();
        await ctx.sendMessage("Prompt has been reset.");
        await ctx.scene.reenter();
    }

    @Action("cancel")
    async cancel(ctx: CustomContext) {
        await ctx.deleteMessage();
        await ctx.scene.leave()
    }

    private async sendStartMessage(ctx: CustomContext) {
        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Define target messages", `prompt_${PromptNames.DefineTargetMessages}`),
            Markup.button.callback("Generate response", `prompt_${PromptNames.GenerateResponse}`),
            Markup.button.callback("Cancel", "cancel")
        ], {
            columns: 1
        });

        await ctx.sendMessage("Please select a prompt to customize:", keyboard);
    }
}
