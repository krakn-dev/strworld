import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
let system;
function onW0Message(data) {
    let msg = (data.data);
    switch (msg.message) {
        case Utils.Messages.Update:
            let newData0 = msg.data;
            system.update(newData0);
            break;
        case Utils.Messages.AddedCommand:
            let newData1 = msg.data;
            system.onAddCommand(newData1);
            break;
        case Utils.Messages.RemovedCommand:
            let newData2 = msg.data;
            system.onRemoveCommand(newData2);
            break;
    }
}
function run() {
    system.run();
}
onmessage = (data) => {
    let w0 = data.ports[0];
    system = new ECS.System(w0, data.data);
    w0.onmessage = onW0Message;
    setInterval(run, 5);
};
