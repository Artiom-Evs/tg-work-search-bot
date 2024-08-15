import { ChatCompletion, ResponseFormatJSONSchema } from "openai/resources";
import { Api } from "telegram";
import openai from "../../tools/openai";
import { DEFAULT_DEFINE_TARGET_MESSAGES_PROMPT, GPT_MAX_TOKENS, GPT_MODEL, DEFINE_TARGET_MESSAGES_PROMPT_TEMPLATE } from "./constants";
import { UpdateInfo } from "../../workers/SearchWorker/types";
import { JSONSchema } from "openai/lib/jsonschema";
import { AnalyzeMessagesAIResponse, TargetMessageAIResponse } from "./types";

const dataSchema: JSONSchema = {
    type: "object",
    properties: {
        messages: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    chatId: { type: "number" },
                    messageId: { type: "number" },
                    summary: { type: "string" }
                },
                additionalProperties: false,
                required: ["chatId", "messageId", "summary"]
            }
        }
    },
    additionalProperties: false,
    required: ["messages"]
}

const jsonSchema: ResponseFormatJSONSchema.JSONSchema = {
    name: "search-bot-target-message",
    strict: true,
    schema: dataSchema as any
}

class AIMessageAnalyzer {
    public async defineTargetMessages(messages: Api.Message[], customPrompt: string = DEFAULT_DEFINE_TARGET_MESSAGES_PROMPT): Promise<TargetMessageAIResponse[]> {
        const messagesCsv = this.convertMessagesToCSV(messages);
        const prompt = DEFINE_TARGET_MESSAGES_PROMPT_TEMPLATE.replace("{0}", customPrompt).replace("{1}", messagesCsv);
        const completion = await this.getAICompletion(prompt);
        const text = completion.choices[0].message.content ?? "";
        const response = JSON.parse(text) as AnalyzeMessagesAIResponse;
        const targetMessages = response.messages;
        
        return targetMessages;
    }

    private convertMessagesToCSV(messages: Api.Message[]): string {
        return messages.map((message) => {
            const text = message.text?.replace("\n", " ").replace(";", ",");
            return `${message.chat?.id ?? 0};${message.id};${text}`;
        }).join("\n");
    }

    private getAICompletion(prompt: string): Promise<ChatCompletion> {
        return openai.chat.completions.create({
            model: GPT_MODEL,
            response_format: {
                type: "json_schema",
                json_schema: jsonSchema
            },
            max_tokens: GPT_MAX_TOKENS,
            messages: [
                { role: "user", content: prompt }
            ]
        })
            .catch(err => {
                console.log("Error while getting answer from OpenAI API.");
                throw err;
            });
    }
}

const messageAnalyzer = new AIMessageAnalyzer();
export default messageAnalyzer;
