import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongoClient, Db } from "mongodb";

export const MongoDbProvider: Provider<Db> = {
    provide: Db,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>("MONGODB_URL");
        const client = new MongoClient(url);

        await client.connect()
            .then(() => console.log("Successfully connected to MongoDB."))
            .catch(err => console.error("Error while connecting to MongoDB.", err));

        process.on("exit", () => client.close().catch(console.error));

        return client.db("tg_work_search_bot");
    }
}
