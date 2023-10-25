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
export class PropertyChange {
    constructor(newIndex, newProperty, newValue, newComponentUid) {
        this.index = newIndex;
        this.property = newProperty;
        this.value = newValue;
        this.componentUid = newComponentUid;
    }
}
export class System {
    constructor() {
        this.commands = [];
        this.components = [];
        this.state = new Map();
        this.commandsToRemove = [];
        this.commandsToAdd = [];
        this.componentsToRemove = [];
        this.propertiesToChange = [];
        this.componentsToAdd = [];
        this.input = new Utils.Input(new Utils.Vector2(0, 0));
    }
    setState(key, value) {
        let changes = this.state.get(Utils.CHANGES_KEY);
        changes.push(key);
        this.state.set(Utils.CHANGES_KEY, changes);
        this.state.set(key, value);
    }
    getState(key) {
        return this.state.get(key);
    }
    removeComponent(component) {
        this.componentsToRemove.push(component.index);
    }
    removeCommand(command) {
        this.commandsToRemove.push(command);
    }
    addComponent(newComponent) {
        this.componentsToAdd.push(newComponent);
    }
    addCommand(command) {
        this.commandsToAdd.push(command);
    }
    setProperty(component, property, value) {
        if (component == undefined) {
            console.log("no component at such index");
            return;
        }
        this.propertiesToChange.push(new PropertyChange(component.index, property, value, component.component.componentUid));
        //set isChanged
        if (property == "isChanged")
            return;
        this.propertiesToChange.push(new PropertyChange(component.index, "isChanged", true, component.component.componentUid));
    }
    update(newComponents, newCommands, newState, newInput) {
        this.components = newComponents;
        this.state = newState;
        this.input = newInput;
        if (newCommands == null)
            return;
        this.commands = [];
        for (let cT of newCommands) {
            this.commands.push(Cmds.getInstanceFromEnum(cT));
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
                            collected[qci].push(new ComponentAndIndex(c, [qc, cI]));
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(new ComponentAndIndex(c, [qc, cI]));
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
                            collected[qci].push(new ComponentAndIndex(c, [qc, cI]));
                        }
                    }
                    continue;
                }
                else if (query[2] == By.Any) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        collected[qci].push(new ComponentAndIndex(c, [qc, cI]));
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
        for (let c of this.commands) {
            if (c.type != Cmds.Commands.PingPong)
                c.run(this);
        }
        this.workerManager.postMessage(new Utils.Message(Utils.Messages.Done, new Utils.WorkerOutput(this.propertiesToChange, this.componentsToRemove, this.componentsToAdd, this.state, this.commandsToRemove, this.commandsToAdd, this.workerUid)));
        for (let cI = this.components.length; cI >= 0; cI--) {
            delete this.components[cI];
        }
        for (let cI = this.componentsToAdd.length; cI >= 0; cI--) {
            delete this.componentsToAdd[cI];
        }
        for (let cI = this.componentsToRemove.length; cI >= 0; cI--) {
            delete this.componentsToRemove[cI];
        }
        for (let cI = this.propertiesToChange.length; cI >= 0; cI--) {
            delete this.propertiesToChange[cI];
        }
        for (let cI = this.commandsToAdd.length; cI >= 0; cI--) {
            delete this.commandsToAdd[cI];
        }
        for (let cI = this.commandsToRemove.length; cI >= 0; cI--) {
            delete this.commandsToRemove[cI];
        }
        this.propertiesToChange = [];
        this.componentsToRemove = [];
        this.componentsToAdd = [];
        this.commandsToRemove = [];
        this.commandsToAdd = [];
    }
}
