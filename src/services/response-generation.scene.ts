import { Inject, Injectable } from "@nestjs/common";
import { Markup, Scenes } from "telegraf";
import { CustomContext } from "../types/custom-context.interfaces";
import { AIResponseGeneratorService } from "./ai-response-generator.service";
import { safeAction } from "../tools/telegram";
import { DEFAULT_GENERATE_RESPONSE_PROMPT, PromptNames } from "./ai.constants";

@Injectable()
export class ResponseGenerationScene extends Scenes.WizardScene<CustomContext> {
    constructor(
        @Inject(AIResponseGeneratorService) private readonly _responseGenerator: AIResponseGeneratorService
    ) {
        super("response-generation", 
            (ctx) => this.step1Handler(ctx),
            (ctx) => this.step2Handler(ctx)
        );

        this.action("send_response", async (ctx) => {
            const chatId = "chatId" in ctx.scene.state ? ctx.scene.state.chatId as number : null;
            const messageId = "messageId" in ctx.scene.state ? ctx.scene.state.messageId as number : null;

            this.handleSendResponse(ctx, chatId, messageId);
        });

        this.action("regenerate_response", async (ctx) => {
            this.handleRegenerateResponse(ctx);
        });

        this.action("regenerate_response_with_comment", async (ctx) => {
            this.handleRegenerateResponseWithComment(ctx);
        });

        this.action("cancel", async (ctx) => {
            this.handleCancel(ctx);
        });
    }

    async step1Handler(ctx: CustomContext) {
        const chatId = "chatId" in ctx.scene.state ? ctx.scene.state.chatId as number : null;
        const messageId = "messageId" in ctx.scene.state ? ctx.scene.state.messageId as number : null;

        if (!chatId || !messageId)
            return await ctx.reply("Chat ID and message ID are required to generate a response.");

        const message = await safeAction(ctx.session.auth.session, async (client) => {
            // TODO: entities preloading should be implemented in the future
            await client.getDialogs();
            const messages = await client.getMessages(`${chatId}`, { ids: messageId });
            return messages[0] ?? null;
        }, (err) => {
            ctx.reply(`Error while getting original message. Error: ${err.message}.`);
        });

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

    async step2Handler(ctx: CustomContext) {
        const chatId = "chatId" in ctx.scene.state ? ctx.scene.state.chatId as number : null;
        const messageId = "messageId" in ctx.scene.state ? ctx.scene.state.messageId as number : null;
        const commentText = ctx.text?.trim();

        await ctx.deleteMessage();
        await ctx.deleteMessages(ctx.scene.session.tempMessageIds);

        if (!chatId || !messageId)
            return await ctx.reply("Chat ID and message ID are required to generate a response.");

        const message = await safeAction(ctx.session.auth.session, async (client) => {
            // TODO: entities preloading should be implemented in the future
            await client.getDialogs();
            const messages = await client.getMessages(`${chatId}`, { ids: messageId });
            return messages[0] ?? null;
        }, (err) => {
            ctx.reply(`Error while getting original message. Error: ${err.message}.`);
        });

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

    async handleSendResponse(ctx: CustomContext, chatId: number | null, messageId: number | null): Promise<void> {
        if (!chatId || !messageId) {
            await ctx.reply("Chat ID and message ID are required to generate a response.");
            return;
        }

        const message = await safeAction(ctx.session.auth.session, async (client) => {
            await client.getDialogs();
            return await client.sendMessage(chatId, {
                message: ctx.scene.session.response_text,
                replyTo: messageId
            });
        }, (err) => {
            ctx.reply(`Error while getting original message. Error: ${err.message}.`);
        });

        if (!message) {
            await ctx.reply("Error while sending response.");
            return;
        }

        await ctx.deleteMessage();
        await ctx.answerCbQuery("Your response successfully sent.");
        await ctx.scene.leave();
    }

    async handleRegenerateResponse(ctx: CustomContext): Promise<void> {
        ctx.wizard.selectStep(0);
        await ctx.deleteMessage();
        await this.step1Handler(ctx);
    }

    async handleRegenerateResponseWithComment(ctx: CustomContext): Promise<void> {
        ctx.wizard.selectStep(1);
        await ctx.deleteMessage();


        const keyboard = Markup.inlineKeyboard([
            Markup.button.callback("Cancel", "cancel")
        ]);
        const msg = await ctx.sendMessage("Please enter your comment to correct response generation:", keyboard);
        (ctx.scene.session.tempMessageIds ??= []).push(msg.message_id);
    }

    async handleCancel(ctx: CustomContext): Promise<void> {
        await ctx.deleteMessage();
        await ctx.scene.leave();
    }
}
