import * as ECS from "./ecs"
import * as Cmds from "./commands"
import * as Comps from "./components"
import * as Ser from '../serialization'
import * as Mat from "../math"
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
    robots: RobotsResource
    cameraViewEntities: CameraViewEntitiesResource

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
        this.robots = new RobotsResource()
        this.cameraViewEntities = new CameraViewEntitiesResource()
    }
}
class NewRobotResource {
    components: Comps.RobotComponent[]
    constructor() {
        this.components = []
    }
}
class AvailableRobotComponentsResource {
    robotComponentTypes: Comps.RobotComponentTypes[]
    quantity: number[]
    constructor() {
        this.robotComponentTypes = [2, 1, 0]
        this.quantity = [200, 4, 1]
    }
}
class SuperComponent {
    robotSuperComponentEntityUid: number
    subComponentsEntityUid: number[]
    constructor(newEntityUid: number) {
        this.robotSuperComponentEntityUid = newEntityUid
        this.subComponentsEntityUid = []
    }
}
class RobotComponents {
    entityUid: number
    componentsEntityUid: number[]
    superComponents: SuperComponent[]
    constructor(newEntityUid: number) {
        this.entityUid = newEntityUid
        this.componentsEntityUid = []
        this.superComponents = []
    }
    addSuperComponent(entityUid: number): SuperComponent {
        let superComponent = new SuperComponent(entityUid)
        this.superComponents.push(superComponent)
        return superComponent
    }
    addComponent(entityUid: number) {
        this.componentsEntityUid.push(entityUid)
    }
}
class RobotsResource {
    private robots: Map<number, RobotComponents>
    constructor() {
        this.robots = new Map()
    }
    get(entityUid: number): RobotComponents | undefined {
        return this.robots.get(entityUid)
    }
    addRobot(entityUid: number): RobotComponents {
        let robotCache = new RobotComponents(entityUid)
        this.robots.set(entityUid, robotCache)

        return robotCache
    }
}
class Materials {
    wheel: PhysXT.PxMaterial
    default: PhysXT.PxMaterial
    constructor(physics: PhysXT.PxPhysics) {
        this.default = physics.createMaterial(0.5, 0.5, 0)
        this.wheel = physics.createMaterial(0.5, 5, 0)
    }
}
class CustomConvexShapes {
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
class ShapeContact {
    shapeEntityUid: number
    impulse: Mat.Vector3
    constructor(newShapeEntityUid: number, newImpulse: Mat.Vector3) {
        this.shapeEntityUid = newShapeEntityUid
        this.impulse = newImpulse
    }
}
class Contact {
    rigidBodyAEntityUid: number
    rigidBodyBEntityUid: number
    shapesContactA: ShapeContact[]
    shapesContactB: ShapeContact[]
    constructor(
        newRigidBodyAEntityUid: number,
        newRigidBodyBEntityUid: number,
        newShapesContactA: ShapeContact[],
        newShapesContactB: ShapeContact[]
    ) {
        this.rigidBodyAEntityUid = newRigidBodyAEntityUid
        this.rigidBodyBEntityUid = newRigidBodyBEntityUid
        this.shapesContactA = newShapesContactA
        this.shapesContactB = newShapesContactB
    }
}
class PhysicsResource {
    materials: Materials
    customConvexShapes: CustomConvexShapes
    scene: PhysXT.PxScene
    physics: PhysXT.PxPhysics
    rigidBodyPtrToEntityUid: Map<number, number>
    shapePtrToEntityUid: Map<number, number>
    instantContacts: Contact[]

