import * as ECS from "./ecs"
import * as Cmds from "./commands"
import * as Comps from "./components"
import * as Ser from '../serialization'
import { PhysX, PhysXT } from "../physx/physx"


export class Resources {
    deltaTime: DeltaTimeResource
    isFirstTime: IsFirstTimeResource
    commandState: CommandStateResource
    componentChanges: ComponentChangesResource
    input: InputResource
    options: OptionsResource
    domState: DOMStateResource
    positionGrid: PositionGridResource
    physics: PhysicsResource
    availableRobotComponents: AvailableRobotComponentsResource
    newRobot: NewRobotResource
    entitiesCache: EntitiesCache
    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.domState = new DOMStateResource()
        this.deltaTime = new DeltaTimeResource(newCurrentExecutingCommand)
        this.isFirstTime = new IsFirstTimeResource(newCurrentExecutingCommand)
        this.commandState = new CommandStateResource(newCurrentExecutingCommand)
        this.componentChanges = new ComponentChangesResource()
        this.input = new InputResource()
        this.options = new OptionsResource()
        this.positionGrid = new PositionGridResource()
        this.physics = new PhysicsResource()
        this.availableRobotComponents = new AvailableRobotComponentsResource()
        this.newRobot = new NewRobotResource()
        this.entitiesCache = new EntitiesCache()
    }
}
export class NewRobotResource {
    components: Comps.RobotComponent[]
    constructor() {
        this.components = []
    }
}
export class AvailableRobotComponentsResource {
    robotComponentTypes: Comps.RobotComponentTypes[]
    quantity: number[]
    constructor() {
        this.robotComponentTypes = [2, 1, 0]
        this.quantity = [200, 4, 1]
    }
}
class EntityCache {
    entityUid: number
    position: Comps.Position | undefined
    rotation: Comps.Rotation | undefined
    mass: Comps.Mass | undefined
    rigidbody: Comps.RigidBody | undefined
    angularVelocity: Comps.AngularVelocity | undefined
    linearVelocity: Comps.LinearVelocity | undefined
    entityType: Comps.EntityType | undefined
    health: Comps.Health | undefined
    camera: Comps.Camera | undefined
    robotComponent: Comps.RobotComponent | undefined
    robotSuperComponent: Comps.RobotSuperComponent | undefined
    targetPosition: Comps.TargetPosition | undefined
    wheel: Comps.Wheel | undefined
    robot: Comps.Robot | undefined
    light: Comps.Light | undefined
    entityState: Comps.EntityState | undefined
    shape: Comps.Shape | undefined
    force: Comps.Torque | undefined
    torque: Comps.Torque | undefined
    constraint: Comps.Constraint | undefined
    code: Comps.Code | undefined
    hardCodedId: Comps.HardCodedId | undefined
    shapeColor: Comps.ShapeColor | undefined
    timer: Comps.Timer | undefined
    name: Comps.Name | undefined
    constructor(newEntityUid: number) {
        this.entityUid = newEntityUid
    }
}
export class EntitiesCache {
    private entities: Map<number, EntityCache>
    constructor() {
        this.entities = new Map()
    }
    get(entityUid: number): EntityCache | undefined {
        return this.entities.get(entityUid)
    }
    addEntity(entityUid: number) {
        let entityCache = new EntityCache(entityUid)
        this.entities.set(entityUid, entityCache)
    }
    removeEntity(entityUid: number) {
        this.entities.delete(entityUid)
    }
    removeComponent(component: ECS.Component) {
        let entityCache = this.entities.get(component.entityUid)!
        switch (component.componentType) {
            case Comps.ComponentTypes.Health:
                entityCache.health = undefined
                break;
            case Comps.ComponentTypes.Camera:
                entityCache.camera = undefined
                break;
            case Comps.ComponentTypes.Light:
                entityCache.light = undefined
                break;
            case Comps.ComponentTypes.EntityState:
                entityCache.entityState = undefined
                break;
            case Comps.ComponentTypes.Name:
                entityCache.name = undefined
                break;
            case Comps.ComponentTypes.EntityType:
                entityCache.entityType = undefined
                break;
            case Comps.ComponentTypes.TargetLocation:
                entityCache.targetPosition = undefined
                break;
            case Comps.ComponentTypes.Timer:
                entityCache.timer = undefined
                break;
            case Comps.ComponentTypes.Shape:
                entityCache.shape = undefined
                break;
            case Comps.ComponentTypes.Mass:
                entityCache.mass = undefined
                break;
            case Comps.ComponentTypes.ShapeColor:
                entityCache.shapeColor = undefined
                break;
            case Comps.ComponentTypes.HardCodedId:
                entityCache.hardCodedId = undefined
                break;
            case Comps.ComponentTypes.Code:
                entityCache.code = undefined
                break;
            case Comps.ComponentTypes.RigidBody:
                entityCache.rigidbody = undefined
                break;
            case Comps.ComponentTypes.Constraint:
                entityCache.constraint = undefined
                break;
            case Comps.ComponentTypes.Wheel:
                entityCache.wheel = undefined
                break;
            case Comps.ComponentTypes.RobotComponent:
                entityCache.robotComponent = undefined
                break;
            case Comps.ComponentTypes.Robot:
                entityCache.robot = undefined
                break;
            case Comps.ComponentTypes.RobotSuperComponent:
                entityCache.robotSuperComponent = undefined
                break;
            case Comps.ComponentTypes.Force:
                entityCache.force = undefined
                break;
            case Comps.ComponentTypes.Torque:
                entityCache.torque = undefined
                break;
            case Comps.ComponentTypes.LinearVelocity:
                entityCache.linearVelocity = undefined
                break;
            case Comps.ComponentTypes.AngularVelocity:
                entityCache.angularVelocity = undefined
                break;
            case Comps.ComponentTypes.Position:
                entityCache.position = undefined
                break;
            case Comps.ComponentTypes.Rotation:
                entityCache.rotation = undefined
                break;
        }
    }
    addComponent(component: ECS.Component) {
        let entityCache = this.entities.get(component.entityUid)!
        let c = component as any
        switch (component.componentType) {
            case Comps.ComponentTypes.Health:
                entityCache.health = c
                break;
            case Comps.ComponentTypes.Camera:
                entityCache.camera = c
                break;
            case Comps.ComponentTypes.Light:
                entityCache.light = c
                break;
            case Comps.ComponentTypes.EntityState:
                entityCache.entityState = c
                break;
            case Comps.ComponentTypes.Name:
                entityCache.name = c
                break;
            case Comps.ComponentTypes.EntityType:
                entityCache.entityType = c
                break;
            case Comps.ComponentTypes.TargetLocation:
                entityCache.targetPosition = c
                break;
            case Comps.ComponentTypes.Timer:
                entityCache.timer = c
                break;
            case Comps.ComponentTypes.Shape:
                entityCache.shape = c
                break;
            case Comps.ComponentTypes.Mass:
                entityCache.mass = c
                break;
            case Comps.ComponentTypes.ShapeColor:
                entityCache.shapeColor = c
                break;
            case Comps.ComponentTypes.HardCodedId:
                entityCache.hardCodedId = c
                break;
            case Comps.ComponentTypes.Code:
                entityCache.code = c
                break;
            case Comps.ComponentTypes.RigidBody:
                entityCache.rigidbody = c
                break;
            case Comps.ComponentTypes.Constraint:
                entityCache.constraint = c
                break;
            case Comps.ComponentTypes.Wheel:
                entityCache.wheel = c
                break;
            case Comps.ComponentTypes.RobotComponent:
                entityCache.robotComponent = c
                break;
            case Comps.ComponentTypes.Robot:
                entityCache.robot = c
                break;
            case Comps.ComponentTypes.RobotSuperComponent:
                entityCache.robotSuperComponent = c
                break;
            case Comps.ComponentTypes.Force:
                entityCache.force = c
                break;
            case Comps.ComponentTypes.Torque:
                entityCache.torque = c
                break;
            case Comps.ComponentTypes.LinearVelocity:
                entityCache.linearVelocity = c
                break;
            case Comps.ComponentTypes.AngularVelocity:
                entityCache.angularVelocity = c
                break;
            case Comps.ComponentTypes.Position:
                entityCache.position = c
                break;
            case Comps.ComponentTypes.Rotation:
                entityCache.rotation = c
                break;
        }
    }
}
export class Materials {
    wheel: PhysXT.PxMaterial
    default: PhysXT.PxMaterial
    constructor(physics: PhysXT.PxPhysics) {
        this.default = physics.createMaterial(0.5, 0.5, 0)
        this.wheel = physics.createMaterial(0.5, 0.8, 0.5)
    }
}
export class CustomConvexShapes {
    physics: PhysXT.PxPhysics
    cache: Map<string, PhysXT.PxGeometry>
    constructor(newPhysics: PhysXT.PxPhysics) {
        this.physics = newPhysics
        this.cache = new Map()
    }
    createPrism(sideNumber: number, height: number, radius: number): PhysXT.PxGeometry {
        let cachedGeometry = this.cache.get("p" + "s" + sideNumber + "h" + height + "r" + radius)
        if (cachedGeometry != undefined) {
            return cachedGeometry
        }
        let points = new PhysX.Vector_PxVec3(sideNumber * 2);
        let p;
        let pointNumber = 0
        // top
        for (let n = 1; n <= sideNumber; n++) {
            p = points.at(pointNumber);
            p.x = Math.sin(((2 * Math.PI) * n) / sideNumber) * radius;
            p.y = height / 2;
            p.z = Math.cos(((2 * Math.PI) * n) / sideNumber) * radius;
            pointNumber += 1
        }
        // bottom
        for (let n = 1; n <= sideNumber; n++) {
            p = points.at(pointNumber);
            p.x = Math.sin(((2 * Math.PI) * n) / sideNumber) * radius;
            p.y = -height / 2;
            p.z = Math.cos(((2 * Math.PI) * n) / sideNumber) * radius;
            pointNumber += 1
        }

        let desc = new PhysX.PxConvexMeshDesc();
        desc.flags = new PhysX.PxConvexFlags((PhysX.PxConvexFlagEnum as any).eCOMPUTE_CONVEX)
        desc.points.count = points.size();
        desc.points.stride = 12;     // sizeof(PxVec3);
        desc.points.data = points.data();

        let geometry = new PhysX.PxConvexMeshGeometry(
            (PhysX.PxTopLevelFunctions.prototype as any)
                .CreateConvexMesh(
                    this.physics.getPhysicsInsertionCallback(),
                    desc));
        this.cache.set("p" + "s" + sideNumber + "h" + height + "r" + radius, geometry)
        return geometry
    }
}
export class PhysicsResource {
    materials: Materials
    customConvexShapes: CustomConvexShapes
    scene: PhysXT.PxScene
    physics: PhysXT.PxPhysics
    rigidBodyPtrAndEntityUid: Map<number, number>
    shapePtrAndEntityUid: Map<number, number>
    constructor() {
        let version = (PhysX as any).PHYSICS_VERSION;
        let allocator = new PhysX.PxDefaultAllocator()
        let errorCallback = new PhysX.PxDefaultErrorCallback()
        let foundation = (PhysX as any).CreateFoundation(version, allocator, errorCallback)
        let tolerances = new PhysX.PxTolerancesScale()
        this.physics = (PhysX as any).CreatePhysics(version, foundation, tolerances) as PhysXT.PxPhysics
        let gravityVector = new PhysX.PxVec3(0, -9.81, 0)
        let sceneDesc = new PhysX.PxSceneDesc(tolerances);

        (sceneDesc as any).set_gravity(gravityVector);
        (sceneDesc as any).set_cpuDispatcher((PhysX as any).DefaultCpuDispatcherCreate(0));
        (sceneDesc as any).set_filterShader((PhysX as any).DefaultFilterShader());

        this.scene = this.physics.createScene(sceneDesc)
        this.scene.setFlag((PhysX.PxSceneFlagEnum as any).eENABLE_ACTIVE_ACTORS, true)


        PhysX.destroy(gravityVector)
        PhysX.destroy(tolerances)
        PhysX.destroy(sceneDesc)

        this.customConvexShapes = new CustomConvexShapes(this.physics)
        this.materials = new Materials(this.physics)
        this.rigidBodyPtrAndEntityUid = new Map()
        this.shapePtrAndEntityUid = new Map()
    }
}
class LastTimeCommandWasRun {
    command: Cmds.CommandTypes
    time: number
    constructor(newTime: number, newCommand: Cmds.CommandTypes) {
        this.time = newTime
        this.command = newCommand
    }
}

