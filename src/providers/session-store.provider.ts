import { Provider } from "@nestjs/common";
import { Mongo } from "@telegraf/session/mongodb";
import { CustomSession } from "../types/custom-context.interfaces";
import { SessionStore } from "telegraf";
import config from "../app.config";

export const SESSION_STORE = "SESSION_STORE";

export const SessionStoreProvider: Provider<SessionStore<CustomSession>> = {
    provide: SESSION_STORE,
    useFactory: () => {
        return Mongo<CustomSession>({
            url: config.mongoDbUrl,
            database: "tg_work_search_bot"
        });
    }
}
