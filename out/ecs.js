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
    constructor(newIndex, newProperty, newValue) {
        this.index = newIndex;
        this.property = newProperty;
        this.value = newValue;
    }
}
export class System {
    constructor() {
        this.counter = 0;
        this.commands = [];
        this.components = [];
        this.state = new Map();
        this.commandsToRemove = [];
        this.commandsToAdd = [];
        this.componentsToRemove = [];
        this.propertiesToChange = [];
        this.componentsToAdd = [];
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
    addComponent(newComponent) {
        this.componentsToAdd.push(newComponent);
    }
    setProperty(component, property, value) {
        this.propertiesToChange.push(new PropertyChange(component.index, property, value));
    }
    addCommand(command) {
        this.commandsToAdd.push(command);
    }
    removeCommand(command) {
        this.commandsToRemove.push(command);
    }
    update(newComponents, newCommands, newState) {
        this.components = newComponents;
        this.commands = [];
        for (let cT of newCommands) {
            switch (cT) {
                case Cmds.Commands.ShowHealth:
                    this.commands.push(new Cmds.ShowHealth());
                    break;
                case Cmds.Commands.CreateHealth:
                    this.commands.push(new Cmds.CreateHealth());
                    break;
            }
        }
        this.state = newState;
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
                            collected[qci].push(new ComponentAndIndex(c, [qci, cI]));
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(new ComponentAndIndex(c, [qci, cI]));
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
                            collected[qci].push(new ComponentAndIndex(c, [qci, cI]));
                        }
                    }
                    continue;
                }
                else if (query[2] == By.Any) {
                    for (let [cI, c] of this.components[qci].entries()) {
                        collected[qci].push(new ComponentAndIndex(c, [qci, cI]));
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
            if (this.counter == 1000) {
                console.log("command run this many times", this.counter);
            }
            this.counter++;
            let foundComponents = [];
            if (c.query != null)
                foundComponents = this.find(c.query);
            c.run(foundComponents, this);
        }
        this.workerManager.postMessage(new Utils.Message(Utils.Messages.Done, new Utils.WorkerOutput(this.propertiesToChange, this.componentsToRemove, this.componentsToAdd, this.state, this.commandsToRemove, this.commandsToAdd)));
        this.commandsToAdd = [];
        this.commandsToRemove = [];
        this.componentsToAdd = [];
        this.componentsToRemove = [];
        this.propertiesToChange = [];
    }
}