export class DeltaTimeResource {
    private currentExecutingCommand: ECS.CurrentExecutingCommand

    private lastTimeCommandsWereRun: LastTimeCommandWasRun[]

    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.lastTimeCommandsWereRun = []
    }

    get(): number | null {
        for (let d of this.lastTimeCommandsWereRun) {
            if (d.command == this.currentExecutingCommand.command!) {
                let oldTime = d.time
                d.time = performance.now()

                return performance.now() - oldTime
            }
        }

        this.lastTimeCommandsWereRun.push(
            new LastTimeCommandWasRun(
                performance.now(),
                this.currentExecutingCommand.command!)
        )
        return null
    }
}

export class CommandStateResource {
    private currentExecutingCommand: ECS.CurrentExecutingCommand

    private state: Map<string, any>

    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.state = new Map()
    }
    removeCommandStates(command: Cmds.CommandTypes) {
        //        for (let [k, _] of this.state) {
        //            if (k[1] == command) {
        //                this.state.delete(k)
        //            }
        //        }
    }
    set(key: string, value: any) {
        this.state.set(
            key,
            value
        )
    }

    get(key: string): any {
        let value = this.state.get(key)
        return value
    }
}

export class IsFirstTimeResource {
    private currentExecutingCommand: ECS.CurrentExecutingCommand

