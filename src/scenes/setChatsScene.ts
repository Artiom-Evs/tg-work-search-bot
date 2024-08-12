import { Markup, Scenes } from "telegraf";
import { SelectionChatItem, CustomContext } from "../customContext";
import { safeAction } from "../tools/telegram";

const setChatsScene = new Scenes.WizardScene<CustomContext>(
    "set-chats",
    step1Handler
);

async function step1Handler(ctx: CustomContext) {
    ctx.scene.session.chats = await getChatItems(ctx.session.auth.session);
    
    ctx.scene.session.chats.forEach(chat => {
        chat.checked = ctx.session.chats?.some(c => c.id === chat.id) ?? false;
    });

    const keyboard = generateKeyboard(ctx.scene.session.chats);

    await ctx.reply("Select chats to search", keyboard);
    await ctx.wizard.next();
};

setChatsScene.action(/toggle_(.+)/, async (ctx) => {
    const chatId = parseInt(ctx.match[1]);
    const chatItem = ctx.scene.session.chats?.find((item) => item.id === chatId);

    if (!chatItem)
        return await ctx.answerCbQuery("Chat not found.");

    chatItem.checked = !chatItem.checked;

    return await ctx.editMessageText(
        "Select chats:",
        generateKeyboard(ctx.scene.session.chats ?? [])
    );
});

setChatsScene.action("accept", async (ctx) => {
    const selectedChats = ctx.scene.session.chats?.filter((item) => item.checked) ?? [];

    ctx.session.chats = selectedChats.map((chat) => ({ id: chat.id }));

    await ctx.deleteMessage();
    await ctx.scene.leave()
});

setChatsScene.action("cancel", async (ctx) => {
    await ctx.deleteMessage();
    await ctx.scene.leave()
});

async function getChatItems(userSession: string): Promise<SelectionChatItem[]> {
    const chats = await safeAction(userSession, async (client) => await client.getDialogs()) ??[];
    
    return chats
    .filter(chat => chat.isChannel || chat.isGroup)
    .map(chat => ({
        id: Number(chat.id),
        title: chat.title ?? "",
        checked: false
    }));
}

function generateKeyboard(chatItems: SelectionChatItem[]) {
    return Markup.inlineKeyboard(
        [
            ...chatItems.map((chatItem) =>
                Markup.button.callback(
                    `${chatItem.checked ? "✅" : "⬜️"} ${chatItem.title}`,
                    `toggle_${chatItem.id}`
                )
            ),
            ...[
                Markup.button.callback("Accept", "accept"),
                Markup.button.callback("Cancel", "cancel"),
            ]
        ],
        { columns: 1 }
    );
}

export default setChatsScene;
