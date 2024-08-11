import { Mongo } from "@telegraf/session/mongodb";
import { Context, session } from "telegraf";
import { CustomSession } from "../customContext";

export interface SessionData {
    auth: {
        isAuthorized: boolean,
        session: string
    }
}

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl)
    throw new Error(`"MONGODB_URL" environment variables should be defined.`);

export const store = Mongo<CustomSession>({
    url: mongodbUrl ?? "",
    database: "tg_work_search_bot"
});

const sessionMiddleware = session({
    getSessionKey: (ctx: Context) => `${ctx.from?.id}`,
    defaultSession: () => ({ auth: { isAuthorized: false, session: "" } }),
    store,
})

export default sessionMiddleware;
