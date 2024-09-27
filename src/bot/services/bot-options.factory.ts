import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TelegrafModuleOptions, TelegrafOptionsFactory } from "nestjs-telegraf";
import { Scenes, session } from "telegraf";
import { Mongo } from "@telegraf/session/mongodb";

@Injectable()
export class BotOptionsFactory implements TelegrafOptionsFactory {
    constructor(
        private readonly _configService: ConfigService
    ) { }

    async createTelegrafOptions(): Promise<TelegrafModuleOptions> {
        const token = this._configService.get<string>("TELEGRAM_BOT_API_TOKEN");
        const url = this._configService.get<string>("MONGODB_URL");
        const sessionStorage = this.getSessionStorage(url);

        return {
            token,
            middlewares: [sessionStorage]
        };
    }

    // TODO: rewrite to Nest.JS providers
    // with standard implementation session storage doesn't work
    private getSessionStorage(mongoUrl: string) {
        const store = Mongo<Scenes.SceneSession>({
            url: mongoUrl,
            database: "tg_work_search_bot"
        });

        return session({
            getSessionKey: (ctx) => `${ctx.from?.id}`,
            defaultSession: () => ({}),
            store,
        });
    }
}
