import { MongoClient } from "mongodb";

const url = process.env.MONGODB_URL;

if (!url)
    throw new Error("MONGODB_URL environment variable is not set.");

const mongoClient = new MongoClient(url);

mongoClient.connect()
    .then(() => console.log("Successfully connected to MongoDB."))
    .catch(err => console.error("Error while connecting to MongoDB.", err));

process.on("exit", () => mongoClient.close().catch(console.error));

const docStorage = mongoClient.db("tg_work_search_bot");
export default docStorage;
