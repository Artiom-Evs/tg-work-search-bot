import { DynamicModule, Module } from "@nestjs/common";
import { TelegramClientFactory } from "./telegram-client.factory";


interface SharedModuleOptions {
    isGlobal?: boolean;
}

@Module({
    providers: [TelegramClientFactory],
    exports: [TelegramClientFactory]
})
export class SharedModule {
    static forRoot(options: SharedModuleOptions): DynamicModule {
        const providers = [TelegramClientFactory];
        const exports = [TelegramClientFactory];

        return {
            module: SharedModule,
            global: options.isGlobal,
            providers,
            exports
        };
    }
}
