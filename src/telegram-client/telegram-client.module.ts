import { DynamicModule, Module } from "@nestjs/common";
import { TelegramClientFactory } from "./telegram-client.factory";
import { TelegramClientService } from "./telegram-client.service";


interface TelegramClientModuleOptions {
    isGlobal?: boolean;
}

@Module({
    providers: [TelegramClientFactory, TelegramClientService],
    exports: [TelegramClientFactory, TelegramClientService]
})
export class TelegramClientModule {
    public static forRoot(options: TelegramClientModuleOptions): DynamicModule {
        const providers = [TelegramClientFactory, TelegramClientService];
        const exports = [TelegramClientFactory, TelegramClientService];

        return {
            module: TelegramClientModule,
            global: options.isGlobal,
            providers,
            exports
        };
    }
}
