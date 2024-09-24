
export default {
    botToken: process.env.BOT_TOKEN ?? "",
    apiId: parseInt(process.env.API_ID ?? ""),
    apiHash: process.env.API_HASH ?? "",
    mongoDbUrl: process.env.MONGODB_URL ?? "",
    researchPeriod: parseInt(process.env.RESEARCH_PERIOD ?? "60000"),
    openAiApiKey: process.env.OPENAI_API_KEY ?? "",
};
