import * as Cmds from "./commands.js";
import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"


let system: ECS.System;


function onW0Message(data: any) {
    let msg = (data.data) as Utils.Message
    switch (msg.message) {
        case Utils.Messages.Update:
            let newData0 = msg.data as Utils.WorkerInput
            system.update(newData0)
            break;

        case Utils.Messages.AddedCommand:
            let newData1 = msg.data as Cmds.Commands
            system.onAddCommand(newData1)
            break;

        case Utils.Messages.RemovedCommand:
            let newData2 = msg.data as Cmds.Commands
            system.onRemoveCommand(newData2)
            break;
    }
}

function run() {
    system.run()
}
onmessage = (data) => {
    let w0 = data.ports[0]
    system = new ECS.System(w0, data.data)
    w0.onmessage = onW0Message
    setInterval(run, 5)
}
