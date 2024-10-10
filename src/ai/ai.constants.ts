
export const GPT_MODEL = "gpt-4o-mini";
export const GPT_MAX_TOKENS = 16 * 1024;

export enum PromptNames {
    DefineTargetMessages = "define-target-messages",
    GenerateResponse = "generate-response",
};

export const DEFINE_TARGET_MESSAGES_PROMPT_TEMPLATE = `
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

export const DEFAULT_DEFINE_TARGET_MESSAGES_PROMPT = `
You are an experienced business analyst in the IT field.
I develop custom websites.
I need your help finding the messages I need.

Objective: Get me all incoming messages across various Telegram chats to identify potential clients interested in web development or design services. Focus on messages mentioning website development, creation, redesign, technical support, or hiring specialists for projects. Analyze potential leads, prioritizing requests or discussions around services related to WordPress, Headless CMS, React.js, Next.js, Node.js, and web design.

Lead Identification Criteria:

Look for discussions or direct requests for website creation (new or redesign), e-commerce development, custom web solutions, or digital product design.
Capture mentions of hiring freelancers, agencies, or teams for web development or design.
Focus on inquiries regarding custom WordPress development, headless CMS solutions, or modern JavaScript frameworks like React.js, Next.js, and Node.js.
Identify conversations where users are seeking long-term development partners or web design specialists.

Exclusions:

Exclude promotional messages that do not express intent to order web development or design services, including:
Advertisements for courses (programming, design, etc.).
Messages promoting business clubs, conferences, or webinars.
Other promotional content not related to seeking specialists or ordering services for website creation or redesign.
`;

export const GENERATE_RESPONSE_PROMPT_TEMPLATE = `
{0}

It is a text of the user message:
{1}

`;

export const DEFAULT_GENERATE_RESPONSE_PROMPT = `
You are an experienced sales specialist. 
I need you to respond to a message from a client who wants to order a website. 
Answer on behalf of our company.
For reference: We develop custom websites based both on classic WordPress solutions and more technologically advanced and productive HeadLess solutions that use WordPress as the administrative part, and the front end works on React and Next.JS technologies. 
The message should arouse interest and a desire to get in touch with our company.
The message is intended for a chat or group in one of the instant messengers, so the message should be relatively short.
do not add explanatory text to your answer.
`;

export const DefaultPrompts: Record<PromptNames, string> = {
    [PromptNames.DefineTargetMessages]: DEFAULT_DEFINE_TARGET_MESSAGES_PROMPT,
    [PromptNames.GenerateResponse]: DEFAULT_GENERATE_RESPONSE_PROMPT ,
}
