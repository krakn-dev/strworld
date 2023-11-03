import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Anims from "./animations.js"

export enum Components {
    Health = 0,
    Name,
    Position,
    LookingDirection,
    EntityState,
    ComputedElement,
    EntityType,
    Animation,
}

export const NUMBER_OF_COMPONENTS = (() => { // fill component list with the number of component types
    let n: number = 0
    for (let i = 0; i < Object.keys(Components).length / 2; i++) {
        n++
    }
    return n
})()

export enum EntityTypes {
    Human,
    Grass,
}
export enum EntityStates {
    Idle,
    Run,
}
export class EntityState implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    state: EntityStates

    constructor(newState: EntityStates, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.EntityState
        this.state = newState
    }
}
export class Position implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    position: Utils.Vector2

    constructor(newPosition: Utils.Vector2, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Position
        this.position = newPosition
    }
}

export class Health implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    health: number

    constructor(newHealth: number, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Health
        this.health = newHealth
    }
}

export class Animation implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    currentDisplayElement: string
    animations: Anims.Animation[]

    constructor(newAnimations: Anims.Animation[], newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Animation
        this.currentDisplayElement = "?"
        this.animations = newAnimations
    }
}

export enum Properties {
    Classes = 0,
    Left,
    Top,
    ZIndex,
    Color,
    DisplayElement,
}

export class ClassesDiff {
    deleted: string[]
    added: string[]

    constructor() {
        this.deleted = []
        this.added = []
    }
}

export enum ElementTypes {
    Shadow,
    Entity,
}

export class ComputedElement implements ECS.Component {
    properties: [string[], number, number, number, string, string]
    changedProperties: [ClassesDiff, boolean, boolean, boolean, boolean, boolean]
    elementType: ElementTypes

    entityUid: number
    componentUid: number
    type: Components

    constructor(newElementType: ElementTypes, newEntityUid: number) {
        this.properties = [["base"], 0, 0, 0, "#000", "?"]
        this.changedProperties = [new ClassesDiff(), false, false, false, false, false]
        this.type = Components.ComputedElement
        this.entityUid = newEntityUid
        this.componentUid = Utils.newUid()
        this.elementType = newElementType
    }
}
