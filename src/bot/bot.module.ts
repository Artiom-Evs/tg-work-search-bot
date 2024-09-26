import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelegrafModule } from "nestjs-telegraf";
import { PublicCommandsService } from "./public-commands.service";
import { Scenes, session, SessionStore } from "telegraf";
import { AuthorizationScene } from "./authorization.scene";

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                token: configService.get("TELEGRAM_BOT_API_TOKEN"),
                middlewares: [session()],
            })
        })
    ],
    providers: [
        PublicCommandsService,
        AuthorizationScene,
    ]
})
export class BotModule { }

