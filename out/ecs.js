import * as Comps from "./components.js";
import * as Utils from "./utils.js";
import * as Cmds from "./commands.js";
export var Get;
(function (Get) {
    Get[Get["One"] = 0] = "One";
    Get[Get["All"] = 1] = "All";
})(Get || (Get = {}));
export var By;
(function (By) {
    By[By["EntityId"] = 0] = "EntityId";
    By[By["EntityType"] = 1] = "EntityType";
    By[By["ComponentId"] = 2] = "ComponentId";
    By[By["Any"] = 3] = "Any";
})(By || (By = {}));
export var Run;
(function (Run) {
    Run[Run["EveryFrame"] = 0] = "EveryFrame";
    Run[Run["Once"] = 1] = "Once";
})(Run || (Run = {}));
export class ComponentAndIndex {
    constructor(newComponent, newIndex) {
        this.component = newComponent;
        this.index = newIndex;
    }
}
export class System {
    constructor(newWorkerId, newWorkers) {
        this.devBox = new Utils.DevBox(false, false, false, false);
        this.workerId = newWorkerId;
        this.workers = newWorkers;
        this.diffs = new Utils.Diffs([], [], [], [], []);
        this.commands = [];
        this.components = [];
        for (let _ = 0; _ < Comps.NUMBER_OF_COMPONENTS; _++) {
            this.components.push([]);
        }
        this.componentDiffs = new Utils.ComponentDiffs();
        this.state = new Map();
        this.input = new Utils.Input(new Utils.Vector2(0, 0));
    }
    setState(command, key, value) {
        this.state.set(key, [command, value]);
    }
    getState(key) {
        let value = this.state.get(key);
        if (value == undefined)
            return null;
        else
            return value[1];
    }
    removeComponent(component) {
        this.diffs.removedComponents.push(new Utils.RemovedComponent(component.component.type, component.index, component.component.componentUid));
    }
    removeCommand(command) {
        let isFound = false;
        for (let w of this.workers) {
            for (let wC of w.commands) {
                if (wC == command) {
                    this.diffs.removedCommands.push(new Utils.CommandChange(w.workerId, command));
                    isFound = true;
                }
            }
        }
        for (let wC of this.commands) {
            if (wC.type == command) {
                this.diffs.removedCommands.push(new Utils.CommandChange(this.workerId, command));
                isFound = true;
            }
        }
        if (!isFound) {
            console.log("command to delete wasn't found");
        }
    }
    addComponent(newComponent) {
        this.diffs.addedComponents.push(newComponent);
    }
    addCommand(command) {
        for (let w of this.workers) {
            for (let wC of w.commands) {
                if (wC == command) {
                    console.log("command already in list");
                    return;
                }
            }
        }
        for (let wC of this.commands) {
            if (wC.type == command) {
                console.log("command already in list");
                return;
            }
        }
        let workerWithLessCommands = [
            this.workers[0].workerId,
            this.workers[0].commands.length // numberOfCommands
        ];
        for (let w of this.workers) {
            if (w.commands.length < workerWithLessCommands[1]) {
                workerWithLessCommands[0] = w.workerId;
                workerWithLessCommands[1] = w.commands.length;
            }
        }
        if (this.commands.length < workerWithLessCommands[1]) {
            workerWithLessCommands[0] = this.workerId;
            workerWithLessCommands[1] = this.commands.length;
        }
        this.diffs.addedCommands.push(new Utils.CommandChange(workerWithLessCommands[0], command));
    }
    setProperty(component, property, value) {
        if (component == undefined) {
            console.log("no component at such index");
            return;
        }
        this.diffs.changedProperties.push(new Utils.PropertyChange(component.component.type, component.index, property, value, component.component.componentUid));
    }
    update(newData) {
        // add commands
        for (let aWC of newData.addedCommands) {
            for (let w of this.workers) {
                if (w.workerId == aWC.workerReceiver) {
                    w.commands.push(aWC.commandType);
                }
            }
            if (aWC.workerReceiver == this.workerId) {
                this.commands.push(Cmds.getInstanceFromEnum(aWC.commandType));
            }
        }
        // remove commands
        for (let rWC of newData.removedCommands) {
            for (let w of this.workers) {
                for (let [wCI, wC] of w.commands.entries()) {
                    if (rWC.commandType == wC) {
                        w.commands.splice(wCI, 1);
                        break;
                    }
                }
            }
            for (let [wCI, wC] of this.commands.entries()) {
                if (wC.type == rWC.commandType) {
                    this.commands.splice(wCI, 1);
                    for (const [k, v] of this.state.entries()) {
                        if (v[0] == rWC.commandType)
                            this.state.delete(k);
                    }
                }
            }
        }
        // change properties
        for (let pC of newData.changedProperties) {
            // detect if index is incorrect or was removed
            if (this.components[pC.componentType].length - 1 < pC.componentIndex ||
                this.components[pC.componentType][pC.componentIndex].componentUid != pC.componentUid) {
                console.log("$ component probably was deleted or changed position");
                console.log("$ trying to fix...");
                let fixed = false;
                for (let [cI, c] of this.components[pC.componentType].entries()) {
                    if (c.componentUid == pC.componentUid) {
                        fixed = true;
                        pC.componentIndex = cI;
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
            this.components[pC.componentType][pC.componentIndex][pC.property] = pC.value;
            // add changed component to component diffs
            this.componentDiffs.changedComponents.push(new ComponentAndIndex(this.components[pC.componentType][pC.componentIndex], pC.componentIndex));
        }
        // remove components
        if (newData.removedComponents.length != 0) {
            console.log("yoU ARE DELETINgh");
            // detect if index is incorrect or was removed
            for (let rC of newData.removedComponents) {
                if (this.components[rC.componentType].length - 1 < rC.componentIndex ||
                    this.components[rC.componentType][rC.componentIndex].componentUid != rC.componentUid) {
                    console.log("$ component probably was deleted or changed position");
                    console.log("$ trying to fix...");
                    let fixed = false;
                    for (let [cI, c] of this.components[rC.componentType].entries()) {
                        if (c.componentUid == rC.componentUid) {
                            fixed = true;
                            rC.componentIndex = cI;
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
            }
            let deleteOrder = [newData.removedComponents[0]];
            for (let rC of newData.removedComponents) {
                for (let [dOI, dO] of deleteOrder.entries()) {
                    if (rC.componentIndex > dO.componentIndex) {
                        deleteOrder.splice(dOI, 0, rC);
                        break;
                    }
                    if (deleteOrder[dOI + 1] == undefined) {
                        deleteOrder.push(rC);
                        break;
                    }
                }
            }
            // remove in order
            for (let dO of deleteOrder) {
                // add removed components to diff
                this.componentDiffs.removedComponents.push(new ComponentAndIndex(this.components[dO.componentType][dO.componentIndex], dO.componentIndex));
                // actually remove
                this.components[dO.componentType].splice(dO.componentIndex, 1);
            }
        }
        // add components
        for (let c of newData.addedComponents) {
            this.components[c.type].push(c);
            this.componentDiffs.addedComponents.push(new ComponentAndIndex(c, this.components[c.type].length - 1));
        }
        // check changed components index is still valid
        for (let cCI = this.componentDiffs.changedComponents.length - 1; cCI >= 0; cCI--) {
            let cC = this.componentDiffs.changedComponents[cCI];
            if (this.components[cC.component.type].length - 1 < cC.index ||
                this.components[cC.component.type][cC.index].componentUid !=
                    cC.component.componentUid) {
                console.log("$ component probably was deleted or changed position");
                console.log("$ trying to fix...");
                let fixed = false;
                for (let [cI, c] of this.components[cC.component.type].entries()) {
                    if (c.componentUid == cC.component.componentUid) {
                        fixed = true;
                        cC.index = cI;
                    }
                }
                if (!fixed) {
                    console.log("$ component was deleted");
                    this.componentDiffs.changedComponents.splice(cCI, 1);
                    return;
                }
                else {
                    console.log("$ component was found");
                }
            }
        }
    }
    find(query) {
        // Comment on production !TODO
        if (query[1].length == 0) {
            console.log("no components expecified");
            return [];
        }
        if (query[2] == By.EntityType && query[3] == undefined ||
            query[2] == By.ComponentId && typeof query[3] != "number" ||
            query[2] == By.EntityId && typeof query[3] != "number") {
            console.log('argument does not match "By" enum');
            return [];
        }
        if (query[0] == Get.All && query[2] == By.ComponentId) {
            console.log('cannot get all by component id');
            return [];
        }
        if (query[0] == Get.One && query[2] == By.EntityType) {
            console.log("query Get.One By.EntityType is not supported yet");
            return [];
        }
        if (query[0] == Get.One && query[2] == By.Any) {
            console.log("query Get.One By.Any is not supported yet");
            return [];
        }
        // Comment on production !TODO
        let collected = [];
        for (let i = 0; i < query[1].length; i++) {
            collected.push([]);
        }
        for (let [qci, qc] of query[1].entries()) {
            if (query[0] == Get.One) {
                if (query[2] == By.ComponentId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.componentUid) {
                            collected[qci].push(new ComponentAndIndex(c, cI));
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(new ComponentAndIndex(c, cI));
                            break;
                        }
                    }
                    continue;
                }
            }
            else if (query[0] == Get.All) {
                if (query[2] == By.EntityId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(new ComponentAndIndex(c, cI));
                        }
                    }
                    continue;
                }
                else if (query[2] == By.Any) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        collected[qci].push(new ComponentAndIndex(c, cI));
                    }
                    continue;
                }
                //                else if (query[2] == By.EntityType) {
                //                    for (let e of this.components[Comps.Components.EntityType]) {
                //                        if (query[3] == e.entityType) {
                //                            for (let c of this.components[qc]) {
                //                                if (e.entityUid == c.ownerUid) {
                //                                    collected[qci].push(c)
                //                                }
                //                            }
                //                            break;
                //                        }
                //                    }
                //                    continue;
                //                }
            }
        }
        return collected;
    }
    run() {
        if (this.commands.length == 0) {
            return;
        }
        for (let c of this.commands) {
            c.run(this);
        }
        if (this.diffs.addedCommands.length == 0 &&
            this.diffs.addedComponents.length == 0 &&
            this.diffs.changedProperties.length == 0 &&
            this.diffs.removedCommands.length == 0 &&
            this.diffs.removedComponents.length == 0) {
            return;
        }
        for (let w of this.workers) {
            w.messagePort.postMessage(new Utils.Message(Utils.Messages.Update, this.diffs));
        }
        this.update(this.diffs);
        this.componentDiffs = new Utils.ComponentDiffs();
        this.diffs = new Utils.Diffs([], [], [], [], []);
    }
}
//        for (let cAI of this.components[Comps.Components.ComputedElement]) {
//            let computedElement = cAI as Comps.ComputedElement
//            computedElement.isChanged = false
//            for (let [pCI, pC] of computedElement.changedProperties.entries()) {
//                if (pCI == 0) {
//                    let classesDiff = (pC as Comps.ClassesDiff)
//                    classesDiff.added = []
//                    classesDiff.deleted = []
//                    continue;
//                }
//                pC = false
//            }
//        }
