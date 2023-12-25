import { Vector2 } from "three"
import * as ECS from "./ecs"
import * as Utils from "./utils"

export enum Components {
    Health = 0,
    Camera,
    Light,
    Rotation,
    EntityState,
    Name,
    EntityType,
    Position,
    LookingDirection,
    ComputedElement,
    TargetLocation,
    Timer,
    Size,
    Mass,
    Force,
}

export const NUMBER_OF_COMPONENTS = (() => { // fill component list with the number of component types
    let n: number = 0
    for (let i = 0; i < Object.keys(Components).length / 2; i++) {
        n++
    }
    return n
})()

export enum EntityTypes {
    Stickman,
    Grass,
    Dog,
    Camera,
    Light,
}
export enum EntityStates {
    Idle,
    Run,
    Follow,
    Attack,
    Chase,
}
export enum LightTypes {
    AmbientLight,
    PointLight,
    DirectionalLight,
    SpotLight,
}
export class Light implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    lightType: LightTypes
    power: number
    color: string
    distance: number
    decay: number
    constructor(
        newLightType: LightTypes,
        newPower: number,
        newColor: string,
        newDistance: number,
        newDecay: number,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Light
        this.lightType = newLightType
        this.power = newPower
        this.color = newColor
        this.distance = newDistance
        this.decay = newDecay
    }
}
export class Camera implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    fov: number
    near: number
    far: number
    aspect: number
    constructor(
        newFov: number,
        newNear: number,
        newFar: number,
        newAspect: number,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Camera
        this.fov = newFov
        this.near = newNear
        this.far = newFar
        this.aspect = newAspect
    }
}

export class TargetLocation implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    x: number
    y: number

    constructor(newLocation: Utils.Vector2, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.TargetLocation
        this.x = newLocation.x
        this.y = newLocation.y
    }
}
export class EntityType implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    entityType: EntityTypes

    constructor(newEntityType: EntityTypes, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.EntityType
        this.entityType = newEntityType
    }
}
export class EntityState implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    states: EntityStates[]

    constructor(newState: EntityStates[], newEntityUid: number) {
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
    z: number

    constructor(newPosition: Utils.Vector3, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Position

        this.x = newPosition.x
        this.y = newPosition.y
        this.z = newPosition.z
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

//export class Animation implements ECS.Component {
//    entityUid: number
//    componentUid: number
//    type: Components
//    currentDisplayElement: string
//    animations: Anims.Animation[]
//
//    constructor(newAnimations: Anims.Animation[], newEntityUid: number) {
//        this.componentUid = Utils.newUid()
//        this.entityUid = newEntityUid
//        this.type = Components.Animation
//        this.currentDisplayElement = "?"
//        this.animations = newAnimations
//    }
//}

export class Force implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    x: number
    y: number
    z: number

    constructor(newMomentum: Utils.Vector3, newEntityUid: number) {
        this.x = newMomentum.x
        this.y = newMomentum.y
        this.z = newMomentum.z
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Force
    }
}
export class Mass implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    mass: number

    constructor(newMass: number, newEntityUid: number) {
        this.mass = newMass
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Mass
    }
}
export class Rotation implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    x: number
    y: number
    z: number

    constructor(newRotation: Utils.Vector3, newEntityUid: number) {
        this.x = newRotation.x
        this.y = newRotation.y
        this.z = newRotation.z
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Size
    }
}
export class Size implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    x: number
    y: number
    z: number

    constructor(newSize: Utils.Vector3, newEntityUid: number) {
        this.x = newSize.x
        this.y = newSize.y
        this.z = newSize.z
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.type = Components.Size
    }
}

export enum TimerTypes {
    Animation
}

export class Timer implements ECS.Component {
    entityUid: number
    componentUid: number
    type: Components
    originalTime: number

    timeLeft: number
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

export class ChangedGraphicProperties implements ECS.Component {
    properties: ECS.Component[]
    componentUid: number
    entityUid: number
    type: Components

    constructor(newEntityUid: number) {
        this.properties = []
        this.type = Components.ComputedElement
        this.entityUid = newEntityUid
        this.componentUid = Utils.newUid()
    }
}
