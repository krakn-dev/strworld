import * as Utils from "./utils.js";
export var Entities;
(function (Entities) {
    Entities[Entities["Human"] = 0] = "Human";
    Entities[Entities["Grass"] = 1] = "Grass";
})(Entities || (Entities = {}));
export class Grass {
    constructor() {
        this.isNew = true;
        this.entityType = Entities.Grass;
        this.entityUid = Utils.newUid();
    }
}
export class Human {
    constructor() {
        this.isNew = true;
        this.entityType = Entities.Human;
        this.entityUid = Utils.newUid();
    }
}
