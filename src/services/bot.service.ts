import { Inject, Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MiddlewareFn, Scenes, Telegraf } from 'telegraf';
import config from "../app.config";
import publicCommands from '../commands/publicCommands';
import privateCommands from '../commands/privateCommands';
import { CustomContext } from '../customContext';
import { BOT_COMMANDS } from '../constants';
import { SESSION_MIDDLEWARE } from '../providers/session-middleware.provider';
import authMiddleware from '../middlewares/authMiddleware';
import authScene from '../scenes/authScene';
import setChatsScene from '../scenes/setChatsScene';
import promptsScene from '../scenes/PromptsScene';
import responseGenerationScene from '../scenes/ResponseGenerationScene';

@Injectable()
export class BotService extends Telegraf<CustomContext> implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
    constructor(
        @Inject(SESSION_MIDDLEWARE) sessionMiddleware: MiddlewareFn<CustomContext>
    ) {
        super(config.botToken);

        const stage = new Scenes.Stage<CustomContext>([ 
            authScene, 
            setChatsScene, 
            promptsScene, 
            responseGenerationScene 
        ], { 
            defaultSession: ({ })
        });

        this.use(sessionMiddleware);
        this.use(stage.middleware());
        
        this.use(publicCommands);
        this.use(privateCommands);
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
