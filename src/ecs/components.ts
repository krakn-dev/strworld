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
    ComposedShape,
    Mass,
    ShapeColor,
    Force,
    HardCodedId,
    Code,
    RigidBody,
    Constraint,
    Wheel,
    RobotComponent,
    Robot,
    RobotSuperComponent
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
    RobotComponent,
    RobotSuperComponent
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
    Hinge,
}
export enum BodyTypes {
    Dynamic,
    Static,
    Kinematic,
}
export enum MaterialTypes {
    Default,
    Wheel,
}
export enum RobotComponentTypes {
    Wheel,
    Processor,
    SteelPlate,
    WoodenStick,
}

export class RobotSuperComponent implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    robotComponentsEntityUid: number[]
    robotEntityUidAttachedTo: number
    constructor(
        newRobotComponentsEntityUid: number[],
        newRobotEntityUidAttachedTo: number,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.RobotSuperComponent
        this.robotComponentsEntityUid = newRobotComponentsEntityUid
        this.robotEntityUidAttachedTo = newRobotEntityUidAttachedTo
    }
}
export class ComposedShape implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    shapesEntityUid: number[]
    constructor(
        newShapesEntityUid: number[],
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.ComposedShape
        this.shapesEntityUid = newShapesEntityUid
    }
}
export class RobotComponent implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    robotComponentType: RobotComponentTypes
    positionOffset: Utils.Vector3
    rotationOffset: Utils.Quaternion
    robotEntityUidAttachedTo: number
    constructor(
        newRobotComponentType: RobotComponentTypes,
        newPositionOffset: Utils.Vector3,
        newRotationOffset: Utils.Quaternion,
        newRobotEntityUidAttachedTo: number,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.positionOffset = newPositionOffset
        this.rotationOffset = newRotationOffset
        this.componentType = ComponentTypes.RobotComponent
        this.robotComponentType = newRobotComponentType
        this.robotEntityUidAttachedTo = newRobotEntityUidAttachedTo
    }
}
export class Wheel implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    velocity: number
    isOn: boolean
    constructor(
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Wheel
        this.velocity = 0
        this.isOn = false
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
    distance: number | undefined
    pivotA: Utils.Vector3 | undefined
    pivotB: Utils.Vector3 | undefined
    axisA: Utils.Vector3 | undefined
    axisB: Utils.Vector3 | undefined
    constraint: CANNON.Constraint | undefined
    constructor(
        newEntityUidConstrainedTo: number,
        newConstraintType: ConstraintTypes,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Constraint
        this.constraintType = newConstraintType
        this.entityUidConstrainedTo = newEntityUidConstrainedTo
    }
}
export class RigidBody implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    body: CANNON.Body | undefined
    bodyType: BodyTypes
    disableCollisions: boolean
    materialType: MaterialTypes
    constructor(
        newBodyType: BodyTypes,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.RigidBody
        this.disableCollisions = false
        this.bodyType = newBodyType
        this.materialType = MaterialTypes.Default
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
    shape: CANNON.Shape | undefined
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