    constructor() {
        let version = (PhysX as any).PHYSICS_VERSION;
        let allocator = new PhysX.PxDefaultAllocator()
        let errorCallback = new PhysX.PxDefaultErrorCallback()
        let foundation = (PhysX as any).CreateFoundation(version, allocator, errorCallback)
        let tolerances = new PhysX.PxTolerancesScale()
        this.physics = (PhysX as any).CreatePhysics(version, foundation, tolerances) as PhysXT.PxPhysics
        let gravityVector = new PhysX.PxVec3(0, -9.81, 0)
        let simulationEventCallback = new PhysX.PxSimulationEventCallbackImpl();

        (simulationEventCallback as any).onContact = this.contactEvent.bind(this)
        let sceneDesc = new PhysX.PxSceneDesc(tolerances);
        (sceneDesc as any).set_gravity(gravityVector);
        (sceneDesc as any).set_cpuDispatcher((PhysX as any).DefaultCpuDispatcherCreate(0));
        (sceneDesc as any).set_filterShader((PhysX as any).DefaultFilterShader());
        this.scene = this.physics.createScene(sceneDesc)
        this.scene.setFlag((PhysX.PxSceneFlagEnum as any).eENABLE_ACTIVE_ACTORS, true)
        this.scene.setSimulationEventCallback(simulationEventCallback);

        PhysX.destroy(gravityVector)
        PhysX.destroy(tolerances)
        PhysX.destroy(sceneDesc)

        this.customConvexShapes = new CustomConvexShapes(this.physics)
        this.materials = new Materials(this.physics)
        this.rigidBodyPtrToEntityUid = new Map()
        this.shapePtrToEntityUid = new Map()
        this.instantContacts = []
    }
    private contactEvent(
        pairHeader: PhysXT.PxContactPairHeader,
        pairs: PhysXT.PxContactPair,
        nbPairs: number
    ) {
        // get rigid bodies
        let shapesContactA = []
        let shapesContactB = []

        let contacts = new PhysX.Vector_PxContactPairPoint(64);
        for (let i = 0; i < nbPairs; i++) {
            let pair = (PhysX.NativeArrayHelpers.prototype as any).getContactPairAt(pairs, i) as PhysXT.PxContactPair;
            //if (pair.events.isSet((PhysX.PxPairFlagEnum as any).eNOTIFY_TOUCH_LOST)) {
            //    continue
            //}

            // get impulses
            let numberOfContacts = pair.extractContacts(contacts.data(), contacts.size())
            let impulseSum = new Mat.Vector3(0, 0, 0)
            for (let j = 0; j < numberOfContacts; j++) {
                let point = contacts.at(j)
                impulseSum.x += point.impulse.x
                impulseSum.y += point.impulse.y
                impulseSum.z += point.impulse.z
            }

            // get shapes
            let shapeA = this.shapePtrToEntityUid.get((pair as any).get_shapes(0).ptr)!;
            let shapeB = this.shapePtrToEntityUid.get((pair as any).get_shapes(1).ptr)!;
            shapesContactA.push(new ShapeContact(shapeA, impulseSum))
            shapesContactB.push(new ShapeContact(shapeB, impulseSum))
        }

        let head = (PhysX.NativeArrayHelpers.prototype as any).getContactPairHeaderAt(pairHeader);

        let rigidBodyA = this.rigidBodyPtrToEntityUid.get(head.get_actors(0).ptr)!;
        let rigidBodyB = this.rigidBodyPtrToEntityUid.get(head.get_actors(1).ptr)!;

        this.instantContacts.push(new Contact(rigidBodyA, rigidBodyB, shapesContactA, shapesContactB))
        PhysX.destroy(contacts)
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
class CameraViewEntitiesResource {
    entities: number[]
    private cameraPositionComponent: Comps.Position | undefined
    private cameraRotationComponent: Comps.Rotation | undefined
    private cameraComponent: Comps.Camera | undefined
    constructor() {
        this.entities = []
    }
    updateEntity(positionComponent: Comps.Position) {
        if (
            this.cameraComponent == undefined ||
            this.cameraPositionComponent == undefined ||
            this.cameraRotationComponent == undefined
        ) return;

        if (this.isEntityInsideCameraRadius(positionComponent)) {
            if (!this.isEntityAlreadyInView(positionComponent.entityUid)) {
                this.entities.push(positionComponent.entityUid)
            }
        }
        else {
            if (this.isEntityAlreadyInView(positionComponent.entityUid)) {
                this.removeEntityFromView(positionComponent.entityUid)
            }
        }
    }
    updateCameraPosition(newCameraPositionComponent: Comps.Position) {
        this.cameraPositionComponent = newCameraPositionComponent
    }
    updateCameraRotation(newCameraRotationComponent: Comps.Rotation) {
        this.cameraRotationComponent = newCameraRotationComponent
    }
    updateCameraComponent(newCameraComponent: Comps.Camera) {
        this.cameraComponent = newCameraComponent
    }
    private isEntityInsideCameraRadius(positionComponent: Comps.Position): boolean {
        let radiusSize = 10
        let circlePosition = new Mat.Vector2(0, 0)
        circlePosition.x = this.cameraPositionComponent!.x;
        circlePosition.y = this.cameraPositionComponent!.z;
        circlePosition.x += 0
        circlePosition.y -= 30

        if (
            (positionComponent.x - circlePosition.x) *
            (positionComponent.x - circlePosition.x) +
            (positionComponent.z - circlePosition.y) *
            (positionComponent.z - circlePosition.y) <=
            radiusSize * radiusSize
        ) {
            return true
        }
        return false
    }
    private removeEntityFromView(entityUid: number) {
        for (let [i, eUid] of this.entities.entries()) {
            if (eUid == entityUid) {
                this.entities.splice(i, 1)
                return
            }
        }
    }
    private isEntityAlreadyInView(entityUid: number): boolean {
        for (let eUid of this.entities) {
            if (eUid == entityUid) {
                return true
            }
        }
        return false
    }
}
class DeltaTimeResource {
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
class CommandStateResource {
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
class IsFirstTimeResource {
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
class OptionsResource {
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
class DOMStateResource {
    windowWidth: number | undefined
    windowHeight: number | undefined
    constructor() {
        this.windowWidth = undefined
        this.windowHeight = undefined
    }
}
class InputResource {
    keys: Map<Ser.Buttons, boolean>
    mouseMovement: Mat.Vector2
    mouseAddedMovement: Mat.Vector2
    constructor() {
        this.keys = new Map()
        this.mouseMovement = new Mat.Vector2(0, 0)
        this.mouseAddedMovement = new Mat.Vector2(0, 0)
    }
    isButtonPressed(key: Ser.Buttons): boolean {
        let isDown = this.keys.get(key)
        if (isDown == undefined) {
            return false
        }
        return isDown
    }
}
class ComponentChangesResource {
    changedComponents: ECS.Component[][]
    addedComponents: ECS.Component[][]

    changedComponentsBuffer: ECS.Component[][]
    addedComponentsBuffer: ECS.Component[][]

    // proxy free
    proxyFreeChangedComponents: ECS.Component[][]
    proxyFreeRemovedComponents: ECS.Component[][]
    proxyFreeAddedComponents: ECS.Component[][]

    proxyFreeChangedComponentsBuffer: ECS.Component[][]
    proxyFreeRemovedComponentsBuffer: ECS.Component[][]
    proxyFreeAddedComponentsBuffer: ECS.Component[][]

    private baseStructure: ECS.Component[][]

    constructor() {
        this.baseStructure = []
        for (let i = 0; i < Comps.NUMBER_OF_COMPONENTS; i++) {
            this.baseStructure.push([])
        }
        this.changedComponents = []
        this.addedComponents = []

        this.proxyFreeChangedComponents = []
        this.proxyFreeRemovedComponents = []
        this.proxyFreeAddedComponents = []

        // proxy free
        this.changedComponentsBuffer = structuredClone(this.baseStructure)
        this.addedComponentsBuffer = structuredClone(this.baseStructure)

        this.proxyFreeChangedComponentsBuffer = structuredClone(this.baseStructure)
        this.proxyFreeRemovedComponentsBuffer = structuredClone(this.baseStructure)
        this.proxyFreeAddedComponentsBuffer = structuredClone(this.baseStructure)

    }
    cycleChanges() {
        this.changedComponents = this.changedComponentsBuffer
        this.addedComponents = this.addedComponentsBuffer

        this.changedComponentsBuffer = structuredClone(this.baseStructure)
        this.addedComponentsBuffer = structuredClone(this.baseStructure)

        // proxy free
        this.proxyFreeChangedComponents = this.proxyFreeChangedComponentsBuffer
        this.proxyFreeRemovedComponents = this.proxyFreeRemovedComponentsBuffer
        this.proxyFreeAddedComponents = this.proxyFreeAddedComponentsBuffer

        this.proxyFreeChangedComponentsBuffer = structuredClone(this.baseStructure)
        this.proxyFreeRemovedComponentsBuffer = structuredClone(this.baseStructure)
        this.proxyFreeAddedComponentsBuffer = structuredClone(this.baseStructure)

    }
}
class PositionGridResource {
    constructor() {
    }
}
