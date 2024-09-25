import { Inject, Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MiddlewareFn, Scenes, Telegraf } from 'telegraf';
import config from "../app.config";
import { CustomContext } from '../types/custom-context.interfaces';
import { BOT_COMMANDS } from '../constants';
import { SESSION_MIDDLEWARE } from '../providers/session-middleware.provider';

@Injectable()
export class BotService extends Telegraf<CustomContext> implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
    constructor(
        @Inject(SESSION_MIDDLEWARE) sessionMiddleware: MiddlewareFn<CustomContext>
    ) {
        super(config.botToken);

        this.use(sessionMiddleware);
    }
    
    async onModuleInit() {
        await this.telegram.setMyCommands(BOT_COMMANDS);
    }
    
    onModuleDestroy() {
        this.stop("AppModule destroing");
    }
    
    onApplicationShutdown(signal?: string) {
        this.stop("AppModule destroing");
    }

    override async launch(): Promise<void> {
        await super.launch(() => {
            console.log("Bot is running...");
        });
    }
}
