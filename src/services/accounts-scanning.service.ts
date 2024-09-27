import { Inject, Injectable, Logger } from "@nestjs/common";
import { Db } from "mongodb";
import { MONGODB_CONNECTION } from "../providers/mongodb.provider";
import { Interval } from "@nestjs/schedule";
import config from "../app.config";
import { ChatItem, UserSessionDocument } from "../types/custom-context.interfaces";
import { AccountUpdatesHandlerService } from "./account-updates-handler.service";
import { BotMessageSenderService } from "./bot-message-sender.service";
import { AIMessageAnalyzerService } from "../ai/ai-message-analyzer.service";

@Injectable()
export class AccountsScanningService {
    private readonly _logger = new Logger(AccountsScanningService.name);
    private _isScanning = false;

    constructor(
        @Inject(MONGODB_CONNECTION) private readonly _db: Db,
        @Inject(AccountUpdatesHandlerService) private readonly _updatesHandler: AccountUpdatesHandlerService,
        @Inject(BotMessageSenderService) private readonly _messageSender: BotMessageSenderService,
        @Inject(AIMessageAnalyzerService) private readonly _messageAnalyzer: AIMessageAnalyzerService
    ) { }

    @Interval(config.accountsRescanPeriodMs)
    async rescanAccounts() {
        try {
            if (this._isScanning) {
                this._logger.warn("Previous accounts scanning iteration does not have completed before start new scanning iteration.");
                return;
            }

            this._isScanning = true;

            const collection = this._db.collection<UserSessionDocument>("telegraf-sessions");
            const users = await collection.find({}).toArray();

            for (const user of users) {
                const userId = parseInt(user.key);
                if (!userId) break;

                for await (const [chat, messages] of this._updatesHandler.getNewChatsMessages(userId)) {
                    if (messages.length === 0)
                        continue;

                    // TODO: normalize chat identifiers! 
                    const chatId = -1 * Number(chat.id);
                    const lastMessageId = Math.max(...messages.map(m => m.id));

                    await collection.updateOne(
                        { key: user.key },
                        { $set: { "session.chats.$[chat].lastMessageId": lastMessageId } },
                        {
                            arrayFilters: [{ "chat.id": chatId }]
                        });

                    const targetMessages = await this._messageAnalyzer.defineTargetMessages(messages);

                    if (targetMessages.length === 0)
                        continue;

                    for (const target of targetMessages) {
                        const message = messages.find(m => m.id == target.messageId);

                        if (!message)
                            continue;

                        await this._messageSender.sendTargetMessageNotification({
                            userId,
                            chat,
                            message,
                            summary: target.summary
                        });
                    }
                }
            }
        }
        catch (e: any) {
            this._logger.error("Error while scanning user accounts.", e);
        }
        finally {
            this._isScanning = false;
        }
    }
}



