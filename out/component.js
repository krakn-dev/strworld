import * as Utils from "./utils.js";
export var Entities;
(function (Entities) {
    Entities[Entities["Human"] = 0] = "Human";
    Entities[Entities["Grass"] = 1] = "Grass";
})(Entities || (Entities = {}));
export var EntityStates;
(function (EntityStates) {
    EntityStates[EntityStates["Idle"] = 0] = "Idle";
    EntityStates[EntityStates["Dead"] = 1] = "Dead";
    EntityStates[EntityStates["WindLeft"] = 2] = "WindLeft";
    EntityStates[EntityStates["WindRight"] = 3] = "WindRight";
    EntityStates[EntityStates["Shoot"] = 4] = "Shoot";
    EntityStates[EntityStates["Reload"] = 5] = "Reload";
    EntityStates[EntityStates["Run"] = 6] = "Run";
})(EntityStates || (EntityStates = {}));
export var Components;
(function (Components) {
    Components[Components["Health"] = 0] = "Health";
    Components[Components["Name"] = 1] = "Name";
    Components[Components["Position"] = 2] = "Position";
    Components[Components["LookingDirection"] = 3] = "LookingDirection";
    Components[Components["EntityState"] = 4] = "EntityState";
})(Components || (Components = {}));
export class LookingDirection {
    constructor(newOwnerUid) {
        this.isLookingRight = true;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
    }
}
export class EntityState {
    constructor(newOwnerUid) {
        this.currentState =
            this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.EntityState;
    }
}
export class Position {
    constructor(newPosition, newOwnerUid) {
        this.position = newPosition;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.Position;
    }
}
export class Health {
    constructor(newHealth, newOwnerUid) {
        this.health = newHealth;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.Health;
    }
}
export class Name {
    constructor(newName, newOwnerUid) {
        this.name = newName;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
        this.componentType = Components.Name;
    }
}
