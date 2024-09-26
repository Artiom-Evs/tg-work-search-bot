import { Provider } from "@nestjs/common";
import { SESSION_STORE } from "./session-store.provider";
import { Scenes, session, SessionStore } from "telegraf";

export const SESSION_MIDDLEWARE = "SESSION_MIDDLEWARE";

export const SessionMiddlewareProvider: Provider = {
    provide: SESSION_MIDDLEWARE,
    inject: [SESSION_STORE],
    useFactory: (store: SessionStore<Scenes.SceneSession>) => {
        return session({
            getSessionKey: (ctx) => `${ctx.from?.id}`,
            defaultSession: () => ({ }),
            store,
        })
    }
}
