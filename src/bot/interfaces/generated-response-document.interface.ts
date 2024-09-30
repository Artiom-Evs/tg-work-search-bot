import { ObjectId } from "mongodb";

export interface GeneratedResponseDocument {
    _id?: ObjectId;
    userId: number;
    chatId: number;
    messageId: number;
    text: string;
}