    private commandsCheckedFirstTime: number[]

    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.commandsCheckedFirstTime = []
    }
    get() {
        for (let cFT of this.commandsCheckedFirstTime) {
            if (cFT == this.currentExecutingCommand.command!) {
                return false
            }
        }
        this.commandsCheckedFirstTime.push(
            this.currentExecutingCommand.command!
        )
        return true
    }
}

export class OptionsResource {
    isShadowsEnabled: boolean | undefined
    isSetNight: boolean | undefined
    isEnablePhysics: boolean | undefined
    isEnableFreeCamera: boolean | undefined
    constructor() {
        this.isSetNight = undefined
        this.isShadowsEnabled = undefined
        this.isEnablePhysics = undefined
        this.isEnableFreeCamera = undefined
    }
}
export class DOMStateResource {
    windowWidth: number | undefined
    windowHeight: number | undefined
    constructor() {
        this.windowWidth = undefined
        this.windowHeight = undefined
    }
}
export class InputResource {
    keys: Map<Ser.Keys, boolean>
    constructor() {
        this.keys = new Map()
        this.keys.set(Ser.Keys.W, false)
        this.keys.set(Ser.Keys.A, false)
        this.keys.set(Ser.Keys.S, false)
        this.keys.set(Ser.Keys.D, false)
        this.keys.set(Ser.Keys.Left, false)
        this.keys.set(Ser.Keys.Up, false)
        this.keys.set(Ser.Keys.Down, false)
        this.keys.set(Ser.Keys.Right, false)
    }
    isKeyDown(key: Ser.Keys): boolean {
        let isDown = this.keys.get(key)
        if (isDown == undefined) {
            console.log("key doesn't exist")
            return false
        }
        return isDown
    }
}

