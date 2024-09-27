import { Module } from "@nestjs/common";
import { OpenAIProvider } from "./openai.provider";
import { AIMessageAnalyzerService } from "./ai-message-analyzer.service";
import { AIResponseGeneratorService } from "./ai-response-generator.service";

@Module({
    providers: [
        OpenAIProvider,
        AIMessageAnalyzerService,
        AIResponseGeneratorService
    ],
    exports: [
        OpenAIProvider,
        AIMessageAnalyzerService,
        AIResponseGeneratorService
    ]
})
export class AIModule { }
