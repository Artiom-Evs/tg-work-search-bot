import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { PublicCommandsService } from "./services/public-commands.service";
import { PrivateCommandsService } from "./services/private-commands.service";
import { AuthorizationScene } from "./scenes/authorization.scene";
import { BotOptionsFactory } from "./services/bot-options.factory";
import { ChatsSelectionScene } from "./scenes/chats-selection.scene";
import { PromptsManagementScene } from "./scenes/prompts-management.scene";
import { AccountsScanningService } from "./services/accounts-scanning.service";
import { AccountUpdatesHandlerService } from "./services/account-updates-handler.service";
import { MongoDbProvider } from "./providers/mongodb.provider";
import { BotMessageSenderService } from "./services/bot-message-sender.service";
import { AIModule } from "src/ai/ai.module";
import { SessionStoreProvider } from "./providers/session-store.provider";
import { TelegramClientModule } from "src/telegram-client/telegram-client.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ResponseGenerationScene } from "./scenes/response-generation.scene";

@Module({
    imports: [
        AIModule,
        TelegramClientModule,
        ScheduleModule.forRoot(),
        TelegrafModule.forRootAsync({
            useClass: BotOptionsFactory
        })
    ],
    providers: [
        MongoDbProvider,
        SessionStoreProvider,
        AuthorizationScene,
        ChatsSelectionScene,
        PromptsManagementScene,
        ResponseGenerationScene,
        PublicCommandsService,
        PrivateCommandsService,
        BotMessageSenderService,
        AccountUpdatesHandlerService,
        AccountsScanningService,
    ]
})
export class BotModule { }
