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
import * as Comps from "./components.js";
onerror = () => { console.log("helpme <- manager"); };
let w0;
let w1;
let w2;
let graphicDiff = new Utils.GraphicDiff();
let commands = [
    new Cmds.PingPong(),
    new Cmds.PingPong(),
    new Cmds.PingPong(),
    new Cmds.TheFirst(),
];
let components = [];
let state = new Map();
for (let _ = 0; _ < Utils.NUMBER_OF_COMPONENTS; _++) {
    components.push([]);
}
let input;
let triggerCommandRefresh = false;
function onWorkerMessage(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // sync state changes
        let msg = data.data;
        switch (msg.message) {
            case Utils.Messages.Done:
                let newData = msg.data;
                if (newData.state.get(Utils.CHANGES_KEY).length != 0) {
                    for (let newKey of newData.state.get(Utils.CHANGES_KEY)) {
                        let newValue = newData.state.get(newKey);
                        state.set(newKey, newValue);
                    }
                    state.set(Utils.CHANGES_KEY, []);
                }
                // add commands
                if (newData.commandsToAdd.length != null) {
                    triggerCommandRefresh = true;
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
                        commands.push(Cmds.getInstanceFromEnum(nC));
                    }
                }
                // add components
                if (newData.componentsToAdd.length != 0) {
                    for (let c of newData.componentsToAdd) {
                        if (c.type == Comps.Components.ComputedElement) {
                            graphicDiff.
                                addedComputedElements.
                                push(c);
                        }
                        components[c.type].push(c);
                    }
                }
                // change properties
                if (newData.propertiesToChange.length != 0) {
                    for (let pC of newData.propertiesToChange) {
                        if (components[pC.index[0]].length - 1 < pC.index[1] ||
                            components[pC.index[0]][pC.index[1]].componentUid != pC.componentUid) {
                            console.log("$ is the same component: ", components[pC.index[0]][pC.index[1]].componentUid, pC.componentUid);
                            console.log("$ component probably was deleted or changed position");
                            console.log("$ trying to fix...");
                            let fixed = false;
                            for (let [cI, c] of components[pC.index[0]].entries()) {
                                if (c.componentUid == pC.componentUid) {
                                    fixed = true;
                                    pC.index[1] = cI;
                                }
                            }
                            if (!fixed) {
                                console.log("$ component was deleted");
                                return;
                            }
                            else {
                                console.log("$ component was found");
                            }
                        }
                        components[pC.index[0]][pC.index[1]][pC.property] = pC.value;
                    }
                }
                // delete components
                if (newData.componentsToRemove.length != 0) {
                    let deleteOrder = [];
                    for (let cI of newData.componentsToRemove) {
                        if (deleteOrder.length == 0)
                            deleteOrder.push(cI);
                        for (let [dOI, dO] of deleteOrder.entries()) {
                            if (cI[1] > dO[1]) {
                                deleteOrder.splice(dOI, 0, cI);
                            }
                        }
                    }
                    for (let cI of deleteOrder) {
                        if (components[cI[0]][cI[1]].type == Comps.Components.ComputedElement) {
                            graphicDiff.removedComputedElements.push(components[cI[0]][cI[1]]);
                        }
                        components[cI[0]].splice(cI[1], 1);
                    }
                }
                // remove commands
                if (newData.commandsToRemove.length != 0) {
                    for (let nC of newData.commandsToRemove) {
                        for (let [cI, c] of commands.entries()) {
                            if (nC == c.type) {
                                commands.splice(cI, 1);
                            }
                        }
                    }
                }
                //            await Utils.delay(100) // wait for all workers to initialize
                switch (newData.workerUid) {
                    case w0.uid:
                        runW0();
                        break;
                    case w1.uid:
                        runW1();
                        break;
                    case w2.uid:
                        runW2();
                        break;
                }
                break;
            case Utils.Messages.AyeAyeCaptain:
                let workerUid = msg.data;
                switch (workerUid) {
                    case w0.uid:
                        runW0();
                        break;
                    case w1.uid:
                        runW1();
                        break;
                    case w2.uid:
                        runW2();
                        break;
                }
                break;
        }
    });
}
function runW2() {
    let commandTypes = commands.map(a => a.type);
    let splitCommandTypes = Utils.divideList(commandTypes, 3);
    let inputData = new Utils.WorkerInput(state, components, splitCommandTypes[2], input);
    let newMsg = new Utils.Message(Utils.Messages.Work, inputData);
    if (splitCommandTypes[2] != undefined) {
        w2.messagePort.postMessage(newMsg);
    }
}
function runW1() {
    let commandTypes = commands.map(a => a.type);
    let splitCommandTypes = Utils.divideList(commandTypes, 3);
    let inputData = new Utils.WorkerInput(state, components, splitCommandTypes[1], input);
    let newMsg = new Utils.Message(Utils.Messages.Work, inputData);
    if (splitCommandTypes[1] != undefined) {
        w1.messagePort.postMessage(newMsg);
    }
}
function runW0() {
    let commandTypes = commands.map(a => a.type);
    let splitCommandTypes = Utils.divideList(commandTypes, 3);
    let inputData = new Utils.WorkerInput(state, components, splitCommandTypes[0], input);
    let newMsg = new Utils.Message(Utils.Messages.Work, inputData);
    if (splitCommandTypes[0] != undefined) {
        w0.messagePort.postMessage(newMsg);
    }
}
// Main
onmessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let msg = (data.data);
    switch (msg.message) {
        case Utils.Messages.Start:
            let newData = (msg.data);
            yield Utils.delay(1000); // wait for all workers to initialize
            w0 = new Utils.WorkerInfo(data.ports[0], newData.w0Uid);
            w1 = new Utils.WorkerInfo(data.ports[1], newData.w1Uid);
            w2 = new Utils.WorkerInfo(data.ports[2], newData.w2Uid);
            w0.messagePort.onmessage = onWorkerMessage;
            w1.messagePort.onmessage = onWorkerMessage;
            w2.messagePort.onmessage = onWorkerMessage;
            state.set(Utils.CHANGES_KEY, []);
            let areYouReady = new Utils.Message(Utils.Messages.AreYouReadyKids);
            w0.messagePort.postMessage(areYouReady);
            w1.messagePort.postMessage(areYouReady);
            w2.messagePort.postMessage(areYouReady);
            setInterval(sendComputedElementsToRender, 100);
            break;
        case Utils.Messages.PlayerInput:
            let newInput = (msg.data);
            input = newInput;
            break;
    }
});
function sendComputedElementsToRender() {
    for (let cE of components[Comps.Components.ComputedElement]) {
        let computedElement = cE;
        if (computedElement.isChanged) {
            graphicDiff.changedComputedElements.push(computedElement);
        }
    }
    postMessage(new Utils.Message(Utils.Messages.RenderIt, graphicDiff));
    // set everything to not changed
    for (let cE of graphicDiff.changedComputedElements) {
        cE.isChanged = false;
        for (let [pCI, pC] of cE.changedProperties.entries()) {
            if (pCI == 0) {
                let classesDiff = pC;
                classesDiff.added = [];
                classesDiff.deleted = [];
                continue;
            }
            pC = false;
        }
    }
    graphicDiff.addedComputedElements = [];
    graphicDiff.changedComputedElements = [];
    graphicDiff.removedComputedElements = [];
}
