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
import * as Comps from "./components.js";
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
export class System {
    getComponents() {
        return this.components;
    }
    getEntities() {
        return this.entities;
    }
    constructor() {
        this.commands = [];
    }
    addEntity(newEntity) {
        this.entities.push(newEntity);
    }
    removeEntity(entityUid) {
        this.removeComponent([Get.All, null, By.EntityId, entityUid]);
        for (let [i, e] of this.entities.entries()) {
            if (e.entityUid == entityUid) {
                this.entities.splice(i, 1);
                return;
            }
        }
    }
    addComponent(newComponent) {
        this.components[newComponent.type].push(newComponent);
    }
    removeComponent(query) {
        if (query[1] == null) { // null == all
            query[1] = [];
            for (let i = 0; i < Object.keys(Comps.Components).length / 2; i++) {
                query[1][i] = i;
            }
        }
        // Comment on production !TODO
        if (query[1].length == 0) {
            console.log("no components expecified");
            return [];
        }
        if (query[2] == By.EntityType && query[3] == undefined ||
            query[2] == By.ComponentId && typeof query[3] != "number" ||
            query[2] == By.EntityId && typeof query[3] != "number" ||
            query[2] == By.Any && typeof query[3] != null) {
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
        if (query[0] == Get.One) {
            for (let qc of query[1]) {
                if (query[2] == By.ComponentId) {
                    for (let [i, c] of this.components[qc].entries()) {
                        if (query[3] == c.componentUid) {
                            this.components[qc].splice(i, 1);
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
                    for (let [i, c] of this.components[qc].entries()) {
                        if (query[3] == c.ownerUid) {
                            this.components[qc].splice(i, 1);
                            break;
                        }
                    }
                    continue;
                }
            }
        }
        else { // Get.All
            for (let qc of query[1]) {
                if (query[2] == By.EntityId) {
                    for (let [i, c] of this.components[qc].entries()) {
                        if (query[3] == c.ownerUid) {
                            this.components[qc].splice(i, 1);
                        }
                    }
                    continue;
                }
                if (query[2] == By.Any) {
                    for (let qc = 0; qc < this.components.length; qc++) {
                        for (let [i, c] of this.components[qc].entries()) {
                            this.components[qc].splice(i, 1);
                        }
                    }
                    continue;
                }
                else { // By.EntityType
                    for (let e of this.entities) {
                        if (query[3] == e.entityType) {
                            for (let qc of query[1]) {
                                for (let [i, c] of this.components[qc].entries()) {
                                    if (e.entityUid == c.ownerUid) {
                                        this.components[qc].splice(i, 1);
                                    }
                                }
                            }
                            break;
                        }
                    }
                    continue;
                }
            }
        }
    }
    addCommand(newCommand) {
        this.commands.push(newCommand);
    }
    removeCommand(commandType) {
        for (let [i, c] of this.commands.entries()) {
            if (c.type == commandType) {
                this.commands.splice(i, 1);
            }
        }
    }
    filterUpdate(newData) {
        let start = performance.now();
        let isInitialized = false;
        for (let ctI = 0; ctI < this.components.length; ctI++) {
            if (newData[0][ctI].length != 0) {
                isInitialized = true;
            }
        }
        if (!isInitialized) {
            console.log("is not initialized yet");
            return;
        }
        let isFound = false;
        for (let ctI = 0; ctI < this.components.length; ctI++) {
            for (let cI = this.components[ctI].length - 1; cI >= 0; cI--) {
                for (let newC of newData[0][ctI]) {
                    if (newC.componentUid == this.components[ctI][cI].componentUid) {
                        isFound = true;
                        break;
                    }
                }
                if (!isFound) {
                    this.components[ctI].splice(cI, 1);
                }
                isFound = false;
            }
        }
        // for entities
        isFound = false;
        for (let eI = this.entities.length - 1; eI >= 0; eI--) {
            for (let newE of newData[1]) {
                if (newE.entityUid == this.entities[eI].entityUid) {
                    isFound = true;
                    break;
                }
            }
            if (!isFound) {
                this.entities.splice(eI, 1);
            }
            isFound = false;
        }
        // update changed components
        isFound = false;
        for (let ctI = 0; ctI < this.components.length; ctI++) {
            for (let newC of newData[0][ctI]) {
                switch (newC.type) {
                    case (Comps.Components.Position):
                        Object.setPrototypeOf(newC, Comps.Position.prototype);
                        break;
                    case (Comps.Components.ComputedElement):
                        Object.setPrototypeOf(newC, Comps.ComputedElement.prototype);
                        break;
                    case (Comps.Components.Health):
                        Object.setPrototypeOf(newC, Comps.Health.prototype);
                        break;
                    case (Comps.Components.LookingDirection):
                        Object.setPrototypeOf(newC, Comps.LookingDirection.prototype);
                        break;
                    case (Comps.Components.EntityState):
                        Object.setPrototypeOf(newC, Comps.EntityState.prototype);
                        break;
                    case (Comps.Components.Name):
                        Object.setPrototypeOf(newC, Comps.Name.prototype);
                        break;
                }
                if (newC.getIsChanged()) {
                    newC.setUnchanged();
                    for (let [cI, c] of this.components[ctI].entries()) {
                        if (c.componentUid == newC.componentUid) {
                            isFound = true;
                            this.components[ctI][cI] = newC;
                            break;
                        }
                    }
                    if (!isFound) {
                        this.components[ctI].push(newC);
                    }
                    isFound = false;
                }
            }
        }
        // for entities too
        for (let newE of newData[1]) {
            if (newE.isNew) {
                newE.isNew = false;
                this.entities.push(newE);
            }
        }
        let end = performance.now();
        console.log(end - start, " filter");
    }
    update(newData) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let cTI = 0; cTI < newData[0].length; cTI++) {
                switch (cTI) {
                    case Comps.Components.Position:
                        for (let cI = 0; cI < newData[0][cTI].length; cI++) {
                            Object.setPrototypeOf(newData[0][cTI][cI], Comps.Position.prototype);
                            Object.setPrototypeOf(newData[0][cTI][cI].position, Utils.Vector2.prototype);
                        }
                        break;
                    case Comps.Components.ComputedElement:
                        for (let cI = 0; cI < newData[0][cTI].length; cI++) {
                            Object.setPrototypeOf(newData[0][cTI][cI], Comps.ComputedElement.prototype);
                        }
                        break;
                    case Comps.Components.EntityState:
                        for (let cI = 0; cI < newData[0][cTI].length; cI++) {
                            Object.setPrototypeOf(newData[0][cTI][cI], Comps.EntityState.prototype);
                        }
                        break;
                    case Comps.Components.Health:
                        for (let cI = 0; cI < newData[0][cTI].length; cI++) {
                            Object.setPrototypeOf(newData[0][cTI][cI], Comps.Health.prototype);
                        }
                        break;
                    case Comps.Components.LookingDirection:
                        for (let cI = 0; cI < newData[0][cTI].length; cI++) {
                            Object.setPrototypeOf(newData[0][cTI][cI], Comps.LookingDirection.prototype);
                        }
                        break;
                    case Comps.Components.Name:
                        for (let cI = 0; cI < newData[0][cTI].length; cI++) {
                            Object.setPrototypeOf(newData[0][cTI][cI], Comps.Name.prototype);
                        }
                        break;
                }
            }
            this.components = newData[0];
            this.entities = newData[1];
        });
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
                    for (let c of this.components[qc]) {
                        if (query[3] == c.componentUid) {
                            collected[qci].push(c);
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
                    for (let c of this.components[qc]) {
                        if (query[3] == c.ownerUid) {
                            collected[qci].push(c);
                            break;
                        }
                    }
                    continue;
                }
            }
            else if (query[0] == Get.All) {
                if (query[2] == By.EntityId) {
                    for (let c of this.components[qc]) {
                        if (query[3] == c.ownerUid) {
                            collected[qci].push(c);
                        }
                    }
                    continue;
                }
                else if (query[2] == By.Any) {
                    collected[qci] = this.components[qc];
                    continue;
                }
                else if (query[2] == By.EntityType) {
                    for (let e of this.entities) {
                        if (query[3] == e.entityType) {
                            for (let c of this.components[qc]) {
                                if (e.entityUid == c.ownerUid) {
                                    collected[qci].push(c);
                                }
                            }
                            break;
                        }
                    }
                    continue;
                }
            }
        }
        return collected;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.commands.reverse(); // run commands in order
            for (let cI = this.commands.length - 1; cI >= 0; cI--) {
                if (this.commands[cI].query != null)
                    this.commands[cI].run(this.find(this.commands[cI].query));
                else
                    this.commands[cI].run([]);
                if (this.commands[cI].frequency == Run.Once) {
                    this.commands.splice(cI, 1);
                }
            }
            this.commands.reverse(); // undo reverse
        });
    }
}
