import { Module } from "@nestjs/common";
import { BotService } from "./services/bot.service";
import { SessionStoreProvider } from "./providers/session-store.provider";
import { SessionMiddlewareProvider } from "./providers/session-middleware.provider";
import { PublicCommandsService } from "./services/public-commands.service";
import { PrivateCommandsService } from "./services/private-commands.service";

@Module({
    providers: [
        SessionStoreProvider,
        SessionMiddlewareProvider,
        BotService,
        PublicCommandsService,
        PrivateCommandsService
    ]
})
export class AppModule {}
