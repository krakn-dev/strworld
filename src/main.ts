import * as Utils from "./utils.js"

let onWorkerError = (e: any) => {
    console.log("ERROR!")
    console.error(e)
}
function initializeWorkers() {
    let w0MsgChannel = new MessageChannel();
    let w1MsgChannel = new MessageChannel();
    let w2MsgChannel = new MessageChannel();

    let wManager = new Worker("worker_manager.js", { type: "module" });
    let w0 = new Worker("worker.js", { type: "module" });
    let w1 = new Worker("worker.js", { type: "module" });
    let w2 = new Worker("worker.js", { type: "module" });

    w0.onerror = onWorkerError
    w1.onerror = onWorkerError
    w2.onerror = onWorkerError
    wManager.onerror = onWorkerError

    wManager.postMessage(
        new Utils.Message(Utils.Messages.Start),
        [
            w0MsgChannel.port1,
            w1MsgChannel.port1,
            w2MsgChannel.port1
        ])

    w0.postMessage(
        null,
        [
            w0MsgChannel.port2,
        ])

    w1.postMessage(
        null,
        [
            w1MsgChannel.port2,
        ])

    w2.postMessage(
        null,
        [
            w2MsgChannel.port2,
        ])

}
initializeWorkers()
