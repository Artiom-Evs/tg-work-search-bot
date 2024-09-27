import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

@Injectable()
export class TelegramClientFactory {
    constructor(private readonly _configService: ConfigService) { }

    async createTelegramClient(sessionStr: string): Promise<TelegramClient> {
        const apiId = parseInt(this._configService.get<string>('TELEGRAM_API_ID'));
        const apiHash = this._configService.get<string>('TELEGRAM_API_HASH');

        const client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, { connectionRetries: 5 });
        await client.connect();
        return client;
    }
}
