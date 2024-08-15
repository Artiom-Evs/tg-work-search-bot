
export const GPT_MODEL = "gpt-4o-mini";
export const GPT_MAX_TOKENS = 16 * 1024;

export const PROMPT_TEMPLATE = `
{0}

I'm passing you a list of messages as a CSV table with columns "chatId", "messageId" and "messageText".

Messages:
chatId;messageId;messageText
{1}

Please return the matching messages to me as a JSON object with a "messages" array containing the matching messages as objects with the structure:
{
    "chatId": 12345,
    "messageId": 67890,
    "summary": "Brief description of the message"
}

Please note that "chatId" and "messageId" must be numbers, and "summary" must not exceed 100 characters.
If there are no matching messages, return me an empty "messages" array.
Don't give me wrong data, otherwise I won't be able to process it.
Good luck!
`;

export const DEFAULT_USER_PROMPT = `
You are an experienced business analyst in the IT field.
I develop custom websites.
I want you to help me find messages in one of the chats from people who need a website.
`;
