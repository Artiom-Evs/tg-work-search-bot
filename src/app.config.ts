
export default {
    botToken: process.env.BOT_TOKEN ?? "",
    apiId: parseInt(process.env.API_ID ?? ""),
    apiHash: process.env.API_HASH ?? "",
    mongoDbUrl: process.env.MONGODB_URL ?? "",
    accountsRescanPeriodMs: parseInt(process.env.ACCOUNTS_RESCAN_PERIOD_MS ?? "60000"),
    openAiApiKey: process.env.OPENAI_API_KEY ?? "",
};
