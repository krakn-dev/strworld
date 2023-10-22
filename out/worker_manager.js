var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Utils from "./utils.js";
import * as Cmds from "./commands.js";
onerror = () => { console.log("helpme <- manager"); };
let w0 = null;
let w1 = null;
let w2 = null;
let commands = [new Cmds.ShowHealth()];
let components = [];
let state = new Map();
for (let _ = 0; _ < Utils.NUMBER_OF_COMPONENTS; _++) {
    components.push([]);
}
let numberOfMessages = 0;
function onWorkerMessage(data) {
    // sync state changes
    let msg = data.data;
    let newData = msg.data;
    switch (msg.message) {
        case Utils.Messages.Done:
            for (let newKey of newData.state.get(Utils.CHANGES_KEY)) {
                let newValue = newData.state.get(newKey);
                state.set(newKey, newValue);
            }
            state.set(Utils.CHANGES_KEY, []);
            console.log("remove", newData.commandsToRemove);
            // add commands
            let isFound = false;
            for (let nC of newData.commandsToAdd) {
                for (let c of commands) {
                    if (nC == c.type) {
                        isFound = true;
                        console.log("command already in list");
                        break;
                    }
                }
                if (isFound)
                    continue;
                switch (nC) {
                    case Cmds.Commands.ShowHealth:
                        commands.push(new Cmds.ShowHealth());
                        break;
                    case Cmds.Commands.CreateHealth:
                        commands.push(new Cmds.CreateHealth());
                        break;
                }
            }
            // add components
            for (let c of newData.componentsToAdd) {
                components[c.type].push(c);
            }
            // delete components
            for (let cI of newData.componentsToRemove) {
                components[cI[0]].splice(cI[1], 1);
            }
            // change properties
            for (let pC of newData.propertiesToChange) {
                components[pC.index[0]][pC.index[1]][pC.property] = pC.value;
            }
            // remove commands
            for (let nC of newData.commandsToRemove) {
                for (let [cI, c] of commands.entries()) {
                    if (nC == c.type) {
                        commands.splice(cI, 1);
                    }
                }
            }
            // check if is last worker
            numberOfMessages++;
            if (numberOfMessages == 1) {
                numberOfMessages = 0;
                step();
            }
            break;
        case Utils.Messages.AyeAyeCaptain:
            numberOfMessages++;
            if (numberOfMessages == 3) {
                numberOfMessages = 0;
                step();
            }
            break;
    }
}
function step() {
    return __awaiter(this, void 0, void 0, function* () {
        let commandTypes = commands.map(a => a.type);
        let splitCommandTypes = Utils.divideList(commandTypes, 3);
        yield Utils.delay(1000);
        let inputData = new Utils.WorkerInput(state, components, splitCommandTypes[0]);
        let newMsg = new Utils.Message(Utils.Messages.Work, inputData);
        if (splitCommandTypes[0] != null && splitCommandTypes[0].length != 0) {
            w0.postMessage(newMsg);
        }
        if (splitCommandTypes[1] != null && splitCommandTypes[1].length != 0) {
            inputData.commands = splitCommandTypes[1];
            w1.postMessage(newMsg);
        }
        if (splitCommandTypes[2] != null && splitCommandTypes[2].length != 0) {
            w2.postMessage(newMsg);
            inputData.commands = splitCommandTypes[2];
        }
    });
}
// Main
onmessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let msg = (data.data.message);
    switch (msg) {
        case Utils.Messages.Start:
            yield Utils.delay(1000); // wait for all workers to initialize
            w0 = data.ports[0];
            w1 = data.ports[1];
            w2 = data.ports[2];
            w0.onmessage = onWorkerMessage;
            w1.onmessage = onWorkerMessage;
            w2.onmessage = onWorkerMessage;
            state.set(Utils.CHANGES_KEY, []);
            //
            let areYouReady = new Utils.Message(Utils.Messages.AreYouReadyKids);
            w0.postMessage(areYouReady);
            w1.postMessage(areYouReady);
            w2.postMessage(areYouReady);
            break;
    }
});
