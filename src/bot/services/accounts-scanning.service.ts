import { Injectable, Logger } from "@nestjs/common";
import { Db } from "mongodb";
import { Interval } from "@nestjs/schedule";
import { UserSessionDocument } from "../interfaces/user-session-document.interface";
import { AccountUpdatesHandlerService } from "./account-updates-handler.service";
import { BotMessageSenderService } from "./bot-message-sender.service";
import { AIMessageAnalyzerService } from "src/ai/ai-message-analyzer.service";
import { ConfigService } from "@nestjs/config";
import { AIResponseGeneratorService } from "src/ai/ai-response-generator.service";
import { PromptNames } from "src/ai/ai.constants";
import { GeneratedResponseDocument } from "../interfaces/generated-response-document.interface";
import { TargetChatUpdateInfo } from "../interfaces/chat-update-info.interfaces";

        @Injectable()
export class AccountsScanningService {
    private readonly _logger = new Logger(AccountsScanningService.name);
    private readonly _rescanIntervalMs: number;
    private _isScanning = false;

    constructor(
        private readonly _db: Db,
        private readonly _configService: ConfigService,
        private readonly _updatesHandler: AccountUpdatesHandlerService,
        private readonly _messageSender: BotMessageSenderService,
        private readonly _messageAnalyzer: AIMessageAnalyzerService,
        private readonly _responseGenerator: AIResponseGeneratorService
    ) {
        this._rescanIntervalMs = parseInt(this._configService.get<string>("ACCOUNTS_RESCAN_PERIOD_MS") ?? "60000");
    }

    @Interval(30000)
    async rescanAccounts() {
        try {
            if (this._isScanning) {
                this._logger.warn("Previous accounts scanning iteration does not have completed before start new scanning iteration.");
                return;
            }

            this._isScanning = true;

            const usersCollection = this._db.collection<UserSessionDocument>("telegraf-sessions");
            const responsesCollection = this._db.collection<GeneratedResponseDocument>("generated-responses");

            const users = await usersCollection.find({}).toArray();

            for (const user of users) {
                const userId = parseInt(user.key);
                if (!userId) break;

                for await (const [chat, messages] of this._updatesHandler.getNewChatsMessages(userId)) {
                    if (messages.length === 0)
                        continue;

                    // TODO: normalize chat identifiers! 
                    const chatId = -1 * Number(chat.id);
                    const lastMessageId = Math.max(...messages.map(m => m.id));

                    await usersCollection.updateOne(
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

                        const generatedResponseText = await this._responseGenerator.generateResponse(message, user.session.customPrompts?.[PromptNames.GenerateResponse]);
                        const docCreationResult = await responsesCollection.insertOne({
                            userId,
                            chatId,
                            messageId: message.id,
                            text: generatedResponseText   
                        });
                        const updateInfo: TargetChatUpdateInfo = {
                            userId,
                            chat,
                            message,
                            summary: target.summary
                        };
                        
                        await this  ._messageSender.sendTargetMessageNotification({ 
                            update: updateInfo, 
                            generatedResponseText,
                            generatedResponseId: docCreationResult.insertedId.toHexString()
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
