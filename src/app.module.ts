import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { AppController } from './app.controller';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SharedModule.forRoot({ isGlobal: true }),
        BotModule
    ],
    controllers: [AppController],
})
export class AppModule { }
