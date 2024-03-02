import * as ECS from "./ecs"
import * as Cmds from "./commands"
import * as Comps from "./components"
import * as Utils from "../utils"
import * as CANNON from 'cannon-es'
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
    targetPosition: Comps.TargetPosition | undefined
    wheel: Comps.Wheel | undefined
    light: Comps.Light | undefined
    entityState: Comps.EntityState | undefined
    shape: Comps.Shape | undefined
    force: Comps.Torque | undefined
    torque: Comps.Torque | undefined
    constraint: Comps.Constraint | undefined
    constructor(newEntityUid: number) {
        this.entityUid = newEntityUid
    }
}
export class EntitiesCache {
    entities: Map<number, EntityCache>
    constructor() {
        this.entities = new Map()
    }
    newEntity(entityUid: number): EntityCache {
        let entityCache = new EntityCache(entityUid)
        this.entities.set(entityUid, entityCache)
        return entityCache
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
export class PhysicsResource {
    materials: Materials
    scene: PhysXT.PxScene
    physics: PhysXT.PxPhysics
    rigidBodyPtrAndEntityUid: Map<number, number>
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

        this.materials = new Materials(this.physics)
        this.rigidBodyPtrAndEntityUid = new Map()
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

    private state: Map<[string, Cmds.CommandTypes], [Cmds.CommandTypes, any]>

    constructor(newCurrentExecutingCommand: ECS.CurrentExecutingCommand) {
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.state = new Map()
    }
    removeCommandStates(command: Cmds.CommandTypes) {
        for (let [k, _] of this.state) {
            if (k[1] == command) {
                this.state.delete(k)
            }
        }
    }
    set(key: string, value: any) {
        this.state.set(
            [key, this.currentExecutingCommand.command!],
            value
        )
    }

    get(key: string): any {
        console.log(this.state)
        let value = this.state.get([key, this.currentExecutingCommand.command!])
        if (value == undefined) {
            return undefined
        }
        else {
            return value[1]
        }
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
