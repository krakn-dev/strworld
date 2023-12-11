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
    Components[Components["Animation"] = 7] = "Animation";
    Components[Components["TargetLocation"] = 8] = "TargetLocation";
    Components[Components["Timer"] = 9] = "Timer";
    Components[Components["Force"] = 10] = "Force";
    Components[Components["Size"] = 11] = "Size";
    Components[Components["Mass"] = 12] = "Mass";
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
    EntityTypes[EntityTypes["Player"] = 1] = "Player";
    EntityTypes[EntityTypes["Grass"] = 2] = "Grass";
    EntityTypes[EntityTypes["Dog"] = 3] = "Dog";
})(EntityTypes || (EntityTypes = {}));
export var EntityStates;
(function (EntityStates) {
    EntityStates[EntityStates["Idle"] = 0] = "Idle";
    EntityStates[EntityStates["Run"] = 1] = "Run";
    EntityStates[EntityStates["Follow"] = 2] = "Follow";
    EntityStates[EntityStates["Attack"] = 3] = "Attack";
    EntityStates[EntityStates["Chase"] = 4] = "Chase";
})(EntityStates || (EntityStates = {}));
export class TargetLocation {
    constructor(newLocation, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.TargetLocation;
        this.x = newLocation.x;
        this.y = newLocation.y;
    }
}
export class EntityType {
    constructor(newEntityType, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.EntityType;
        this.entityType = newEntityType;
    }
}
export class EntityState {
    constructor(newState, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.EntityState;
        this.states = newState;
    }
}
export class Position {
    constructor(newPosition, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Position;
        this.x = newPosition.x;
        this.y = newPosition.y;
        this.z = newPosition.z;
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
export class Animation {
    constructor(newAnimations, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Animation;
        this.currentDisplayElement = "?";
        this.animations = newAnimations;
    }
}
export class Force {
    constructor(newMomentum, newEntityUid) {
        this.x = newMomentum.x;
        this.y = newMomentum.y;
        this.z = newMomentum.z;
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Force;
    }
}
export class Mass {
    constructor(newMass, newEntityUid) {
        this.mass = newMass;
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Mass;
    }
}
export class Size {
    constructor(newSize, newEntityUid) {
        this.x = newSize.x;
        this.y = newSize.y;
        this.z = newSize.z;
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Size;
    }
}
export var TimerTypes;
(function (TimerTypes) {
    TimerTypes[TimerTypes["Animation"] = 0] = "Animation";
})(TimerTypes || (TimerTypes = {}));
export class Timer {
    constructor(newTimeLeft, newTimerType, newEntityUid) {
        this.componentUid = Utils.newUid();
        this.entityUid = newEntityUid;
        this.type = Components.Timer;
        this.isFinished = false;
        this.isRestart = false;
        this.timeLeft = newTimeLeft;
        this.originalTime = newTimeLeft;
        this.timerType = newTimerType;
    }
}
export var ElementTypes;
(function (ElementTypes) {
    ElementTypes[ElementTypes["Shadow"] = 0] = "Shadow";
    ElementTypes[ElementTypes["Entity"] = 1] = "Entity";
})(ElementTypes || (ElementTypes = {}));
export var ElementClasses;
(function (ElementClasses) {
    ElementClasses[ElementClasses["Base"] = 0] = "Base";
})(ElementClasses || (ElementClasses = {}));
export class ComputedElement {
    constructor(newElementType, newEntityUid) {
        this.isChanged = false;
        this.isChanged = false;
        this.classes = new Map([[ElementClasses.Base, "base"]]);
        this.translateX = 0;
        this.translateY = 0;
        this.zIndex = 0;
        this.color = "#000";
        this.displayElement = "?";
        this.removedClasses = new Map();
        this.addedClasses = new Map();
        this.isTranslateXChanged = false;
        this.isTranslateYChanged = false;
        this.isZIndexChanged = false;
        this.isColorChanged = false;
        this.isDisplayElementChanged = false;
        this.type = Components.ComputedElement;
        this.entityUid = newEntityUid;
        this.componentUid = Utils.newUid();
        this.elementType = newElementType;
    }
}
