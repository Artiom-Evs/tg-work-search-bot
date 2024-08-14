import { Worker } from "worker_threads";

const worker = new Worker(__dirname + "/SearchWorker.js");

worker.on('message', (msg) => console.log(msg));
worker.on('error', (err) => {
    console.error("Error thrown from SearchWorker thread:", err);;
});

worker.on('exit', (code) => {
    if (code !== 0)
        console.error("SearchWorker thread stopped with exit code:", code);
});

export function start() {
    worker?.postMessage("start");
}

export function stop() {
    worker?.postMessage("stop");
}
