import * as ECS from "./ecs"
import * as Utils from "../utils"
import * as CANNON from 'cannon-es'

export enum ComponentTypes {
    Health = 0,
    Camera,
    Light,
    Velocity,
    Rotation,
    EntityState,
    Name,
    EntityType,
    Position,
    TargetLocation,
    Timer,
    Shape,
    Mass,
    ShapeColor,
    Force,
    HardCodedId,
    Code,
    RigidBody,
    Constraint,
    Vehicle,
    Wheel,
    //    Robot,
}

export const NUMBER_OF_COMPONENTS = (() => { // fill component list with the number of component types
    let n: number = 0
    for (let i = 0; i < Object.keys(ComponentTypes).length / 2; i++) {
        n++
    }
    return n
})()


export enum TimerTypes {
    Animation
}
export enum EntityTypes {
    Stickman,
    Grass,
    Dog,
    Camera,
    Light,
    GeometricShape,
    Robot,
    Wheel,
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
export enum ShapeTypes {
    Box,
    Cylinder,
}
export enum ConstraintTypes {
    PointToPoint,
    Lock,
    Distance,
}
export enum BodyTypes {
    Dynamic,
    Static,
    Kinematic,
}
//export class Robot implements ECS.Component {
//    entityUid: number
//    componentUid: number
//    componentType: ComponentTypes
//    childrenComponent: []
//    constructor(
//        newCode: string,
//        newEntityUid: number
//    ) {
//        this.componentUid = Utils.newUid()
//        this.entityUid = newEntityUid
//        this.componentType = ComponentTypes.Code
//        this.code = newCode
//    }
//}

export class Vehicle implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    controller: CANNON.RaycastVehicle
    constructor(
        body: CANNON.Body,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Vehicle
        this.controller = new CANNON.RaycastVehicle({ chassisBody: body })
    }
}
export class Wheel implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    wheelIndex: number | undefined
    entityUidVehicle: number
    positionRelativeToVehicle: Utils.Vector3
    constructor(
        newEntityUidVehicle: number,
        newPositionRelativeToVehicle: Utils.Vector3,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Wheel
        this.wheelIndex = undefined
        this.entityUidVehicle = newEntityUidVehicle
        this.positionRelativeToVehicle = newPositionRelativeToVehicle
    }
}

export class Code implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    code: string
    constructor(
        newCode: string,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Code
        this.code = newCode
    }
}

export class Constraint implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes

    entityUidConstrainedTo: number
    constraintType: ConstraintTypes
    distance: number
    constructor(
        newEntityUidConstrainedTo: number,
        newConstraintType: ConstraintTypes,
        newDistance: number,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Constraint
        this.constraintType = newConstraintType
        this.entityUidConstrainedTo = newEntityUidConstrainedTo
        this.distance = newDistance
    }
}
export class AngularLock implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    body: CANNON.Body

    constructor(
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.RigidBody
        this.body = new CANNON.Body({ type: CANNON.BODY_TYPES.DYNAMIC })
    }
}
export class RigidBody implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    body: CANNON.Body
    bodyType: BodyTypes
    disableCollisions: boolean
    constructor(
        newBodyType: BodyTypes,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.RigidBody
        this.body = new CANNON.Body()
        this.disableCollisions = false
        this.bodyType = newBodyType
    }
}
export class HardCodedId implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    id: number
    constructor(
        newId: number,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.HardCodedId
        this.id = newId
    }
}
export class ShapeColor implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    color: number
    constructor(
        newColor: number,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.ShapeColor
        this.color = newColor
    }
}
export class Shape implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    size: Utils.Vector3 | undefined
    radiusTop: number | undefined
    radiusBottom: number | undefined
    height: number | undefined
    numberOfSegments: number | undefined
    shapeType: ShapeTypes
    constructor(
        newShapeType: ShapeTypes,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Shape
        this.shapeType = newShapeType
    }
}
export class Light implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    lightType: LightTypes
    intensity: number
    color: number
    distance: number
    decay: number
    constructor(
        newLightType: LightTypes,
        newIntensity: number,
        newColor: number,
        newDistance: number,
        newDecay: number,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Light
        this.lightType = newLightType
        this.intensity = newIntensity
        this.color = newColor
        this.distance = newDistance
        this.decay = newDecay
    }
}
export class Camera implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
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
        this.componentType = ComponentTypes.Camera
        this.fov = newFov
        this.near = newNear
        this.far = newFar
        this.aspect = newAspect
    }
}

export class TargetPosition implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    x: number
    y: number
    z: number

    constructor(newLocation: Utils.Vector3, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.TargetLocation
        this.x = newLocation.x
        this.y = newLocation.y
        this.z = newLocation.z
    }
}
export class EntityType implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    entityType: EntityTypes

    constructor(newEntityType: EntityTypes, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.EntityType
        this.entityType = newEntityType
    }
}
export class EntityState implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    states: EntityStates[]

    constructor(newState: EntityStates[], newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.EntityState
        this.states = newState
    }
}
export class Position implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    x: number
    y: number
    z: number

    constructor(newPosition: Utils.Vector3, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Position

        this.x = newPosition.x
        this.y = newPosition.y
        this.z = newPosition.z
    }
}

export class Health implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    health: number

    constructor(newHealth: number, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Health
        this.health = newHealth
    }
}
export class Velocity implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    x: number
    y: number
    z: number

    constructor(newVelocity: Utils.Vector3, newEntityUid: number) {
        this.x = newVelocity.x
        this.y = newVelocity.y
        this.z = newVelocity.z

        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Velocity
    }
}
export class Force implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    x: number
    y: number
    z: number

    xToApply: number
    yToApply: number
    zToApply: number
    constructor(newForce: Utils.Vector3, newEntityUid: number) {
        this.x = newForce.x
        this.y = newForce.y
        this.z = newForce.z

        this.xToApply = 0
        this.yToApply = 0
        this.zToApply = 0

        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Force
    }
}
export class Mass implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    mass: number

    constructor(newMass: number, newEntityUid: number) {
        this.mass = newMass
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Mass
    }
}
export class Rotation implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    x: number
    y: number
    z: number
    w: number


    constructor(newRotation: Utils.Vector3, newEntityUid: number) {
        let quaternion = new CANNON.Quaternion()
            .setFromEuler(
                Utils.degreesToRadians(newRotation.x),
                Utils.degreesToRadians(newRotation.y),
                Utils.degreesToRadians(newRotation.z))
        this.x = quaternion.x
        this.y = quaternion.y
        this.z = quaternion.z
        this.w = quaternion.w
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Rotation
    }
}

export class Timer implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    originalTime: number

    timeLeft: number
    timerType: TimerTypes
    isFinished: boolean
    isRestart: boolean

    constructor(newTimeLeft: number, newTimerType: number, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Timer

        this.isFinished = false
        this.isRestart = false

        this.timeLeft = newTimeLeft
        this.originalTime = newTimeLeft
        this.timerType = newTimerType
    }
}
