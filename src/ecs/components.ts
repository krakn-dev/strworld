import * as ECS from "./ecs"
import * as Math from "../math"
import * as Utils from "../utils"
import { PhysXT } from "../physx/physx"

export enum ComponentTypes {
    Camera,
    Light,
    EntityState,
    EntityType,
    TargetLocation,
    Timer,
    Aggregate,
    Switch,
    Shape,
    Mass,
    ShapeColor,
    HardCodedId,
    Code,
    RigidBody,
    Constraint,
    Wheel,
    RobotComponent,
    Robot,
    RobotSuperComponent,
    Name,
    Force,
    Torque,
    LinearVelocity,
    AngularVelocity,
    Position,
    Rotation,
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
    Capsule,
    Cylinder,
    Compound
}
export enum ConstraintTypes {
    Lock,
    Distance,
    Hinge,
}
export enum BodyTypes {
    Dynamic,
    Static,
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

export class Switch implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    isOn: boolean
    constructor(
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Switch
        this.isOn = false
    }
}
export class Robot implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    graph: Utils.Graph
    constructor(
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Robot
        this.graph = new Utils.Graph()
    }
}
export class RobotSuperComponent implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    robotEntityUidAttachedTo: number
    constructor(
        newRobotEntityUidAttachedTo: number,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.RobotSuperComponent
        this.robotEntityUidAttachedTo = newRobotEntityUidAttachedTo
    }
}
export class Aggregate implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    aggregate: PhysXT.PxAggregate | undefined
    rigidBodiesEntityUid: number[]
    graph: Utils.Graph | undefined
    constructor(
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Aggregate
        this.rigidBodiesEntityUid = []
    }
}
export class RobotComponent implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    robotComponentType: RobotComponentTypes
    robotEntityUidAttachedTo: number
    constructor(
        newRobotComponentType: RobotComponentTypes,
        newRobotEntityUidAttachedTo: number,
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
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
    brake: boolean
    constructor(
        newEntityUid: number
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Wheel
        this.velocity = 0
        this.isOn = false
        this.brake = false
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
    pivotA: Math.Vector3 | undefined
    pivotB: Math.Vector3 | undefined
    axisA: Math.Quaternion | undefined
    axisB: Math.Quaternion | undefined

    constraint: PhysXT.PxJoint | undefined
    constructor(
        newConstraintType: ConstraintTypes,
        newEntityUidConstrainedTo: number,
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
    body: PhysXT.PxRigidActor | undefined
    bodyType: BodyTypes
    constructor(
        newBodyType: BodyTypes,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.RigidBody
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
    size: Math.Vector3 | undefined
    height: number | undefined
    radius: number | undefined
    sideNumber: number | undefined
    shapeType: ShapeTypes
    shape: PhysXT.PxShape | undefined
    materialType: MaterialTypes
    shapesEntityUid: number[]
    positionOffset: Math.Vector3 | undefined
    rotationOffset: Math.Quaternion | undefined
    constructor(
        newShapeType: ShapeTypes,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Shape
        this.shapeType = newShapeType
        this.materialType = MaterialTypes.Default
        this.shapesEntityUid = []
    }
}
export class Light implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    lightType: LightTypes
    intensity: number | undefined
    color: number | undefined
    distance: number | undefined
    decay: number | undefined
    penumbra: number | undefined
    angle: number | undefined
    constructor(
        newLightType: LightTypes,
        newEntityUid: number,
    ) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Light
        this.lightType = newLightType
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

    constructor(newLocation: Math.Vector3, newEntityUid: number) {
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

    constructor(newPosition: Math.Vector3, newEntityUid: number) {
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Position

        this.x = newPosition.x
        this.y = newPosition.y
        this.z = newPosition.z
    }
}
export class AngularVelocity implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    x: number
    y: number
    z: number

    constructor(newEntityUid: number) {
        this.x = 0
        this.y = 0
        this.z = 0

        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.AngularVelocity
    }
}
export class LinearVelocity implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    x: number
    y: number
    z: number

    constructor(newEntityUid: number) {
        this.x = 0
        this.y = 0
        this.z = 0

        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.LinearVelocity
    }
}
export class Torque implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    xToApply: number
    yToApply: number
    zToApply: number
    constructor(newEntityUid: number) {
        this.xToApply = 0
        this.yToApply = 0
        this.zToApply = 0

        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Torque
    }
}
export class Force implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    xToApply: number
    yToApply: number
    zToApply: number
    constructor(newEntityUid: number) {
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
    centerOfMass: Math.Vector3

    constructor(newMass: number, newEntityUid: number) {
        this.mass = newMass
        this.centerOfMass = new Math.Vector3(0, 0, 0)
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Mass
    }
}
export class Name implements ECS.Component {
    entityUid: number
    componentUid: number
    componentType: ComponentTypes
    name: string
    constructor(newName: string, newEntityUid: number) {
        this.name = newName
        this.componentUid = Utils.newUid()
        this.entityUid = newEntityUid
        this.componentType = ComponentTypes.Name
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
    constructor(newRotation: Math.Vector3, newEntityUid: number) {
        let quaternion = Math.eulerToQuaternion(
            new Math.Vector3(
                Math.deg2rad(newRotation.x),
                Math.deg2rad(newRotation.y),
                Math.deg2rad(newRotation.z)));
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
