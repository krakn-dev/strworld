import * as Cmds from "./commands.js";
import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"


let system: ECS.System;


function onWorkerMessage(data: any) {
    let msg = (data.data) as Utils.Message
    switch (msg.message) {
        case Utils.Messages.Update:
            let newData = msg.data as Utils.Diffs
            system.update(newData)
            break;
    }
}

onmessage = (data) => {
    let msg = data.data as Utils.Message

    switch (msg.message) {
        case Utils.Messages.Update: {
            let newData = msg.data as Utils.Diffs
            system.update(newData)
        } break;

        case Utils.Messages.Start: {

            let workers: Utils.WorkerInfo[] = []
            let newData = msg.data as Utils.WorkerInitializationData

            for (let [i, wId] of newData.workerIds.entries()) {
                workers.push(new Utils.WorkerInfo(data.ports[i], wId))
            }

            system = new ECS.System(newData.yourWorkerId, workers)
            for (let w of workers) {
                w.messagePort.onmessage = onWorkerMessage
            }
            setInterval(system.run.bind(system), 5)

        } break;

        case Utils.Messages.PlayerInput: {
            let newData = msg.data as Utils.Input
            system.input = newData
        } break;

        case Utils.Messages.DevBoxInput: {
            let newData = msg.data as Utils.DevBox
            system.devBox = newData
        } break;
    }
}
