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
    Timer,
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
    states: Map<EntityStates, null>

    constructor(newState: Map<EntityStates, null>, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.EntityState
        this.states = newState
    }
}
export class Position implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    x: number
    y: number

    constructor(newX: number, newY: number, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Position

        this.x = newX
        this.y = newY
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

export enum TimerTypes {
    Animation
}

export class Timer implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    timeLeft: number
    originalTime: number
    timerType: TimerTypes

    isFinished: boolean
    isRestart: boolean

    constructor(newTimeLeft: number, newTimerType: number, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Timer

        this.isFinished = false
        this.isRestart = false

        this.timeLeft = newTimeLeft
        this.originalTime = newTimeLeft
        this.timerType = newTimerType
    }
}

export class ClassesDiff {
    removed: string[]
    added: string[]

    constructor() {
        this.removed = []
        this.added = []
    }
}

export enum ElementTypes {
    Shadow,
    Entity,
}

export class ComputedElement implements ECS.Component {
    elementType: ElementTypes
    isChanged = false

    classes: string[]
    translateX: number
    translateY: number
    zIndex: number
    color: string
    displayElement: string

    classesDiff: ClassesDiff
    isTranslateXChanged: boolean
    isTranslateYChanged: boolean
    isZIndexChanged: boolean
    isColorChanged: boolean
    isDisplayElementChanged: boolean

    componentUid: number
    entityUid: number
    type: Components

    constructor(newElementType: ElementTypes, newEntityUid: number) {
        this.isChanged = false

        this.classes = ["base"]
        this.translateX = 0
        this.translateY = 0
        this.zIndex = 0
        this.color = "#000"
        this.displayElement = "?"

        this.classesDiff = new ClassesDiff()
        this.isTranslateXChanged = false
        this.isTranslateYChanged = false
        this.isZIndexChanged = false
        this.isColorChanged = false
        this.isDisplayElementChanged = false


        this.type = Components.ComputedElement
        this.entityUid = newEntityUid
        this.componentUid = Utils.newUid()
        this.elementType = newElementType
    }
}
