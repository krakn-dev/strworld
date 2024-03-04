import * as ECS from "./ecs"
import * as Res from "./resources"
import * as Utils from "../utils"
import * as Comps from "./components"
import * as Funs from "./functions"
import * as Ser from "../serialization"
import { PhysX, PhysXT } from "../physx/physx"

// order in which they get executed
export enum CommandTypes {
    TheFirst = 0,
    SendGraphicComponentsToRender,
    CreateStickman,
    MovePlayer,
    MoveVehicle,
    TorqueWheels,
    CreateRobot,
    //    SetEntityElementsPositionAndDisplayElement = 3,
    //    SendComputedElementsToRender = 4,
    //    CreateShadows = 5,
    //    WatchDevBox = 6,
    //    RemoveShadows = 7,
    //    PlayAnimations = 8,
    //    UpdateShadowNumber = 9,
    //    UpdateShadowProperties = 10,
    //    TickTimer = 11,
    //    UpdateAnimationTimerNumber = 12,
    //    CreateAnimationTimers = 13,
    //    MoveCameraWithPlayer = 14,
    //    CreateDog = 15,
    //    MoveDog = 16,
    CreateScene,
    RunCode,
    SyncPhysics,
    CameraFollowGeometry,
}

export function getInstanceFromEnum(commandEnum: CommandTypes): ECS.Command {
    switch (commandEnum) {
        case CommandTypes.TheFirst:
            return new TheFirst()

        //        case Commands.MoveCameraWithPlayer:
        //            return new MoveCameraWithPlayer()
        //
        case CommandTypes.CreateRobot:
            return new CreateRobot()
        case CommandTypes.RunCode:
            return new RunCode()
        case CommandTypes.MoveVehicle:
            return new MoveVehicle()
        case CommandTypes.SyncPhysics:
            return new SyncPhysics()
        case CommandTypes.CameraFollowGeometry:
            return new CameraFollowGeometry()
        case CommandTypes.TorqueWheels:
            return new TorqueWheels()
        //
        //        case Commands.MoveDog:
        //            return new MoveDog()
        //
        //        case Commands.CreateDog:
        //            return new CreateDog()
        //
        case CommandTypes.SendGraphicComponentsToRender:
            return new SendGraphicComponentsToRender()
        case CommandTypes.CreateStickman:
            return new CreateStickman()
        case CommandTypes.MovePlayer:
            return new MovePlayer()
        case CommandTypes.CreateScene:
            return new CreateScene()
    }
}

// the first
export class TheFirst implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.TheFirst
    }

    run(system: ECS.System, _: Res.Resources) {
        //        system.addCommand(CommandTypes.CreateStickman)
        system.addCommand(CommandTypes.CreateScene)
        system.addCommand(CommandTypes.SendGraphicComponentsToRender)
        //system.addCommand(Commands.CreateDog)
        system.addCommand(CommandTypes.SyncPhysics)
        // system.addCommand(CommandTypes.TorqueWheels)
        system.addCommand(CommandTypes.CreateRobot)
        system.addCommand(CommandTypes.RunCode)


        system.removeCommand(this.commandType)
    }
}
export class RunCode implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.RunCode
    }

    run(system: ECS.System, resources: Res.Resources) {

        let foundRigidbody = system.find([
            ECS.Get.All,
            [Comps.ComponentTypes.RigidBody],
            ECS.By.Any,
            null
        ]);
        if (foundRigidbody[0].length == 0) return

        let rigidBodyA = foundRigidbody[0][0] as Comps.RigidBody

        let direction = Funs.getMovementDirection(resources)
        if (direction.x == 0 && direction.y == 0) return
        let positionComponent = resources.entitiesCache.entities.get(rigidBodyA.entityUid)!.position!
        console.log(positionComponent.y)
        let rigidBodyB = foundRigidbody[0][2] as Comps.RigidBody


        let force = 20
        let angularForceComponentA = resources.entitiesCache.entities.get(rigidBodyA.entityUid)!.torque!
        ////        let angularForceComponentB = resources.entitiesCache.entities.get(rigidBodyB.entityUid)!.torque!

        angularForceComponentA.xToApply = direction.x * force
        angularForceComponentA.zToApply = -direction.y * force

        ////      angularForceComponentB.xToApply = direction.x * force
        ////      angularForceComponentB.zToApply = -direction.y * force
        ////for (let cpC of resources.componentChanges.changedComponents[Comps.ComponentTypes.Position]) {
        ////    console.log(cpC)
        //}
    }
}
export class CameraFollowGeometry implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CameraFollowGeometry
    }

    run(system: ECS.System, resources: Res.Resources) {

        let foundHardCodedIdComponent = system.find([ECS.Get.All, [Comps.ComponentTypes.HardCodedId], ECS.By.Any, null])
        if (foundHardCodedIdComponent[0].length == 0) {
            console.log("no hardcodedid found")
            return
        }
        let geometryUid = (foundHardCodedIdComponent[0][0] as Comps.HardCodedId).entityUid

        for (let cPC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Position]) {
            if (cPC.entityUid != geometryUid) continue

            let foundCameraComponent = system.find([ECS.Get.All, [Comps.ComponentTypes.Position], ECS.By.EntityType, Comps.EntityTypes.Camera])
            if (foundCameraComponent[0].length == 0) return
            let cameraPositionComponent = foundCameraComponent[0][0] as Comps.Position
            let geometryPositionComponent = cPC as Comps.Position

            let offset = new Utils.Vector3(0, 13, 13)
            cameraPositionComponent.x = geometryPositionComponent.x + offset.x
            cameraPositionComponent.y = geometryPositionComponent.y + offset.y
            cameraPositionComponent.z = geometryPositionComponent.z + offset.z
        }
    }
}

