import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Scenes } from "telegraf";
import { CustomContext } from "../types/custom-context.interfaces";
import { BotService } from "./bot.service";
import authScene from "../scenes/authScene";
import promptsScene from "../scenes/PromptsScene";
import setChatsScene from "../scenes/setChatsScene";

@Injectable()
export class BotStageService extends Scenes.Stage<CustomContext> implements OnModuleInit {
    constructor(
        @Inject(BotService) private readonly _bot: BotService,
        
    ) {
        super([
            authScene,
            promptsScene,
            setChatsScene,
            
        ], {
            defaultSession: ({})
        });

        this._bot.use(this.middleware());
    }

    onModuleInit() {
        // TODO: understand why adding middleware in the onModuleInit handler leads to an error
        // this._bot.use(this.middleware());
        console.debug("Stage initialized.");
    }
}
