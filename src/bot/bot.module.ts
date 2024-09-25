import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelegrafModule } from "nestjs-telegraf";
import { PublicCommandsService } from "./public-commands.service";

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                token: configService.get("BOT_TOKEN")
            })
        })
    ],
    providers: [
        PublicCommandsService
    ]
})
export class BotModule { }

