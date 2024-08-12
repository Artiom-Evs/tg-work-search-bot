import { Context, Scenes } from "telegraf";

export interface SelectionChatItem {
    id: number,
    title: string,
    checked: boolean
}

export interface ChatItem {
    id: number
}

interface AuthSessionData {
    isAuthorized: boolean,
    session: string
}

interface CustomSceneSessionData extends Scenes.WizardSessionData {
    phoneNumber?: string,
    secretCode?: string,
    chats?: SelectionChatItem[]
}

export interface CustomSession extends Scenes.WizardSession<CustomSceneSessionData> {
    auth: AuthSessionData,
    chats?: ChatItem[]
}

export interface CustomContext extends Context {
    session: CustomSession,
    scene: Scenes.SceneContextScene<CustomContext, CustomSceneSessionData>,
    wizard: Scenes.WizardContextWizard<CustomContext>
}
