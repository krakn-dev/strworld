import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Graphics from "./graphics.js"

// TO ADD A NEW COMPONENT
// update switch statement in filter update
// insert new item in components enum


export enum Components {
    Health = 0,
    Name,
    Position,
    LookingDirection,
    EntityState,
    ComputedElement,
}

export enum EntityStates {
    Idle,
    Dead,
    WindLeft,
    WindRight,
    Shoot,
    Reload,
    Run,
}

export enum Properties {
    Classes = 0,
    Left,
    Top,
    ZIndex,
    Color,
    DisplayElement,
}

export class ComputedElement implements ECS.Component {
    private _properties: [string[], number, number, number, string, string]
    changedProperties: [boolean, boolean, boolean, boolean, boolean, boolean]
    private _isChanged: boolean

    get classes() {
        return this._properties[Properties.Classes]
    }
    set classes(newClasses: string[]) {
        this._isChanged = true
        this.changedProperties[Properties.Classes] = true
        this._properties[Properties.Classes] = newClasses
    }
    get color() {
        return this._properties[Properties.Color]
    }
    set color(newColor: string) {
        this._isChanged = true
        this.changedProperties[Properties.Color] = true
        this._properties[Properties.Color] = newColor
    }
    get left() {
        return this._properties[Properties.Left]
    }
    set left(newLeft: number) {
        this._isChanged = true
        this.changedProperties[Properties.Left] = true
        this._properties[Properties.Left] = newLeft
    }
    get top() {
        return this._properties[Properties.Top]
    }
    set top(newTop: number) {
        this._isChanged = true
        this.changedProperties[Properties.Top] = true
        this._properties[Properties.Top] = newTop
    }

    get zIndex() {
        return this._properties[Properties.ZIndex]
    }
    set zIndex(newZIndex: number) {
        this._isChanged = true
        this.changedProperties[Properties.ZIndex] = true
        this._properties[Properties.ZIndex] = newZIndex
    }
    get displayElement() {
        return this._properties[Properties.DisplayElement]
    }
    set displayElement(newDisplayElement: string) {
        this._isChanged = true
        this.changedProperties[Properties.DisplayElement] = true
        this._properties[Properties.DisplayElement] = newDisplayElement
    }
    getIsChanged(): boolean {
        return this._isChanged
    }
    setUnchanged(): void {
        this._isChanged = false
    }


    ownerUid: number
    componentUid: number
    type: Components

    constructor(newOwnerUid: number) {
        this._properties = [["state"], 0, 0, 0, "#000000", "?"]
        this.changedProperties = [true, true, true, true, true, true]
        this._isChanged = true
        this.type = Components.ComputedElement
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
    }
}


export class LookingDirection implements ECS.Component {
    private _isChanged: boolean
    private _isLookingRight: boolean

    get isLookingRight() {
        return this._isLookingRight
    }
    set isLookingRight(newIsLookingRight: boolean) {
        this._isChanged = true
        this._isLookingRight = newIsLookingRight
    }

    getIsChanged(): boolean {
        return this._isChanged
    }
    setUnchanged(): void {
        this._isChanged = false
    }

    ownerUid: number
    componentUid: number
    type: Components

    constructor(newIsLookingRight: boolean, newOwnerUid: number) {
        this._isLookingRight = newIsLookingRight

        this._isChanged = true
        this.type = Components.LookingDirection
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
    }
}

export class EntityState implements ECS.Component {
    private _isChanged: boolean
    private _currentState: EntityStates

    setUnchanged(): void {
        this._isChanged = false
    }

    getIsChanged(): boolean {
        return this._isChanged
    }

    get currentState() {
        return this._currentState
    }
    set currentState(newCurrentState: EntityStates) {
        this._isChanged = true
        this._currentState = newCurrentState
    }
    ownerUid: number
    componentUid: number
    type: Components

    constructor(newCurrentState: EntityStates, newOwnerUid: number) {
        this._currentState = newCurrentState

        this._isChanged = true
        this.type = Components.EntityState
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
    }
}

export class Position implements ECS.Component {

    private _isChanged: Utils.Bool
    private _position: Utils.Vector2

    get position() {
        return this._position
    }
    set position(newPosition: Utils.Vector2) {
        this._isChanged.bool = true
        this._position = newPosition
    }
    ownerUid: number
    componentUid: number
    type: Components

    setUnchanged() {
        this.position.isChanged.bool = false
        this._isChanged.bool = false
    }

    getIsChanged(): boolean {
        return this._isChanged.bool || this.position.isChanged.bool
    }

    constructor(newPosition: Utils.Vector2, newOwnerUid: number) {
        this._isChanged = new Utils.Bool(true)
        this._position = newPosition
        this.type = Components.Position
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
    }
}



export class Health implements ECS.Component {
    private _health: number
    private _isChanged: boolean

    setUnchanged() {
        this._isChanged = false
    }

    getIsChanged(): boolean {
        return this._isChanged
    }

    get health() {
        return this._health
    }
    set health(newHealth: number) {
        this._isChanged = true
        this._health = newHealth
    }
    ownerUid: number
    componentUid: number
    type: Components

    constructor(newHealth: number, newOwnerUid: number) {
        this._isChanged = true
        this.type = Components.Health
        this._health = newHealth
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
    }
}

export class Name implements ECS.Component {
    private _name: string
    private _isChanged: boolean

    setUnchanged() {
        this._isChanged = false
    }

    getIsChanged(): boolean {
        return this._isChanged
    }
    get name() {
        return this._name
    }
    set name(newName: string) {
        this._isChanged = true
        this._name = newName
    }

    ownerUid: number
    componentUid: number
    type: Components

    constructor(newName: string, newOwnerUid: number) {
        this._name = newName

        this._isChanged = true
        this.type = Components.Name
        this.ownerUid = newOwnerUid
        this.componentUid = Utils.newUid()
    }
}
