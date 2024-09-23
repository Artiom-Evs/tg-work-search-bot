import { Markup, Scenes } from "telegraf";
import { SelectionChatItem, CustomContext } from "../customContext";
import { safeAction } from "../tools/telegram";

const PER_PAGE = 25;

const setChatsScene = new Scenes.WizardScene<CustomContext>(
    "set-chats",
    step1Handler
);

async function step1Handler(ctx: CustomContext) {
    ctx.scene.session.chats = await getChatItems(ctx.session.auth.session);
    
    ctx.scene.session.chats.forEach(chat => {
        chat.checked = ctx.session.chats?.some(c => c.id === chat.id) ?? false;
    });

    await sendChatsPickingMessage(ctx);
    await ctx.wizard.next();
};

setChatsScene.action(/toggle_(.+)/, async (ctx) => {
    const chatId = parseInt(ctx.match[1]);
    const chatItem = ctx.scene.session.chats?.find((item) => item.id === chatId);

    if (!chatItem)
        return await ctx.answerCbQuery("Chat not found.");

    chatItem.checked = !chatItem.checked;

    await updateChatsPickingMessage(ctx);
});

setChatsScene.action("previous_page", async (ctx) => {
    if (ctx.scene.session.pageNumber && ctx.scene.session.pageNumber > 1)
        ctx.scene.session.pageNumber -= 1;
    else 
        ctx.scene.session.pageNumber = 1;
    
        await updateChatsPickingMessage(ctx);
});

setChatsScene.action("next_page", async (ctx) => {
    ctx.scene.session.pageNumber = (ctx.scene.session.pageNumber ?? 1) + 1;

    await updateChatsPickingMessage(ctx);
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
    .filter(chat => !chat.archived && (chat.isChannel || chat.isGroup))
    .map(chat => ({
        id: Number(chat.id),
        title: chat.title ?? "",
        checked: false
    }));
}

function generateKeyboard(chatItems: SelectionChatItem[], pageNumber: number, perPage: number) {
    const pageItems = chatItems.slice((pageNumber - 1) * perPage, pageNumber * perPage);
    const pageButtons = pageItems.map((item, index) => [
        Markup.button.callback(
            `${item.checked ? "✅" : "⬜️"}  ${(pageNumber - 1) * perPage + 1 + index}. ${item.title}`,
            `toggle_${item.id}`)
    ]);

    return Markup.inlineKeyboard([
        ...pageButtons,
        [
            Markup.button.callback("<< Back", "previous_page", pageNumber === 1),
            Markup.button.callback("Next >>", "next_page", pageNumber * perPage >= chatItems.length)
        ],
        [
            Markup.button.callback("Accept", "accept"),
            Markup.button.callback("Cancel", "cancel"),
        ]
    ]);
}

async function sendChatsPickingMessage(ctx: CustomContext) {
    const keyboard = generateKeyboard(
        ctx.scene.session.chats ?? [], 
        ctx.scene.session.pageNumber ?? 1, 
        PER_PAGE);

    await ctx.reply("Select chats to search:", keyboard);
}

async function updateChatsPickingMessage(ctx: CustomContext) {
    const keyboard = generateKeyboard(
        ctx.scene.session.chats ?? [], 
        ctx.scene.session.pageNumber ?? 1, 
        PER_PAGE);

    await ctx.editMessageText("Select chats to search:", keyboard);
}

export default setChatsScene;