export class CreateScene implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CreateScene
    }

    run(system: ECS.System, resources: Res.Resources) {
        {
            let camera = Utils.newUid()
            let cameraComponent = new Comps.Camera(
                80,
                0.1,
                500,
                resources.domState.windowWidth! / resources.domState.windowHeight!,
                camera)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, 25, 25), camera)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, -0.7), camera)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Camera, camera)
            system.addComponent(cameraComponent)
            system.addComponent(rotationComponent)
            system.addComponent(positionComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let pointLight = Utils.newUid()
            let lightComponent = new Comps.Light(Comps.LightTypes.PointLight, pointLight);
            lightComponent.intensity = 1
            lightComponent.color = 0xffffff
            lightComponent.distance = 200
            lightComponent.decay = 0
            let positionComponent = new Comps.Position(new Utils.Vector3(3, 10, 3), pointLight)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Light, pointLight)
            system.addComponent(lightComponent)
            system.addComponent(positionComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let ambientLight = Utils.newUid()
            let lightComponent = new Comps.Light(Comps.LightTypes.AmbientLight, ambientLight)
            lightComponent.intensity = 0.5
            lightComponent.color = 0xffffff
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Light, ambientLight)
            system.addComponent(lightComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let floor = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Static, floor)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, floor)
            shapeComponent.size = new Utils.Vector3(100, 100, 100)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, -51, 0), floor)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), floor)
            let shapeColorComponent = new Comps.ShapeColor(0xffffff, floor)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, floor)

            system.addComponent(rigidBodyComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)
        }
        system.removeCommand(this.commandType)
    }
}

