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
    constructor(newW0, newWorkerId) {
        this.workerId = newWorkerId;
        this.w0 = newW0;
        this.diffs = new Utils.DiffsOut([], [], [], [], [], this.workerId);
        this.commands = [];
        this.components = [];
        for (let _ = 0; _ < Comps.NUMBER_OF_COMPONENTS; _++) {
            this.components.push([]);
        }
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
        this.diffs.removedCommands.push(command);
    }
    addComponent(newComponent) {
        this.diffs.addedComponents.push(newComponent);
    }
    addCommand(command) {
        this.diffs.addedCommands.push(command);
    }
    setProperty(component, property, value) {
        if (component == undefined) {
            console.log("no component at such index");
            return;
        }
        this.diffs.changedProperties.push(new Utils.PropertyChange(component.component.type, component.index, property, value, component.component.componentUid));
    }
    onRemoveCommand(command) {
        // delete command state
        for (const [k, v] of this.state.entries()) {
            if (v[0] == command)
                this.state.delete(k);
        }
        for (let cI = this.commands.length - 1; cI >= 0; cI--) {
            if (this.commands[cI].type == command) {
                this.commands.splice(cI);
            }
        }
    }
    onAddCommand(command) {
        this.commands.push(Cmds.getInstanceFromEnum(command));
    }
    update(newData) {
        // add components
        for (let c of newData.addedComponents) {
            this.components[c.type].push(c);
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
        }
        // delete components
        if (newData.removedComponents.length != 0) {
            let deleteOrder = [newData.removedComponents[0]];
            for (let rC of newData.removedComponents) {
                for (let [dOI, dO] of deleteOrder.entries()) {
                    if (rC.index > dO.index) {
                        deleteOrder.splice(dOI, 0, rC);
                    }
                }
            }
            for (let dO of deleteOrder) {
                // remove in order
                this.components[dO.type].splice(dO.index, 1);
            }
        }
        for (let cAI of this.components[Comps.Components.ComputedElement]) {
            let computedElement = cAI;
            computedElement.isChanged = false;
            for (let [pCI, pC] of computedElement.changedProperties.entries()) {
                if (pCI == 0) {
                    let classesDiff = pC;
                    classesDiff.added = [];
                    classesDiff.deleted = [];
                    continue;
                }
                pC = false;
            }
        }
        this.input = newData.input;
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
        if (this.commands.length == 0)
            return;
        for (let c of this.commands) {
            c.run(this);
        }
        this.w0.postMessage(new Utils.Message(Utils.Messages.Done, this.diffs));
        this.diffs = new Utils.DiffsOut([], [], [], [], [], this.workerId);
        for (let cAI of this.components[Comps.Components.ComputedElement]) {
            let computedElement = cAI;
            computedElement.isChanged = false;
            for (let [pCI, pC] of computedElement.changedProperties.entries()) {
                if (pCI == 0) {
                    let classesDiff = pC;
                    classesDiff.added = [];
                    classesDiff.deleted = [];
                    continue;
                }
                pC = false;
            }
        }
    }
}
