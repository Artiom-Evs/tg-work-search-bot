import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = parseInt(process.env.API_ID ?? "");
const apiHash = process.env.API_HASH ?? "";

if (!apiId || !apiHash)
    throw new Error(`"API_ID" and "API_HASH" environment variables should be defined.`);

export async function getClient(session: string): Promise<TelegramClient> {
    const client = new TelegramClient(new StringSession(session), apiId, apiHash, { connectionRetries: 5 });
    await client.connect();
    return client;
}

export async function safeAction<T = any>(session: string, action: (client: TelegramClient) => Promise<T>, onError?: (err: Error) => void | Promise<void>): Promise<T | undefined> {
    const client = await getClient(session);
    try {
        return await action(client);
    }
    catch (e: any) {
        await onError?.(e);
    }
    finally {
        await client.disconnect();
    }
}
