import { Module } from "@nestjs/common";
import { BotService } from "./services/bot.service";
import { SessionStoreProvider } from "./providers/session-store.provider";
import { SessionMiddlewareProvider } from "./providers/session-middleware.provider";

@Module({
    providers: [
        SessionStoreProvider,
        SessionMiddlewareProvider,
        BotService
    ]
})
export class AppModule {}
