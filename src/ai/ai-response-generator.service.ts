import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { Api } from "telegram";
import { DEFAULT_GENERATE_RESPONSE_PROMPT, GENERATE_RESPONSE_PROMPT_TEMPLATE, GPT_MAX_TOKENS, GPT_MODEL } from "./ai.constants";
import { ChatCompletion } from "openai/resources";

@Injectable()
export class AIResponseGeneratorService {
    constructor(
        private readonly _openai: OpenAI
    ) { }

    public async generateResponse(message: Api.Message, customPrompt: string = DEFAULT_GENERATE_RESPONSE_PROMPT): Promise<string> {
        const prompt = GENERATE_RESPONSE_PROMPT_TEMPLATE.replace("{0}", customPrompt).replace("{1}", message.text);
        const completion = await this.getAICompletion(prompt);
        const text = completion.choices[0].message.content ?? "";

        return text;
    }

    private getAICompletion(prompt: string): Promise<ChatCompletion> {
        return this._openai.chat.completions.create({
            model: GPT_MODEL,
            max_tokens: GPT_MAX_TOKENS,
            messages: [
                { role: "user", content: prompt }
            ]
        })
            .catch(err => {
                console.log("Error while getting response from OpenAI API.");
                throw err;
            });
    }
}
