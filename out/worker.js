import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
let wManager = null;
let system = new ECS.System();
function onManagerMessage(data) {
    let msg = (data.data);
    switch (msg.message) {
        case Utils.Messages.AreYouReadyKids:
            wManager.postMessage(new Utils.Message(Utils.Messages.AyeAyeCaptain));
            break;
        case Utils.Messages.Work:
            let newData = msg.data;
            system.update(newData.components, newData.commands, newData.state);
            system.run();
            break;
    }
}
onmessage = (data) => {
    wManager = data.ports[0];
    wManager.onmessage = onManagerMessage;
    system.workerManager = wManager;
};
