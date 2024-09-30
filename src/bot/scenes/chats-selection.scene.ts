import { Action, Scene, SceneEnter } from "nestjs-telegraf";
import { TelegramClientService } from "src/telegram-client/telegram-client.service";
import { CustomContext, SelectionChatItem } from "../interfaces/custom-context.interface";
import { Markup, NarrowedContext } from "telegraf";
import { CallbackQuery, Update } from "telegraf/typings/core/types/typegram";

const PER_PAGE = 25;

@Scene("chats-selection")
export class ChatsSelectionScene {
    constructor(
        private readonly _clientService: TelegramClientService
    ) { }

    @SceneEnter()
    async enter(ctx: CustomContext) {
        ctx.scene.session.chats = await this.getSelectionItems(ctx);

        await this.sendChatsPickingMessage(ctx);
    }

    @Action(/toggle_(.+)/)
    async toggleItem(ctx: NarrowedContext<CustomContext, Update.CallbackQueryUpdate<CallbackQuery & { data: string; }>>) {
        const data = ctx.callbackQuery.data.match(/toggle_(.+)/)?.[1];
        const chatId = parseInt(data);

        const selectionItem = ctx.scene.session.chats?.find(c => c.id === chatId);
        if (!selectionItem)
            return;

        selectionItem.checked = !selectionItem.checked;
        await this.updateChatsPickingMessage(ctx);
    }

    @Action("back")
    async back(ctx: CustomContext) {
        if (ctx.scene.session.pageNumber && ctx.scene.session.pageNumber > 1)
            ctx.scene.session.pageNumber -= 1;
        else
            ctx.scene.session.pageNumber = 1;

        await this.updateChatsPickingMessage(ctx);
    }

    @Action("next")
    async next(ctx: CustomContext) {
        ctx.scene.session.pageNumber = (ctx.scene.session.pageNumber ?? 1) + 1;
        await this.updateChatsPickingMessage(ctx);
    }

    @Action("accept")
    async accept(ctx: CustomContext) {
        const selectedItems = ctx.scene.session.chats?.filter(c => c.checked) ?? [];
        ctx.session.chats = selectedItems.map(c => ({ id: c.id }));
        await ctx.deleteMessage();
        await ctx.scene.leave();
    }

    @Action("cancel")
    async cancel(ctx: CustomContext) {
        await ctx.deleteMessage();
        await ctx.scene.leave();
    }

    private async getSelectionItems(ctx: CustomContext): Promise<SelectionChatItem[]> {
        const chats = await this._clientService.getUserChats(ctx.session.auth?.telegramSession ?? "");
        const chatItems: SelectionChatItem[] = chats.map(c => ({
            id: Number(c.id),
            title: c.title,
            checked: false
        }));

        chatItems.forEach(c => {
            if (ctx.session.chats?.some(uc => uc.id === c.id))
                c.checked = true;
        });

        return chatItems;
    }

    private async sendChatsPickingMessage(ctx: CustomContext) {
        const keyboard = this.generateKeyboard(
            ctx.scene.session.chats ?? [],
            ctx.scene.session.pageNumber ?? 1,
            PER_PAGE);

        await ctx.reply("Select chats to search:", keyboard);
    }

    async updateChatsPickingMessage(ctx: CustomContext) {
        const keyboard = this.generateKeyboard(
            ctx.scene.session.chats ?? [],
            ctx.scene.session.pageNumber ?? 1,
            PER_PAGE);

        await ctx.editMessageText("Select chats to search:", keyboard);
    }

    private generateKeyboard(chatItems: SelectionChatItem[], pageNumber: number, perPage: number) {
        const pageItems = chatItems.slice((pageNumber - 1) * perPage, pageNumber * perPage);
        const pageButtons = pageItems.map((item, index) => [
            Markup.button.callback(
                `${item.checked ? "✅" : "⬜️"}  ${(pageNumber - 1) * perPage + 1 + index}. ${item.title}`,
                `toggle_${item.id}`)
        ]);

        return Markup.inlineKeyboard([
            ...pageButtons,
            [
                Markup.button.callback("<< Back", "back", pageNumber === 1),
                Markup.button.callback("Next >>", "next", pageNumber * perPage >= chatItems.length)
            ],
            [
                Markup.button.callback("Accept", "accept"),
                Markup.button.callback("Cancel", "cancel"),
            ]
        ]);
    }
}