export class CreateRobot implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CreateRobot
    }

    run(system: ECS.System, resources: Res.Resources) {
        for (let i = 0; i < 100; i++) {
            let shape = Utils.newUid()

            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, shape)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, shape)
            shapeComponent.size = new Utils.Vector3(1, 1, 1)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, i, 0), shape)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), shape)
            let linearVelocityComponent = new Comps.LinearVelocity(shape)
            let angularVelocityComponent = new Comps.AngularVelocity(shape)
            let forceComponent = new Comps.Force(shape)
            let torqueComponent = new Comps.Torque(shape)
            let massComponent = new Comps.Mass(1, shape)
            let shapeColorComponent = new Comps.ShapeColor(0xff0000, shape)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, shape)

            //system.addComponent(forceComponent)
            //system.addComponent(torqueComponent)
            //system.addComponent(angularVelocityComponent)
            //system.addComponent(linearVelocityComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent);
        }
        system.removeCommand(this.commandType)
    }
}
export class TorqueWheels implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.TorqueWheels
    }

    run(system: ECS.System, resources: Res.Resources) {
        //
        //        for (let cWC of resources.componentChanges.changedComponents[Comps.ComponentTypes.Wheel]) {
        //            let wheelComponent = cWC as Comps.Wheel
        //            let foundComponents = system.find(
        //                [
        //                    ECS.Get.All,
        //                    [Comps.ComponentTypes.Constraint],
        //                    ECS.By.EntityUid,
        //                    wheelComponent.entityUid
        //                ])
        //            if (foundComponents[0].length == 0) {
        //                console.log("no constraint component found")
        //                return
        //            }
        //            let constraintComponent = foundComponents[0][0] as Comps.Constraint
        //            if (
        //                constraintComponent.constraint == undefined ||
        //                constraintComponent.constraintType != Comps.ConstraintTypes.Hinge
        //            ) {
        //                continue
        //            }
        //            let hinge = constraintComponent.constraint as CANNON.HingeConstraint
        //            if (wheelComponent.isOn) {
        //                hinge.enableMotor()
        //                hinge.setMotorSpeed(wheelComponent.velocity)
        //            } else {
        //                //hinge.setMotorSpeed(0)
        //                hinge.disableMotor()
        //            }
        //        }
    }
}
export class MoveVehicle implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.MoveVehicle
    }

    run(system: ECS.System, resources: Res.Resources) {
        //        let maxVelocity = 20
        //        let turningVelocity = 10
        //
        //        let foundHardCodedIdComponent = system.find(
        //            [
        //                ECS.Get.All,
        //                [Comps.ComponentTypes.HardCodedId],
        //                ECS.By.Any,
        //                null
        //            ])
        //        if (foundHardCodedIdComponent[0].length == 0) {
        //            console.log("no hardcodedid found")
        //            return
        //        }
        //        let vehicleEntityUid = (foundHardCodedIdComponent[0][0] as Comps.HardCodedId).entityUid
        //        // get geometryUid
        //        let foundComponents = system.find(
        //            [
        //                ECS.Get.All,
        //                [Comps.ComponentTypes.Wheel],
        //                ECS.By.Any,
        //                null
        //            ])
        //        if (foundComponents[0].length == 0) {
        //            console.log("no wheel components found")
        //            return
        //        }
        //        for (let wC of foundComponents[0]) {
        //            let wheelComponent = wC as Comps.Wheel
        //            if (wheelComponent.entityUidAttachedTo != vehicleEntityUid) continue
        //            if (resources.input.movementDirection.y == 1) {
        //                wheelComponent.isOn = true
        //                wheelComponent.velocity = maxVelocity
        //            }
        //            if (resources.input.movementDirection.y == -1) {
        //                wheelComponent.isOn = true
        //                wheelComponent.velocity = -maxVelocity
        //            }
        //            if (
        //                resources.input.movementDirection.x == 0 &&
        //                resources.input.movementDirection.y == 0
        //            ) {
        //
        //                wheelComponent.isOn = false
        //            }
        //        }
        //    }
    }
}
export class CreateStickman implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CreateStickman
    }

    run(system: ECS.System, _: Res.Resources) {
        for (let x = 0; x < 1; x++) {
            for (let y = 0; y < 1; y++) {
                let stickman = Utils.newUid()
                let positionComponent = new Comps.Position(new Utils.Vector3(0, 0, 0), stickman)
                let entityStateComponent = new Comps.EntityState([Comps.EntityStates.Idle], stickman)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Stickman, stickman)
                let healthComponent = new Comps.Health(10, stickman)
                let massComponent = new Comps.Mass(4, stickman)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, stickman)
                shapeComponent.size = new Utils.Vector3(40, 90, 30)

                system.addComponent(massComponent)
                system.addComponent(shapeComponent)
                system.addComponent(healthComponent)
                system.addComponent(positionComponent)
                system.addComponent(entityStateComponent)
                system.addComponent(entityTypeComponent)
            }
        }
        system.addCommand(CommandTypes.MovePlayer)
        system.removeCommand(CommandTypes.CreateStickman)
    }
}
//
//// movement
export class MovePlayer implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.MovePlayer
    }

    run(system: ECS.System, resources: Res.Resources) {
        //    let acceleration = 0.003
        //    let forceLimit = 0.02
        //    // get playerUid
        //    let foundEntityTypeComponents = system.find([ECS.Get.All, [Comps.ComponentTypes.EntityType], ECS.By.Any, null])
        //    if (foundEntityTypeComponents[0].length == 0) {
        //        console.log("no entity types found")
        //        return
        //    }
        //    let playerUid: number | null = null
        //    for (let fC of foundEntityTypeComponents[0]) {
        //        let entityTypeComponent = fC as Comps.EntityType
        //        if (entityTypeComponent.entityType == Comps.EntityTypes.Stickman) {
        //            playerUid = entityTypeComponent.entityUid
        //        }
        //    }
        //    if (playerUid == null)
        //        return

        //    // if was found, move it
        //    if (resources.input.movementDirection.x == 0 &&
        //        resources.input.movementDirection.y == 0
        //    ) {
        //        let foundEntityState = system.find(
        //            [
        //                ECS.Get.All,
        //                [
        //                    Comps.ComponentTypes.EntityState,
        //                ],
        //                ECS.By.EntityUid,
        //                foundEntityTypeComponents[0][0].entityUid
        //            ]
        //        )
        //        if (foundEntityState[0].length == 0) {
        //            console.log("entityState not found")
        //            return
        //        }

        //        for (let fC of foundEntityState[0]) {
        //            let entityStateComponent = fC as Comps.EntityState

        //            if (entityStateComponent.entityUid == playerUid) {
        //                // cannot change state to idle if wasnt runnning
        //                let indexOfRun = entityStateComponent.states.indexOf(Comps.EntityStates.Run)
        //                if (indexOfRun != -1) {
        //                    entityStateComponent.states.splice(indexOfRun, 1)

        //                    if (entityStateComponent.states.includes(Comps.EntityStates.Idle)) return
        //                    entityStateComponent.states.push(Comps.EntityStates.Idle)
        //                }
        //                return
        //            }
        //        }
        //    }

        //    let foundForceComponent = system.find([ECS.Get.One, [Comps.ComponentTypes.Force], ECS.By.EntityUid, playerUid])
        //    if (foundForceComponent[0].length == 0) {
        //        console.log("no player force found found")
        //        return
        //    }
        //    let forceComponent = foundForceComponent[0][0] as Comps.Force
        //    let newForce = new Utils.Vector3(0, 0, 0)
        //    newForce.x = forceComponent.x + resources.input.movementDirection.x * acceleration
        //    newForce.z = forceComponent.z + (-resources.input.movementDirection.y) * acceleration

        //    if (Math.abs(newForce.x) > forceLimit) {
        //        newForce.x = forceLimit * (newForce.x < 0 ? -1 : 1)
        //    }
        //    if (Math.abs(newForce.z) > forceLimit) {
        //        newForce.z = forceLimit * (newForce.z < 0 ? -1 : 1)
        //    }

        //    let foundEntityState = system.find(
        //        [ECS.Get.One, [Comps.ComponentTypes.EntityState], ECS.By.EntityUid, playerUid])

        //    if (foundEntityState[0].length == 0) {
        //        console.log("player entityState not found")
        //        return
        //    }
        //    let entityStateComponent = foundEntityState[0][0] as Comps.EntityState

        //    if (!entityStateComponent.states.includes(Comps.EntityStates.Run)) {
        //        entityStateComponent.states.push(Comps.EntityStates.Run)
        //    }
        //    let indexOfIdle = entityStateComponent.states.indexOf(Comps.EntityStates.Idle)
        //    if (indexOfIdle != -1) {
        //        entityStateComponent.states.splice(indexOfIdle, 1)
        //    }

        //    if (resources.input.movementDirection.x != 0) {
        //        forceComponent.x = newForce.x
        //    }
        //    if (resources.input.movementDirection.y != 0) {
        //        forceComponent.z = newForce.z
        //    }
    }
}
//// render
export class SendGraphicComponentsToRender implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.SendGraphicComponentsToRender
    }

    run(system: ECS.System, resources: Res.Resources) {
        let graphicChanges = new Ser.GraphicChanges()

        // changed
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.changedComponents[Comps.ComponentTypes.Camera])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.changedComponents[Comps.ComponentTypes.Light])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.changedComponents[Comps.ComponentTypes.Position])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.changedComponents[Comps.ComponentTypes.EntityState])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.changedComponents[Comps.ComponentTypes.Rotation])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.changedComponents[Comps.ComponentTypes.Shape])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.changedComponents[Comps.ComponentTypes.ShapeColor])

        // order is important
        // added
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.EntityType])
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Camera])
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Light])
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Shape])
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.EntityState])
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Rotation])
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Position])
        graphicChanges.addedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.ShapeColor])

        //console.log(
        //    graphicChanges.addedComponents.length, "length a",
        //    graphicChanges.changedComponents.length, "length c")
        //        console.log(
        //            resources.componentChanges.addedComponents[Comps.ComponentTypes.Camera].length, "length a",
        //            resources.componentChanges.changedComponents[Comps.ComponentTypes.Camera].length, "length c")

        // check for removed entities
        for (let rC of resources.componentChanges.removedComponents[Comps.ComponentTypes.EntityType]) {
            graphicChanges.removedEntitiesUid.push(rC.entityUid)
        }

        // check for added entities
        for (let aC of resources.componentChanges.addedComponents[Comps.ComponentTypes.EntityType]) {
            graphicChanges.addedEntitiesUid.push(aC.entityUid)
        }

        if (
            graphicChanges.changedComponents.length == 0 &&
            graphicChanges.addedComponents.length == 0 &&
            graphicChanges.removedEntitiesUid.length == 0
        ) {
            return
        }
        postMessage(new Ser.Message(Ser.Messages.GraphicChanges, graphicChanges))
    }
}
export class SyncPhysics implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.SyncPhysics
    }

    run(system: ECS.System, resources: Res.Resources) {
        let dt = resources.deltaTime.get()
        if (dt != null) {
            resources.physics.scene.simulate(dt / 1000)
            resources.physics.scene.fetchResults(true)
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      added
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////
        // added rigidbody
        /////////////////
        for (let aRB of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            let rigidBodyComponent = aRB as Comps.RigidBody

            let transform = new PhysX.PxTransform((PhysX.PxIDENTITYEnum as any).PxIdentity)

            let rigidBody: PhysXT.PxRigidActor
            switch (rigidBodyComponent.bodyType) {
                case Comps.BodyTypes.Dynamic: {
                    rigidBody = resources.physics.physics.createRigidDynamic(transform);
                } break;
                case Comps.BodyTypes.Static: {
                    rigidBody = resources.physics.physics.createRigidStatic(transform)
                } break;
            }

            rigidBodyComponent.body = rigidBody
            resources.physics.scene.addActor(rigidBody)

            resources.physics.rigidBodyPtrAndEntityUid.set(
                (rigidBody as any).ptr as number,
                rigidBodyComponent.entityUid)

            let entityCache = resources.entitiesCache.newEntity(rigidBodyComponent.entityUid)
            entityCache.rigidbody = system.createProxy(rigidBodyComponent);

            PhysX.destroy(transform)
        }
        /////////////////
        // added shape
        /////////////////
        for (let aSC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            let shapeComponent = aSC as Comps.Shape

            let geometry: PhysXT.PxGeometry
            switch (shapeComponent.shapeType) {
                case Comps.ShapeTypes.Box: {
                    geometry = new PhysX.PxBoxGeometry(
                        shapeComponent.size!.x / 2,
                        shapeComponent.size!.y / 2,
                        shapeComponent.size!.z / 2);
                } break;
                case Comps.ShapeTypes.Capsule: {
                    geometry = new PhysX.PxCapsuleGeometry(
                        shapeComponent.radius!,
                        shapeComponent.height! / 2);
                } break;
                case Comps.ShapeTypes.Cylinder: {
                    geometry = new PhysX.PxConvexMeshGeometry(
                        resources.physics.customConvexShapes.createCylinder());
                } break;
            }
            let shape: PhysXT.PxShape
            switch (shapeComponent.materialType) {
                case Comps.MaterialTypes.Wheel: {
                    shape = resources.physics.physics.createShape(
                        geometry,
                        resources.physics.materials.wheel,
                        true)
                } break;
                case Comps.MaterialTypes.Default: {
                    shape = resources.physics.physics.createShape(
                        geometry,
                        resources.physics.materials.default,
                        true)
                } break;
            }

            let isRobotComponent = Funs.isEntityType(Comps.EntityTypes.RobotComponent, aSC.entityUid, system)
            if (isRobotComponent) {
                console.log("not supported")
            } else {
                let foundRigidBodyComponent = system.find([
                    ECS.Get.One,
                    [Comps.ComponentTypes.RigidBody],
                    ECS.By.EntityUid,
                    shapeComponent.entityUid
                ])
                if (foundRigidBodyComponent[0].length == 0) {
                    console.log("shape without rigidbody")
                    continue
                }
                var filterData = new PhysX.PxFilterData(1, 1, 0, 0);
                shape.setSimulationFilterData(filterData)
                let rigidbodyComponent = foundRigidBodyComponent[0][0] as Comps.RigidBody
                rigidbodyComponent.body!.attachShape(shape)
                shapeComponent.shape = shape
            }
            let entityCache = resources.entitiesCache.entities.get(shapeComponent.entityUid)
            entityCache!.shape = system.createProxy(shapeComponent)

            PhysX.destroy(geometry);
        }
        /////////////////
        // added position
        /////////////////
        for (let aPC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Position]) {
            let foundComponents = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aPC.entityUid
            ])
            if (foundComponents[0].length == 0) {
                continue
            }
            let positionComponent = aPC as Comps.Position
            let rigidBodyComponent = foundComponents[0][0] as Comps.RigidBody;
            let transform = rigidBodyComponent.body!.getGlobalPose();

            rigidBodyComponent.body!.setGlobalPose(
                new PhysX.PxTransform(
                    new PhysX.PxVec3(
                        positionComponent.x,
                        positionComponent.y,
                        positionComponent.z),
                    transform.q,
                ))

            let entityCache = resources.entitiesCache.entities.get(positionComponent.entityUid)
            entityCache!.position = system.createProxy(positionComponent)
        }
        /////////////////
        // added rotation
        /////////////////
        for (let aRC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Rotation]) {
            let foundComponents = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aRC.entityUid
            ])
            if (foundComponents[0].length == 0) {
                continue
            }
            let rotationComponent = aRC as Comps.Rotation
            let rigidBodyComponent = foundComponents[0][0] as Comps.RigidBody;
            let transform = rigidBodyComponent.body!.getGlobalPose();

            rigidBodyComponent.body!.setGlobalPose(
                new PhysX.PxTransform(
                    transform.p,
                    new PhysX.PxQuat(
                        rotationComponent.x,
                        rotationComponent.y,
                        rotationComponent.z,
                        rotationComponent.w)))

            let entityCache = resources.entitiesCache.entities.get(rotationComponent.entityUid)
            entityCache!.rotation = system.createProxy(rotationComponent)
        }
        /////////////////
        // added mass
        /////////////////
        for (let aMC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Mass]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aMC.entityUid
            ])
            if (foundRigidBody[0].length == 0) {
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let massComponent = aMC as Comps.Mass
            (rigidBodyComponent.body as PhysXT.PxRigidBody).setMass(massComponent.mass)

            let entityCache = resources.entitiesCache.entities.get(massComponent.entityUid)
            entityCache!.mass = system.createProxy(massComponent)
        }
        /////////////////
        // added angular velocity
        /////////////////
        for (let aAVC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.AngularVelocity]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aAVC.entityUid
            ])
            if (foundRigidBody[0].length == 0) {
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let angularVelocityComponent = aAVC as Comps.AngularVelocity
            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .setAngularVelocity(
                    new PhysX.PxVec3(
                        angularVelocityComponent.x,
                        angularVelocityComponent.y,
                        angularVelocityComponent.z))

            let entityCache = resources.entitiesCache.entities.get(angularVelocityComponent.entityUid)
            entityCache!.angularVelocity = system.createProxy(angularVelocityComponent)
        }
        /////////////////
        // added constraint
        /////////////////
        for (let aCC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Constraint]) {
            let foundRigidBodyA = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aCC.entityUid
            ])
            if (foundRigidBodyA[0].length == 0) {
                continue
            }
            let constraintComponent = aCC as Comps.Constraint

            let foundRigidBodyB = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                constraintComponent.entityUidConstrainedTo
            ])
            if (foundRigidBodyB[0].length == 0) {
                continue
            }
            let rigidBodyAComponent = foundRigidBodyA[0][0] as Comps.RigidBody
            let rigidBodyBComponent = foundRigidBodyB[0][0] as Comps.RigidBody

            if (rigidBodyAComponent.body == undefined || rigidBodyBComponent.body == undefined) continue


            let rigidBodyA = rigidBodyAComponent.body!
            let rigidBodyB = rigidBodyBComponent.body!

            let constraint: PhysXT.PxJoint
            let localFrameA = new PhysX.PxTransform(
                new PhysX.PxVec3(
                    constraintComponent.pivotA!.x,
                    constraintComponent.pivotA!.y,
                    constraintComponent.pivotA!.z),
                new PhysX.PxQuat(
                    constraintComponent.axisA!.x,
                    constraintComponent.axisA!.y,
                    constraintComponent.axisA!.z,
                    constraintComponent.axisA!.w));

            let localFrameB = new PhysX.PxTransform(
                new PhysX.PxVec3(
                    constraintComponent.pivotB!.x,
                    constraintComponent.pivotB!.y,
                    constraintComponent.pivotB!.z),
                new PhysX.PxQuat(
                    constraintComponent.axisB!.x,
                    constraintComponent.axisB!.y,
                    constraintComponent.axisB!.z,
                    constraintComponent.axisB!.w));

            switch (constraintComponent.constraintType) {
                case Comps.ConstraintTypes.Lock: {
                    constraint = (PhysX.PxTopLevelFunctions.prototype as any).FixedJointCreate(
                        resources.physics.physics,
                        rigidBodyA,
                        localFrameA,
                        rigidBodyB,
                        localFrameB)
                } break;
                case Comps.ConstraintTypes.Distance: {
                    console.log("not yet")
                    continue // remove
                } break;

                case Comps.ConstraintTypes.Hinge: {
                    constraint = (PhysX.PxTopLevelFunctions.prototype as any).RevoluteJointCreate(
                        resources.physics.physics,
                        rigidBodyA,
                        localFrameA,
                        rigidBodyB,
                        localFrameB)
                } break;
            }
            constraintComponent.constraint = constraint
            let entityCache = resources.entitiesCache.entities.get(constraintComponent.entityUid)
            entityCache!.constraint = system.createProxy(constraintComponent)
        }
        /////////////////
        // added linear velocity
        /////////////////
        for (let aVC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.LinearVelocity]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aVC.entityUid
            ])
            if (foundRigidBody[0].length == 0) {
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let linearVelocityComponent = aVC as Comps.LinearVelocity
            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .setLinearVelocity(
                    new PhysX.PxVec3(
                        linearVelocityComponent.x,
                        linearVelocityComponent.y,
                        linearVelocityComponent.z))

            let entityCache = resources.entitiesCache.entities.get(linearVelocityComponent.entityUid)
            entityCache!.linearVelocity = system.createProxy(linearVelocityComponent)
        }
        /////////////////
        // added angular force
        /////////////////
        for (let aAFC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Torque]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aAFC.entityUid
            ])
            if (foundRigidBody[0].length == 0) {
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let torqueComponent = aAFC as Comps.Torque

            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .addTorque(
                    new PhysX.PxVec3(
                        torqueComponent.xToApply,
                        torqueComponent.yToApply,
                        torqueComponent.zToApply))

            torqueComponent.xToApply = 0
            torqueComponent.yToApply = 0
            torqueComponent.zToApply = 0

            let entityCache = resources.entitiesCache.entities.get(torqueComponent.entityUid)
            entityCache!.torque = system.createProxy(torqueComponent)
        }
        /////////////////
        // added force
        /////////////////
        for (let aFC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Force]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aFC.entityUid
            ])
            if (foundRigidBody[0].length == 0) {
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let forceComponent = aFC as Comps.Torque

            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .addForce(
                    new PhysX.PxVec3(
                        forceComponent.xToApply,
                        forceComponent.yToApply,
                        forceComponent.zToApply))

            forceComponent.xToApply = 0
            forceComponent.yToApply = 0
            forceComponent.zToApply = 0

            let entityCache = resources.entitiesCache.entities.get(forceComponent.entityUid)
            entityCache!.force = system.createProxy(forceComponent)
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      changed
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////
        // changed angular velocity
        /////////////////
        for (let cAVC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.AngularVelocity]) {
            let entityCache = resources.entitiesCache.entities.get(cAVC.entityUid)
            let rigidBodyComponent = entityCache!.rigidbody!

            let angularVelocityComponent = cAVC as Comps.AngularVelocity
            let body = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            body.setAngularVelocity(
                new PhysX.PxVec3(
                    angularVelocityComponent.x,
                    angularVelocityComponent.y,
                    angularVelocityComponent.z))

        }
        /////////////////
        // changed force to apply
        /////////////////
        for (let cFC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Torque]) {
            let entityCache = resources.entitiesCache.entities.get(cFC.entityUid)
            let rigidBodyComponent = entityCache!.rigidbody!
            let forceComponent = cFC as Comps.Torque

            let body = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            body.addTorque(
                new PhysX.PxVec3(
                    forceComponent.xToApply,
                    forceComponent.yToApply,
                    forceComponent.zToApply))
            forceComponent.xToApply = 0
            forceComponent.yToApply = 0
            forceComponent.zToApply = 0
        }
        /////////////////
        // changed linear velocity
        /////////////////
        for (let cLVC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.LinearVelocity]) {
            let entityCache = resources.entitiesCache.entities.get(cLVC.entityUid)
            let rigidBodyComponent = entityCache!.rigidbody!
            let linearVelocityComponent = cLVC as Comps.LinearVelocity

            let body = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            body.setLinearVelocity(
                new PhysX.PxVec3(
                    linearVelocityComponent.x,
                    linearVelocityComponent.y,
                    linearVelocityComponent.z))

        }
        /////////////////
        // changed rotation
        /////////////////
        for (let cRC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Rotation]) {
            let entityCache = resources.entitiesCache.entities.get(cRC.entityUid)
            let rigidBodyComponent = entityCache!.rigidbody!
            let rotationComponent = cRC as Comps.Rotation

            let transform = rigidBodyComponent.body!.getGlobalPose();
            rigidBodyComponent.body!.setGlobalPose(
                new PhysX.PxTransform(
                    transform.p,
                    new PhysX.PxQuat(
                        rotationComponent.x,
                        rotationComponent.y,
                        rotationComponent.z,
                        rotationComponent.w)))
        }
        /////////////////
        // changed position
        /////////////////
        for (let cPC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Position]) {
            let entityCache = resources.entitiesCache.entities.get(cPC.entityUid)
            let rigidBodyComponent = entityCache!.rigidbody!
            let positionComponent = cPC as Comps.Position

            let transform = rigidBodyComponent.body!.getGlobalPose();
            rigidBodyComponent.body!.setGlobalPose(
                new PhysX.PxTransform(
                    new PhysX.PxVec3(
                        positionComponent.x,
                        positionComponent.y,
                        positionComponent.z),
                    transform.q))
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      get rigidbodies changes
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        let activeActors = (PhysX.SupportFunctions.prototype as any)
            .PxScene_getActiveActors(resources.physics.scene) as PhysXT.PxArray_PxActorPtr

        for (let i = 0; i < activeActors.size(); i++) {
            let entityUid = resources.physics.rigidBodyPtrAndEntityUid.get((activeActors.get(i) as any).ptr)
            if (entityUid == undefined) {
                continue
            }
            let entityCache = resources.entitiesCache.entities.get(entityUid)!

            let rigidBody = entityCache!.rigidbody!.body as PhysXT.PxRigidDynamic
            let transform = entityCache!.rigidbody!.body!.getGlobalPose();

            let positionComponent = entityCache.position!
            let rigidBodyPosition = transform.p
            if (
                rigidBodyPosition.x != positionComponent.x ||
                rigidBodyPosition.y != positionComponent.y ||
                rigidBodyPosition.z != positionComponent.z
            ) {
                positionComponent.x = rigidBodyPosition.x
                positionComponent.y = rigidBodyPosition.y
                positionComponent.z = rigidBodyPosition.z
            }

            let rotationComponent = entityCache.rotation!
            let rigidBodyQuaternion = transform.q
            if (
                rigidBodyQuaternion.x != rotationComponent.x ||
                rigidBodyQuaternion.y != rotationComponent.y ||
                rigidBodyQuaternion.z != rotationComponent.z ||
                rigidBodyQuaternion.w != rotationComponent.w
            ) {
                rotationComponent.x = rigidBodyQuaternion.x
                rotationComponent.y = rigidBodyQuaternion.y
                rotationComponent.z = rigidBodyQuaternion.z
                rotationComponent.w = rigidBodyQuaternion.w
            }

            let linearVelocityComponent = entityCache.linearVelocity
            if (linearVelocityComponent != undefined) {
                let rigidBodyLinearVelocity = rigidBody.getLinearVelocity()
                if (
                    rigidBodyLinearVelocity.x != linearVelocityComponent.x ||
                    rigidBodyLinearVelocity.y != linearVelocityComponent.y ||
                    rigidBodyLinearVelocity.z != linearVelocityComponent.z
                ) {
                    linearVelocityComponent.x = rigidBodyLinearVelocity.x
                    linearVelocityComponent.y = rigidBodyLinearVelocity.y
                    linearVelocityComponent.z = rigidBodyLinearVelocity.z
                }
            }

            let angularVelocityComponent = entityCache.angularVelocity
            if (angularVelocityComponent != undefined) {
                let rigidBodyAngularVelocity = rigidBody.getAngularVelocity()
                if (
                    rigidBodyAngularVelocity.x != angularVelocityComponent.x ||
                    rigidBodyAngularVelocity.y != angularVelocityComponent.y ||
                    rigidBodyAngularVelocity.z != angularVelocityComponent.z
                ) {
                    angularVelocityComponent.x = rigidBodyAngularVelocity.x
                    angularVelocityComponent.y = rigidBodyAngularVelocity.y
                    angularVelocityComponent.z = rigidBodyAngularVelocity.z
                }
            }
        }
    }
}
