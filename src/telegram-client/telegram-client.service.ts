import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelegramClientFactory } from "src/telegram-client/telegram-client.factory";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

@Injectable()
export class TelegramClientService {
    private readonly _logger = new Logger(TelegramClientService.name);

    constructor(
        private readonly _clientFactory: TelegramClientFactory,
        private readonly _configService: ConfigService
    ) { }

    /**
     * @returns string of the telegram client session
     */
    public async sendAuthorizationCode(phoneNumber: string): Promise<string> {
        let client: TelegramClient;

        try {
            client = await this._clientFactory.createTelegramClient("");
            await client.sendCode({ apiId: client.apiId, apiHash: client.apiHash }, phoneNumber);

            const session = client.session as StringSession;
            return session.save();
        }
        catch (err) {
            this._logger.error("Error while sending authorization code.", err);
            throw err;
        }
        finally {
            await client.disconnect();
            await client.destroy();
        }
    }

    /**
     * @returns string of the telegram client session
     */
    public async signinUser(telegramSession: string, phoneNumber: string, secretCode: string, password: string): Promise<string> {
        let client: TelegramClient;

        try {
            client = await this._clientFactory.createTelegramClient(telegramSession);

            await client.signInUser({ apiId: client.apiId, apiHash: client.apiHash }, {
                phoneNumber,
                phoneCode: async () => secretCode,
                password: async () => password,
                onError: (err) => { throw err }
            });

            const session = client.session as StringSession;
            return session.save();
        }
        catch (err) {
            this._logger.error("Error while sign-in user into Telegram.", err);
            throw err;
        }
        finally {
            await client.disconnect();
            await client.destroy();
        }
    }

    public async signoutUser(telegramSession: string): Promise<void> {
        let client: TelegramClient;

        try {
            client = await this._clientFactory.createTelegramClient(telegramSession);
            await client.invoke(new Api.auth.LogOut());
        }
        catch (err) {
            this._logger.error("Error while sign-out user from Telegram.", err);
            throw err;
        }
        finally {
            await client.disconnect();
            await client.destroy();
        }
    }
}   