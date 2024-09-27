import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { PublicCommandsService } from "./services/public-commands.service";
import { PrivateCommandsService } from "./services/private-commands.service";
import { AuthorizationScene } from "./scenes/authorization.scene";
import { BotOptionsFactory } from "./services/bot-options.factory";

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            useClass: BotOptionsFactory
        })
    ],
    providers: [
        AuthorizationScene,
        PublicCommandsService,
        PrivateCommandsService,
    ]
})
export class BotModule { }
