import { Provider } from "@nestjs/common";
import OpenAI from "openai";
import { ConfigService } from "@nestjs/config";

export const OpenAIProvider: Provider = {
    provide: OpenAI,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>("OPENAI_API_KEY");
        return new OpenAI({ apiKey });
    }
}
