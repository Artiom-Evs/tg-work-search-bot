import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelegramClientFactory } from "src/telegram-client/telegram-client.factory";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Dialog } from "telegram/tl/custom/dialog";

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

    public async getUserChats(telegramSession: string): Promise<Dialog[]> {
        let client: TelegramClient;

        try {
            client = await this._clientFactory.createTelegramClient(telegramSession);
            const dialogs = await client.getDialogs({ archived: false }) ?? [];
            const chats = dialogs.filter(chat => chat.isChannel || chat.isGroup);
            return chats;
        }
        catch (err) {
            this._logger.error("Error while getting user chats from Telegram.", err);
            throw err;
        }
        finally {
            await client.disconnect();
            await client.destroy();
        }
    }

    public async getChatMessage(telegramSession: string, chatId: number, messageId: number): Promise<Api.Message | null> {
        let client: TelegramClient;

        try {
            client = await this._clientFactory.createTelegramClient(telegramSession);

            // TODO: entities preloading should be implemented in the future
            await client.getDialogs();
            const messages = await client.getMessages(`${chatId}`, { ids: messageId });
            return messages[0] ?? null;
        }
        catch (err) {
            this._logger.error("Error while getting chat message from Telegram.", err);
            throw err;
        }
        finally {
            await client.disconnect();
            await client.destroy();
        }
    }

    public async sendMessage(telegramSession: string, chatId: number, message: string, replyTo?: number): Promise<Api.Message> {
        let client: TelegramClient;

        try {
            client = await this._clientFactory.createTelegramClient(telegramSession);
            // TODO: entities preloading should be implemented in the future
            await client.getDialogs();

            const sendedMessage = await client.sendMessage(chatId, { message, replyTo });
            return sendedMessage;
        }
        catch (err) {
            this._logger.error("Error while sending message to Telegram.", err);
            throw err;
        }
        finally {
            await client.disconnect();
            await client.destroy();
        }
    }
}   
