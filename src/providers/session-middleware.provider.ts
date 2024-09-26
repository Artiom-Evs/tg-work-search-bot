import { Provider } from "@nestjs/common";
import { SESSION_STORE } from "../bot/providers/session-store.provider";
import { session, SessionStore } from "telegraf";
import { CustomSession } from "../types/custom-context.interfaces";

export const SESSION_MIDDLEWARE = "SESSION_MIDDLEWARE";

export const SessionMiddlewareProvider: Provider = {
    provide: SESSION_MIDDLEWARE,
    inject: [SESSION_STORE],
    useFactory: (store: SessionStore<CustomSession>) => {
        return session({
            getSessionKey: (ctx) => `${ctx.from?.id}`,
            defaultSession: () => {
                return { 
                    auth: { 
                        isAuthorized: false, 
                        session: "" 
                    }
                };
            },
            store,
        })
    }
}
