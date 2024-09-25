import { Provider } from "@nestjs/common";
import { MongoClient, Db } from "mongodb";
import config from "../app.config";

export const MONGODB_CONNECTION = "MONGODB_CONNECTION";

export const MongoDbProvider: Provider<Db> = {
    provide: MONGODB_CONNECTION,
    useFactory: async () => {
        const client = new MongoClient(config.mongoDbUrl);

        await client.connect()
            .then(() => console.log("Successfully connected to MongoDB."))
            .catch(err => console.error("Error while connecting to MongoDB.", err));

        process.on("exit", () => client.close().catch(console.error));

        return client.db("tg_work_search_bot");
    }
}
