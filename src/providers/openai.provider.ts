import { Provider } from "@nestjs/common";
import OpenAI from "openai";
import config from "../app.config";

export const OPENAI_CLIENT = "OPENAI_CLIENT";

export const OpenAIProvider: Provider = {
    provide: OPENAI_CLIENT,
    useFactory: () => {
        return new OpenAI({
            apiKey: config.openAiApiKey
        });
    }
}