export class ComponentChangesResource {
    changedComponents: ECS.Component[][]
    removedComponents: ECS.Component[][]
    addedComponents: ECS.Component[][]

    changedComponentsBuffer: ECS.Component[][]
    removedComponentsBuffer: ECS.Component[][]
    addedComponentsBuffer: ECS.Component[][]

    private baseStructure: ECS.Component[][]

    constructor() {
        this.baseStructure = []
        for (let i = 0; i < Comps.NUMBER_OF_COMPONENTS; i++) {
            this.baseStructure.push([])
        }

        this.changedComponentsBuffer = structuredClone(this.baseStructure)
        this.removedComponentsBuffer = structuredClone(this.baseStructure)
        this.addedComponentsBuffer = structuredClone(this.baseStructure)

        this.changedComponents = []
        this.removedComponents = []
        this.addedComponents = []
    }
    cycleChanges() {
        this.changedComponents = this.changedComponentsBuffer
        this.removedComponents = this.removedComponentsBuffer
        this.addedComponents = this.addedComponentsBuffer

        this.changedComponentsBuffer = structuredClone(this.baseStructure)
        this.removedComponentsBuffer = structuredClone(this.baseStructure)
        this.addedComponentsBuffer = structuredClone(this.baseStructure)
    }
}
export class PositionGridResource {
    constructor() {
    }
}
