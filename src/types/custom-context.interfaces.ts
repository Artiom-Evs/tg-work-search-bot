import { Context, Scenes } from "telegraf";

export interface SelectionChatItem {
    id: number,
    title: string,
    checked: boolean
}

export interface ChatItem {
    id: number,
    lastMessageId?: number
}

interface AuthSessionData {
    isAuthorized: boolean,
    session: string
}

interface CustomSceneSessionData extends Scenes.WizardSessionData {
    phoneNumber?: string,
    secretCode?: string,
    chats?: SelectionChatItem[],
    pageNumber?: number,
    promptName?: string,
    tempMessageIds: number[],
    response_text?: string
}

export interface CustomSession extends Scenes.WizardSession<CustomSceneSessionData> {
    auth: AuthSessionData,
    chats?: ChatItem[],
    customPrompts?: Record<string, string>
}

export interface CustomContext extends Context {
    session: CustomSession,
    scene: Scenes.SceneContextScene<CustomContext, CustomSceneSessionData>,
    wizard: Scenes.WizardContextWizard<CustomContext>
}
