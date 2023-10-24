import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
let wManager = null;
let system = new ECS.System();
function onManagerMessage(data) {
    let msg = (data.data);
    switch (msg.message) {
        case Utils.Messages.AreYouReadyKids:
            wManager.postMessage(new Utils.Message(Utils.Messages.AyeAyeCaptain, system.workerUid));
            break;
        case Utils.Messages.Work:
            let newData = msg.data;
            system.update(newData.components, newData.commands, newData.state, newData.input);
            system.run();
            break;
        case Utils.Messages.WakeUp:
            console.log("wokenup");
            wManager.postMessage(new Utils.Message(Utils.Messages.BdsabasdmbswhaWhat, system.workerUid));
            break;
    }
}
onmessage = (data) => {
    wManager = data.ports[0];
    wManager.onmessage = onManagerMessage;
    system.workerManager = wManager;
    system.workerUid = data.data;
};
