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
export const NUMBER_OF_COMPONENTS = (() => {
    let n = 0;
    for (let i = 0; i < Object.keys(Components).length / 2; i++) {
        n++;
    }
    return n;
})();
export var EntityTypes;
(function (EntityTypes) {
    EntityTypes[EntityTypes["Human"] = 0] = "Human";
    EntityTypes[EntityTypes["Grass"] = 1] = "Grass";
})(EntityTypes || (EntityTypes = {}));
export class Position {
    constructor(newPosition, newEntityUid) {
        this.isChanged = false;
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Position;
        this.position = newPosition;
    }
}
export class Health {
    constructor(newHealth, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Health;
        this.health = newHealth;
    }
}
export var Properties;
(function (Properties) {
    Properties[Properties["Classes"] = 0] = "Classes";
    Properties[Properties["Left"] = 1] = "Left";
    Properties[Properties["Top"] = 2] = "Top";
    Properties[Properties["ZIndex"] = 3] = "ZIndex";
    Properties[Properties["Color"] = 4] = "Color";
    Properties[Properties["DisplayElement"] = 5] = "DisplayElement";
})(Properties || (Properties = {}));
export class ClassesDiff {
    constructor() {
        this.deleted = [];
        this.added = [];
    }
}
export class ComputedElement {
    constructor(newEntityUid) {
        this.isChanged = false;
        this.properties = [["state"], 0, 0, 0, "#000000", "?"];
        this.changedProperties = [new ClassesDiff(), false, false, false, false, false];
        this.type = Components.ComputedElement;
        this.entityUid = newEntityUid;
        this.componentUid = Utils.newUid();
    }
}
