import { parentPort } from "worker_threads";
import docStorage from "../../services/docStorage";
import { CustomSession } from "../../types/custom-context.interfaces";
import { UserUpdatesHandler } from "./UserUpdatesHandler";
import updateNotifier from "./UserUpdateNotifier";

const period = parseInt(process.env.RESEARCH_PERIOD_MS ?? "") ?? 60000;

let timer: NodeJS.Timeout | undefined;
let stopInvoked = false;

parentPort?.on("message", (message) => handleCommand(message));

function handleCommand(command: string): void {
    console.log("SearchWorker received command", command);
    switch (command) {
        case "start":
            startSearch();
            break;
        case "stop":
            stopSearch();
            break;
        default:
            console.error("SearchWorker received unknown command:", command);
    }
}

    function startSearch() {
    if (!timer)
        loop();
}

function stopSearch() {
    clearTimeout(timer);
    timer = undefined
    stopInvoked = true;
}

async function loop(): Promise<void> {
    await handleUpdates();
    timer = setTimeout(loop, period);
}

interface UserDoc {
    key: string,
    session: CustomSession
}

async function handleUpdates(): Promise<void> {
    const collection = docStorage.collection<UserDoc>("telegraf-sessions");
    
    try {
        const users = await collection.find({ }).toArray();

        for (const user of users) {
            if (stopInvoked) return;

            const userId = parseInt(user.key);
            if (!userId) break;
            
            const handler = new UserUpdatesHandler(userId);
            handler.onUpdate = updateNotifier.notifyUser;
            await handler.handleUpdates();
        }
    }
    catch (e) {
        console.error("Error while handling updates.", e);
    }
}
