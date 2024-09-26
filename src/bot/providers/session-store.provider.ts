import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Mongo } from "@telegraf/session/mongodb";
import { Scenes, SessionStore } from "telegraf";

export const SESSION_STORE = "SESSION_STORE";

export const SessionStoreProvider: Provider<SessionStore<Scenes.SceneSession>> = {
    provide: SESSION_STORE,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        return Mongo<Scenes.SceneSession>({
            url: configService.get("MONGODB_URL"),
            database: "tg_work_search_bot"
        });
    }
}
