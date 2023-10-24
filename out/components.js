import * as Utils from "./utils.js";
// TO ADD A NEW COMPONENT
// update switch statement in filter update
// insert new item in components enum
export var Components;
(function (Components) {
    Components[Components["Health"] = 0] = "Health";
    Components[Components["Name"] = 1] = "Name";
    Components[Components["Position"] = 2] = "Position";
    Components[Components["LookingDirection"] = 3] = "LookingDirection";
    Components[Components["EntityState"] = 4] = "EntityState";
    Components[Components["ComputedElement"] = 5] = "ComputedElement";
})(Components || (Components = {}));
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
export var Properties;
(function (Properties) {
    Properties[Properties["Classes"] = 0] = "Classes";
    Properties[Properties["Left"] = 1] = "Left";
    Properties[Properties["Top"] = 2] = "Top";
    Properties[Properties["ZIndex"] = 3] = "ZIndex";
    Properties[Properties["Color"] = 4] = "Color";
    Properties[Properties["DisplayElement"] = 5] = "DisplayElement";
})(Properties || (Properties = {}));
export class ComputedElement {
    get classes() {
        return this._properties[Properties.Classes];
    }
    set classes(newClasses) {
        this._isChanged = true;
        this.changedProperties[Properties.Classes] = true;
        this._properties[Properties.Classes] = newClasses;
    }
    get color() {
        return this._properties[Properties.Color];
    }
    set color(newColor) {
        this._isChanged = true;
        this.changedProperties[Properties.Color] = true;
        this._properties[Properties.Color] = newColor;
    }
    get left() {
        return this._properties[Properties.Left];
    }
    set left(newLeft) {
        this._isChanged = true;
        this.changedProperties[Properties.Left] = true;
        this._properties[Properties.Left] = newLeft;
    }
    get top() {
        return this._properties[Properties.Top];
    }
    set top(newTop) {
        this._isChanged = true;
        this.changedProperties[Properties.Top] = true;
        this._properties[Properties.Top] = newTop;
    }
    get zIndex() {
        return this._properties[Properties.ZIndex];
    }
    set zIndex(newZIndex) {
        this._isChanged = true;
        this.changedProperties[Properties.ZIndex] = true;
        this._properties[Properties.ZIndex] = newZIndex;
    }
    get displayElement() {
        return this._properties[Properties.DisplayElement];
    }
    set displayElement(newDisplayElement) {
        this._isChanged = true;
        this.changedProperties[Properties.DisplayElement] = true;
        this._properties[Properties.DisplayElement] = newDisplayElement;
    }
    getIsChanged() {
        return this._isChanged;
    }
    setUnchanged() {
        this._isChanged = false;
    }
    constructor(newOwnerUid) {
        this._properties = [["state"], 0, 0, 0, "#000000", "?"];
        this.changedProperties = [true, true, true, true, true, true];
        this._isChanged = true;
        this.type = Components.ComputedElement;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
    }
}
export class LookingDirection {
    get isLookingRight() {
        return this._isLookingRight;
    }
    set isLookingRight(newIsLookingRight) {
        this._isChanged = true;
        this._isLookingRight = newIsLookingRight;
    }
    getIsChanged() {
        return this._isChanged;
    }
    setUnchanged() {
        this._isChanged = false;
    }
    constructor(newIsLookingRight, newOwnerUid) {
        this._isLookingRight = newIsLookingRight;
        this._isChanged = true;
        this.type = Components.LookingDirection;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
    }
}
export class EntityState {
    setUnchanged() {
        this._isChanged = false;
    }
    getIsChanged() {
        return this._isChanged;
    }
    get currentState() {
        return this._currentState;
    }
    set currentState(newCurrentState) {
        this._isChanged = true;
        this._currentState = newCurrentState;
    }
    constructor(newCurrentState, newOwnerUid) {
        this._currentState = newCurrentState;
        this._isChanged = true;
        this.type = Components.EntityState;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
    }
}
export class Position {
    get position() {
        return this._position;
    }
    set position(newPosition) {
        this._isChanged.bool = true;
        this._position = newPosition;
    }
    setUnchanged() {
        this.position.isChanged.bool = false;
        this._isChanged.bool = false;
    }
    getIsChanged() {
        return this._isChanged.bool || this.position.isChanged.bool;
    }
    constructor(newPosition, newOwnerUid) {
        this._isChanged = new Utils.Bool(true);
        this._position = newPosition;
        this.type = Components.Position;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
    }
}
export class Health {
    setUnchanged() {
        this._isChanged = false;
    }
    getIsChanged() {
        return this._isChanged;
    }
    get health() {
        return this._health;
    }
    set health(newHealth) {
        this._isChanged = true;
        this._health = newHealth;
    }
    constructor(newHealth, newOwnerUid) {
        this._isChanged = true;
        this.type = Components.Health;
        this._health = newHealth;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
    }
}
export class Name {
    setUnchanged() {
        this._isChanged = false;
    }
    getIsChanged() {
        return this._isChanged;
    }
    get name() {
        return this._name;
    }
    set name(newName) {
        this._isChanged = true;
        this._name = newName;
    }
    constructor(newName, newOwnerUid) {
        this._name = newName;
        this._isChanged = true;
        this.type = Components.Name;
        this.ownerUid = newOwnerUid;
        this.componentUid = Utils.newUid();
    }
}
