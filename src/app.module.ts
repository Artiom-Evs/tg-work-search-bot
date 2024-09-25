import { Module } from "@nestjs/common";
import { BotService } from "./services/bot.service";
import { SessionStoreProvider } from "./providers/session-store.provider";
import { SessionMiddlewareProvider } from "./providers/session-middleware.provider";
import { PublicCommandsService } from "./services/public-commands.service";
import { PrivateCommandsService } from "./services/private-commands.service";
import { ScheduleModule } from "@nestjs/schedule";
import { MongoDbProvider } from "./providers/mongodb.provider";
import { AccountsScanningService } from "./services/accounts-scanning.service";
import { BotMessageSenderService } from "./services/bot-message-sender.service";
import { AccountUpdatesHandlerService } from "./services/account-updates-handler.service";
import { OpenAIProvider } from "./providers/openai.provider";
import { AIMessageAnalyzerService } from "./services/ai-message-analyzer.service";
import { AIResponseGeneratorService } from "./services/ai-response-generator.service";

@Module({
    imports: [
        ScheduleModule.forRoot()
    ],
    providers: [
        MongoDbProvider,
        OpenAIProvider,
        SessionStoreProvider,
        SessionMiddlewareProvider,
        BotService,
        PublicCommandsService,
        PrivateCommandsService,
        AIMessageAnalyzerService,
        AIResponseGeneratorService,
        BotMessageSenderService,
        AccountUpdatesHandlerService,
        AccountsScanningService
    ]
})
export class AppModule {}
