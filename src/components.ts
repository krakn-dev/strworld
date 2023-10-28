import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"

export enum Components {
    Health = 0,
    Name,
    Position,
    LookingDirection,
    EntityState,
    ComputedElement,
    EntityType,
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
export class Position implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    position: Utils.Vector2
    isChanged: boolean

    constructor(newPosition: Utils.Vector2, newEntityUid: number) {
        this.isChanged = false
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

export class ComputedElement implements ECS.Component {
    properties: [string[], number, number, number, string, string]
    changedProperties: [ClassesDiff, boolean, boolean, boolean, boolean, boolean]
    isChanged: boolean

    entityUid: number
    componentUid: number
    type: Components

    constructor(newEntityUid: number) {
        this.isChanged = false
        this.properties = [["state"], 0, 0, 0, "#000000", "?"]
        this.changedProperties = [new ClassesDiff(), false, false, false, false, false]
        this.type = Components.ComputedElement
        this.entityUid = newEntityUid
        this.componentUid = Utils.newUid()
    }
}
