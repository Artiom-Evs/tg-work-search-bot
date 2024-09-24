import { Markup, Scenes } from "telegraf";
import { CustomContext } from "../types/custom-context.interfaces";
import { DEFAULT_DEFINE_TARGET_MESSAGES_PROMPT, DEFAULT_GENERATE_RESPONSE_PROMPT, PromptNames } from "../services/AI/constants";

const promptsScene = new Scenes.WizardScene<CustomContext>(
    "prompts",
    step1Handler,
    step2Handler
);

promptsScene.action("cancel", async (ctx) => {
    await deleteMessages(ctx);
    await ctx.scene.leave()
});

promptsScene.action(/prompt_(.+)/, async (ctx) => {
    ctx.scene.session.promptName = ctx.match[1];
    const currentPrompt = ctx.session.customPrompts?.[ctx.scene.session.promptName ?? ""];

    await deleteMessages(ctx);

    if (currentPrompt) {
        const defaultKeyboard = Markup.inlineKeyboard([
            Markup.button.callback("Edit", "edit"),
            Markup.button.callback("Reset", "reset"),
            Markup.button.callback("Cancel", "cancel")
        ]);
        const message = `Your current prompt is:\n\n${currentPrompt}`;

        await ctx.sendMessage(message, defaultKeyboard);
    }
    else {
        const defaultKeyboard = Markup.inlineKeyboard([
            Markup.button.callback("Customize", "edit"),
            Markup.button.callback("Cancel", "cancel")
        ]);
        const defaultPrompt = getDefaultPrompt(ctx.scene.session.promptName ?? "");;
        const message = `Your current prompt is default:\n\n${defaultPrompt}`;

        await ctx.sendMessage(message, defaultKeyboard);
    }
});

promptsScene.action("edit", async (ctx) => {
    const currentPrompt = ctx.session.customPrompts?.[ctx.scene.session.promptName ?? ""] ?? getDefaultPrompt(ctx.scene.session.promptName ?? "");
    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("Cancel", "cancel")
    ]);

    
    await ctx.wizard.next();
    await deleteMessages(ctx);
    const msg = await ctx.sendMessage(`Your current prompt is:\n\n${currentPrompt}.\n\nEnter a new prompt:`, keyboard);

    (ctx.scene.session.tempMessageIds ??= []).push(msg.message_id);
});

promptsScene.action("reset", async (ctx) => {
    delete ctx.session.customPrompts?.[ctx.scene.session.promptName ?? ""];
    await deleteMessages(ctx);
    const msg = await ctx.sendMessage("Prompt has been reset.");
    await ctx.wizard.selectStep(0);
    await sendStartMessage(ctx);

    (ctx.scene.session.tempMessageIds ??= []).push(msg.message_id);
});

async function step1Handler(ctx: CustomContext) {
    await sendStartMessage(ctx);
}

async function step2Handler(ctx: CustomContext) {
    ctx.session.customPrompts ??= {};
    ctx.session.customPrompts[ctx.scene.session.promptName ?? ""] = ctx.text?.trim() ?? "";
    
    await deleteMessages(ctx);
    
    const msg = await ctx.sendMessage(`Your prompt has been successfully updated.`);
    (ctx.scene.session.tempMessageIds ??= []).push(msg.message_id);

    ctx.wizard.selectStep(0);
    await sendStartMessage(ctx);
}

async function sendStartMessage(ctx: CustomContext) {
    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("Define target messages", `prompt_${PromptNames.DefineTargetMessages}`),
        Markup.button.callback("Generate response", `prompt_${PromptNames.GenerateResponse}`),
        Markup.button.callback("Cancel", "cancel")
    ], {
        columns: 1
    });

    await ctx.sendMessage("Please select a prompt to customize:", keyboard);
}

async function deleteMessages(ctx: CustomContext) {
    await ctx.deleteMessage();
    if (ctx.scene.session.tempMessageIds?.length > 0) {
        await ctx.deleteMessages(ctx.scene.session.tempMessageIds);
        ctx.scene.session.tempMessageIds = [];
    }
}

function getDefaultPrompt(name: string): string {
    switch (name) {
        case PromptNames.DefineTargetMessages:
            return DEFAULT_DEFINE_TARGET_MESSAGES_PROMPT;
        case PromptNames.GenerateResponse:
            return DEFAULT_GENERATE_RESPONSE_PROMPT;
        default:
            throw new Error(`Unknown prompt name: "${name}".`);
    };
}

export default promptsScene;
