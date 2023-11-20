import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
let system;
function onWorkerMessage(data) {
    let msg = (data.data);
    switch (msg.message) {
        case Utils.Messages.Update:
            let newData = msg.data;
            system.update(newData);
            break;
    }
}
onmessage = (data) => {
    let msg = data.data;
    switch (msg.message) {
        case Utils.Messages.Update:
            {
                let newData = msg.data;
                system.update(newData);
            }
            break;
        case Utils.Messages.Start:
            {
                let workers = [];
                let newData = msg.data;
                for (let [i, wId] of newData.workerIds.entries()) {
                    workers.push(new Utils.WorkerInfo(data.ports[i], wId));
                }
                system = new ECS.System(newData.yourWorkerId, workers);
                for (let w of workers) {
                    w.messagePort.onmessage = onWorkerMessage;
                }
                setInterval(system.run.bind(system), 5);
            }
            break;
        case Utils.Messages.PlayerInput:
            {
                let newData = msg.data;
                system.input = newData;
            }
            break;
        case Utils.Messages.DevBoxInput:
            {
                let newData = msg.data;
                system.devBox = newData;
            }
            break;
    }
};
