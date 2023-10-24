import * as Utils from "./utils.js";
export var Components;
(function (Components) {
    Components[Components["Health"] = 0] = "Health";
    Components[Components["Name"] = 1] = "Name";
    Components[Components["Position"] = 2] = "Position";
    Components[Components["LookingDirection"] = 3] = "LookingDirection";
    Components[Components["EntityState"] = 4] = "EntityState";
    Components[Components["ComputedElement"] = 5] = "ComputedElement";
    Components[Components["EntityType"] = 6] = "EntityType";
})(Components || (Components = {}));
export var Entities;
(function (Entities) {
    Entities[Entities["Human"] = 0] = "Human";
    Entities[Entities["Grass"] = 1] = "Grass";
})(Entities || (Entities = {}));
export class Health {
    constructor(newHealth, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Health;
        this.health = newHealth;
    }
}
