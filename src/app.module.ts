import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { AppController } from './app.controller';
import { TelegramClientModule } from './telegram-client/telegram-client.module';
import { AIModule } from './ai/ai.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TelegramClientModule.forRoot({ isGlobal: true }),
        AIModule,
        BotModule
    ],
    controllers: [AppController],
})
export class AppModule { }
