import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { BotService } from "./bot.service";
import { Composer, SessionStore } from "telegraf";
import { CustomContext, CustomSession } from "../types/custom-context.interfaces";
import { SESSION_STORE } from "../providers/session-store.provider";
import authMiddleware from "../middlewares/auth.middleware";
import { safeAction } from "../tools/telegram";

@Injectable()
export class PrivateCommandsService extends Composer<CustomContext> implements OnModuleInit {
    constructor(
        @Inject(BotService) private readonly _bot: BotService,
        @Inject(SESSION_STORE) private readonly _sessions: SessionStore<CustomSession>
    ) {
        super();

        this.exitCommandHandler = this.exitCommandHandler.bind(this);

        this.command("chats", authMiddleware, this.chatsCommandHandler);
        this.command("prompts", authMiddleware, this.promptsCommandHandler);

        this.command("me", authMiddleware, this.meCommandHandler);
        this.command("exit", authMiddleware, this.exitCommandHandler);

        this.action("delete_notification", authMiddleware, this.deleteMessageActionHandler);
        this.action(/generate_response_(.+)-(.+)/, authMiddleware, async (ctx) => {
            const chatId = Number(ctx.match[1]);
            const messageId = Number(ctx.match[2]);
            
            await this.generateMessageActionHandler(ctx, chatId, messageId);
        });
        
    }

    onModuleInit() {
        this._bot.use(this);
        console.debug("Private commands added.");
    }

    async chatsCommandHandler(ctx: CustomContext) {
        await ctx.scene.enter("set-chats")
    }

    async promptsCommandHandler(ctx: CustomContext) {
        await ctx.scene.enter("prompts")
    }

    async meCommandHandler(ctx: CustomContext) {
        const me = await safeAction(ctx.session.auth.session, async (client) => await client.getMe());
        if (!me)
            return await ctx.reply("Failed to get information about your Telegram profile.");
        
        await ctx.reply(
    `Name: ${me.firstName} ${me.lastName ?? ""}
    Username: ${me.username}
    Phone: ${me.phone ?? "-"}
    `);
        }

    async exitCommandHandler(ctx: CustomContext) {
        // session should be deleted after all middlewares
        setTimeout(async () => {
            await this._sessions.delete(`${ctx.from?.id}`);
        }, 1000);

        await ctx.reply("You have been successfully logged out.");
    }

    async deleteMessageActionHandler(ctx: CustomContext) {
        await ctx.deleteMessage().catch(async () => {
            await ctx.answerCbQuery("I can't delete this message :(");
        });
    }

    async generateMessageActionHandler(ctx: CustomContext, chatId: number, messageId: number) {
        await ctx.scene.enter("response-generation", { chatId, messageId  });
    }
}
