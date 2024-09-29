import { Markup } from "telegraf";
import { CustomContext } from "../interfaces/custom-context.interface";
import { AIResponseGeneratorService } from "../../ai/ai-response-generator.service";
import { DEFAULT_GENERATE_RESPONSE_PROMPT, PromptNames } from "../../ai/ai.constants";
import { Action, Wizard, SceneEnter, WizardStep } from "nestjs-telegraf";
import { TelegramClientService } from "src/telegram-client/telegram-client.service";

@Wizard("response-generation")
export class ResponseGenerationScene {
    constructor(
        private readonly _responseGenerator: AIResponseGeneratorService,
        private readonly _clientService: TelegramClientService
    ) { }

    @SceneEnter()
    async enter(ctx: CustomContext) {
        const chatId = "chatId" in ctx.scene.state ? ctx.scene.state.chatId as number : null;
        const messageId = "messageId" in ctx.scene.state ? ctx.scene.state.messageId as number : null;

        if (!chatId || !messageId)
            return await ctx.reply("Chat ID and message ID are required to generate a response.");

        const message = await this._clientService.getChatMessage(ctx.session.auth.telegramSession ?? "", chatId, messageId);
        if (!message)
            return await ctx.reply("Original message not found.");

        ctx.scene.session.response_text = await this._responseGenerator.generateResponse(message, ctx.session.customPrompts?.[PromptNames.GenerateResponse]);

        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Send", "send_response"),
            Markup.button.callback("Regenerate", "regenerate_response"),
            Markup.button.callback("Cancel", "cancel"),
            Markup.button.callback("Regenerate with comment", "regenerate_response_with_comment"),
        ], {
            wrap: (_, i) => i === 3
        });
        await ctx.reply(`Generated response:\n\n${ctx.scene.session.response_text}`, keyboard);
    }

    // uses as a terminator for user messages
    @WizardStep(1)
    step1() {
        console.log("Step 1");
    }

    @WizardStep(2)
    async step2(ctx: CustomContext) {
        console.log("Step 2");

        const chatId = "chatId" in ctx.scene.state ? ctx.scene.state.chatId as number : null;
        const messageId = "messageId" in ctx.scene.state ? ctx.scene.state.messageId as number : null;
        const commentText = ctx.text?.trim();

        await ctx.deleteMessage();
        await ctx.deleteMessages(ctx.scene.session.tempMessageIds);

        if (!chatId || !messageId)
            return await ctx.reply("Chat ID and message ID are required to generate a response.");

        const message = await this._clientService.getChatMessage(ctx.session.auth.telegramSession ?? "", chatId, messageId);

        if (!message)
            return await ctx.reply("Original message not found.");

        const modifiedPrompt = !!ctx.session.customPrompts?.[PromptNames.GenerateResponse]
            ? ctx.session.customPrompts?.[PromptNames.GenerateResponse] + "\n" + commentText
            : DEFAULT_GENERATE_RESPONSE_PROMPT + "\n" + commentText;

        ctx.scene.session.response_text = await this._responseGenerator.generateResponse(message, modifiedPrompt);

        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Send", "send_response"),
            Markup.button.callback("Regenerate", "regenerate_response"),
            Markup.button.callback("Cancel", "cancel"),
            Markup.button.callback("Regenerate with comment", "regenerate_response_with_comment"),
        ], {
            wrap: (_, i) => i === 3
        });
        await ctx.reply(`Generated response:\n\n${ctx.scene.session.response_text}`, keyboard);
    }

    @Action("send_response")
    private async sendResponse(ctx: CustomContext) {
        const chatId = "chatId" in ctx.scene.state ? ctx.scene.state.chatId as number : null;
        const messageId = "messageId" in ctx.scene.state ? ctx.scene.state.messageId as number : null;

        if (!chatId || !messageId) {
            await ctx.reply("Chat ID and message ID are required to generate a response.");
            return;
        }

        const message = await this._clientService.sendMessage(ctx.session.auth.telegramSession ?? "", chatId, ctx.scene.session.response_text, messageId);

        if (!message) {
            await ctx.reply("Error while sending response.");
            return;
        }

        await ctx.deleteMessage();
        await ctx.answerCbQuery("Your response successfully sent.");
        await ctx.scene.leave();
    }

    @Action("regenerate_response")
    private async regenerateResponse(ctx: CustomContext) {
        await ctx.deleteMessage();
        await ctx.scene.reenter();
    }

    @Action("regenerate_response_with_comment")
    async regenerateResponseWithComment(ctx: CustomContext) {
        await ctx.deleteMessage();
        await ctx.wizard.next();

        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Cancel", "cancel")
        ]);
        
        const msg = await ctx.sendMessage("Please enter your comment to correct response generation:", keyboard);
        (ctx.scene.session.tempMessageIds ??= []).push(msg.message_id);
    }

    @Action("cancel")
    async cancel(ctx: CustomContext) {
        await ctx.deleteMessage();
        await ctx.scene.leave();
    }
}
