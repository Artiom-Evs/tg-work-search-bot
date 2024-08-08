import { Context, Scenes } from "telegraf";

interface AuthSessionData {
    isAuthorized: boolean,
    session: string
}

interface AuthSceneSessionData extends Scenes.WizardSessionData {
    phoneNumber?: string,
    secretCode?: string,
}

export interface CustomSession extends Scenes.WizardSession<AuthSceneSessionData> {
    auth: AuthSessionData
}

export interface CustomContext extends Context {
    session: CustomSession,
    scene: Scenes.SceneContextScene<CustomContext, AuthSceneSessionData>,
    wizard: Scenes.WizardContextWizard<CustomContext>
}
