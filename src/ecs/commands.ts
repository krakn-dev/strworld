import * as ECS from "./ecs"
import * as Res from "./resources"
import * as Mat from "../math"
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
    CreateScene,
    DestroyRobotComponent,
    RunCode,
    SyncPhysics,
    CameraFollowGeometry,
}

// the first
export class TheFirst implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.TheFirst
    }

    run(system: ECS.System, _: Res.Resources) {

        system.addCommand(new CreateScene())
        system.addCommand(new SendGraphicComponentsToRender)
        system.addCommand(new SyncPhysics())
        system.addCommand(new DestroyRobotComponent())
        system.addCommand(new TorqueWheels())
        system.addCommand(new MoveVehicle())
        system.addCommand(new CreateRobot())
        system.addCommand(new RunCode())


        system.removeCommand(this.commandType)
    }
}
export class RunCode implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.RunCode
    }

    run(system: ECS.System, resources: Res.Resources) {
        if (resources.input.isKeyDown(Ser.Keys.A)) {
            let rigidBodyComponent = system.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody;
            system.removeEntity(rigidBodyComponent.entityUid)
        }
    }
}
export class DestroyRobotComponent implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.DestroyRobotComponent
    }

    run(system: ECS.System, resources: Res.Resources) {
    }
}
export class CameraFollowGeometry implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CameraFollowGeometry
    }

    run(system: ECS.System, resources: Res.Resources) {
        //        let foundHardCodedIdComponent = system.find([ECS.Get.All, [Comps.ComponentTypes.HardCodedId], ECS.By.Any, null])
        //        if (foundHardCodedIdComponent[0].length == 0) {
        //            console.log("no hardcodedid found")
        //            return
        //        }
        //        let geometryUid = (foundHardCodedIdComponent[0][0] as Comps.HardCodedId).entityUid
        //
        //        for (let cPC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Position]) {
        //            if (cPC.entityUid != geometryUid) continue
        //
        //            let foundCameraComponent = system.find([ECS.Get.All, [Comps.ComponentTypes.Position], ECS.By.EntityType, Comps.EntityTypes.Camera])
        //            if (foundCameraComponent[0].length == 0) return
        //            let cameraPositionComponent = foundCameraComponent[0][0] as Comps.Position
        //            let geometryPositionComponent = cPC as Comps.Position
        //
        //            let offset = new Mat.Vector3(0, 13, 13)
        //            cameraPositionComponent.x = geometryPositionComponent.x + offset.x
        //            cameraPositionComponent.y = geometryPositionComponent.y + offset.y
        //            cameraPositionComponent.z = geometryPositionComponent.z + offset.z
        //        }
    }
}

export class CreateScene implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CreateScene
    }

    run(system: ECS.System, resources: Res.Resources) {
        {
            let camera = system.createEntity()
            let cameraComponent = new Comps.Camera(
                50,
                0.1,
                500,
                resources.domState.windowWidth! / resources.domState.windowHeight!,
                camera)
            let positionComponent = new Comps.Position(new Mat.Vector3(0, 30, 30), camera)
            let rotationComponent = new Comps.Rotation(new Mat.Vector3(-45, 0, 0), camera)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Camera, camera)
            system.addComponent(cameraComponent)
            system.addComponent(rotationComponent)
            system.addComponent(positionComponent)
            system.addComponent(entityTypeComponent)
            resources.cameraViewEntities.updateCameraPosition(positionComponent)
            resources.cameraViewEntities.updateCameraRotation(rotationComponent)
            resources.cameraViewEntities.updateCameraComponent(cameraComponent)
        }
        {
            let pointLight = system.createEntity()
            let lightComponent = new Comps.Light(Comps.LightTypes.PointLight, pointLight);
            lightComponent.intensity = 1
            lightComponent.color = 0xffffff
            lightComponent.distance = 200
            lightComponent.decay = 0
            let positionComponent = new Comps.Position(new Mat.Vector3(3, 10, 3), pointLight)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Light, pointLight)
            system.addComponent(lightComponent)
            system.addComponent(positionComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let ambientLight = system.createEntity()
            let lightComponent = new Comps.Light(Comps.LightTypes.AmbientLight, ambientLight)
            lightComponent.intensity = 0.5
            lightComponent.color = 0xffffff
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Light, ambientLight)
            system.addComponent(lightComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let floor = system.createEntity()
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Static, floor)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, floor)
            shapeComponent.size = new Mat.Vector3(50, 10, 50)
            let positionComponent = new Comps.Position(new Mat.Vector3(0, -6, 0), floor)
            let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), floor)
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

        //////
        /// individual
        //////
        //for (let i = 0; i < 100; i++) {
        //    let comp = system.createEntity()

        //    let positionComponent = new Comps.Position(new Mat.Vector3(0, i, 0), comp)
        //    let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), comp)
        //    let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, comp)
        //    shapeComponent.size = new Mat.Vector3(1, 1, 1)
        //    let shapeColorComponent = new Comps.ShapeColor(0x000ff, comp)
        //    let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.RobotComponent, comp)
        //    let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, comp)
        //    // let robotCompComponent = new Comps.RobotComponent(Comps.RobotComponentTypes.SteelPlate, robot, comp)

        //    // system.addComponent(robotCompComponent)
        //    system.addComponent(rigidBodyComponent)
        //    system.addComponent(positionComponent)
        //    system.addComponent(rotationComponent)
        //    system.addComponent(shapeComponent)
        //    system.addComponent(shapeColorComponent)
        //    system.addComponent(entityTypeComponent)
        //}
        //////
        /// compound
        //////
        let robot = system.createEntity()
        let robotComponents = resources.robots.addRobot(robot)
        let aggregateComponent = new Comps.Aggregate(robot)
        system.addComponent(aggregateComponent)

        let subComponentsEntityUid = []
        for (let i = 0; i < 10; i++) {
            let comp = system.createEntity()
            subComponentsEntityUid.push(comp)

            let positionComponent = new Comps.Position(new Mat.Vector3(0, 0, 0), comp)
            let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), comp)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, comp)
            shapeComponent.size = new Mat.Vector3(1, 1, 1)
            shapeComponent.positionOffset = new Mat.Vector3(i, i, 0)
            shapeComponent.rotationOffset = new Mat.Quaternion(0, 0, 0, 1)
            let shapeColorComponent = new Comps.ShapeColor(0x000ff, comp)
            let robotCompComponent = new Comps.RobotComponent(Comps.RobotComponentTypes.SteelPlate, robot, comp)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.RobotComponent, comp)

            system.addComponent(robotCompComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let superComp = system.createEntity()
            aggregateComponent.rigidBodiesEntityUid.push(superComp)
            let superCompComponents = robotComponents.addSuperComponent(superComp)
            superCompComponents.subComponentsEntityUid = subComponentsEntityUid;

            let positionComponent = new Comps.Position(new Mat.Vector3(0, 0.5, 0), superComp)
            let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), superComp)
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, superComp)
            let forceComponent = new Comps.Force(superComp)
            let torqueComponent = new Comps.Torque(superComp)
            //            torqueComponent.zToApply = 150000
            let superCompComponent = new Comps.RobotSuperComponent(robot, superComp)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Compound, superComp)
            shapeComponent.shapesEntityUid = subComponentsEntityUid
            let massComponent = new Comps.Mass(subComponentsEntityUid.length, superComp)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.RobotSuperComponent, superComp)

            system.addComponent(massComponent)
            system.addComponent(entityTypeComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(shapeComponent)
            system.addComponent(superCompComponent)
            system.addComponent(forceComponent)
            system.addComponent(torqueComponent)
        }
        //////
        /// constraints
        //////

        system.removeCommand(this.commandType)
    }
}
export class TorqueWheels implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.TorqueWheels
    }

    run(system: ECS.System, resources: Res.Resources) {
        for (let cWC of resources.componentChanges.changedComponents[Comps.ComponentTypes.Wheel]) {
            let wheelComponent = cWC as Comps.Wheel
            let entityComponents = system.entities.get(wheelComponent.entityUid)
            if (entityComponents == undefined || entityComponents.components[Comps.ComponentTypes.Constraint].length == 0) continue

            let constraintComponent = entityComponents.components[Comps.ComponentTypes.Constraint][0] as Comps.Constraint;
            if (constraintComponent.constraint == undefined) continue

            let hinge = constraintComponent.constraint as PhysXT.PxRevoluteJoint
            hinge.setDriveVelocity(wheelComponent.velocity)
        }
    }
}
export class MoveVehicle implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.MoveVehicle
    }

    run(system: ECS.System, resources: Res.Resources) {
        //    let maxVelocity = 3
        //    let direction = Funs.getMovementDirection(resources)

        //    let foundComponents = system.find([
        //        ECS.Get.All,
        //        [Comps.ComponentTypes.Wheel],
        //        ECS.By.Any,
        //        null
        //    ])
        //    for (let fC of foundComponents[0]) {
        //        let wheelComponent = fC as Comps.Wheel
        //        if (direction.y == 1) {
        //            wheelComponent.velocity = maxVelocity
        //        }
        //        if (direction.y == -1) {
        //            wheelComponent.velocity = -maxVelocity
        //        }
        //        if (direction.x != 0) {
        //            wheelComponent.velocity = 0
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
                let stickman = system.createEntity()
                let positionComponent = new Comps.Position(new Mat.Vector3(0, 0, 0), stickman)
                let entityStateComponent = new Comps.EntityState([Comps.EntityStates.Idle], stickman)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Stickman, stickman)
                let massComponent = new Comps.Mass(4, stickman)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, stickman)
                shapeComponent.size = new Mat.Vector3(40, 90, 30)

                system.addComponent(massComponent)
                system.addComponent(shapeComponent)
                system.addComponent(positionComponent)
                system.addComponent(entityStateComponent)
                system.addComponent(entityTypeComponent)
            }
        }
        system.addCommand(new MovePlayer())
        system.removeCommand(this.commandType)
    }
}

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

        //for (let eUid of resources.cameraViewEntities.entities) {
        //    let entityComponents = system.entities.get(eUid)!
        //    graphicChanges.changedComponents.push(entityComponents.components[Comps.ComponentTypes.Position][0])
        //    graphicChanges.changedComponents.push(entityComponents.components[Comps.ComponentTypes.Rotation][0])
        //}

        // changed
        graphicChanges.changedComponents.push(...resources.componentChanges.proxyFreeChangedComponents[Comps.ComponentTypes.Position])
        graphicChanges.changedComponents.push(...resources.componentChanges.proxyFreeChangedComponents[Comps.ComponentTypes.Rotation])

        // order is important
        // added
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.EntityType])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.Camera])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.Light])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.Shape])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.EntityState])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.Rotation])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.Position])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.ShapeColor])

        // check for removed entities
        for (let rC of resources.componentChanges.proxyFreeRemovedComponents[Comps.ComponentTypes.EntityType]) {
            graphicChanges.removedEntitiesUid.push(rC.entityUid)
        }

        // check for added entities
        for (let aC of resources.componentChanges.proxyFreeAddedComponents[Comps.ComponentTypes.EntityType]) {
            graphicChanges.addedEntitiesUid.push(aC.entityUid)
        }

        postMessage(new Ser.Message(
            Ser.Messages.GraphicChanges, graphicChanges));

    }
}
export class SyncPhysics implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.SyncPhysics
    }

    run(system: ECS.System, resources: Res.Resources) {

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      added
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////
        // added rigidbody
        /////////////////
        for (let aRBC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            let rigidBodyComponent = aRBC as Comps.RigidBody

            let transform = new PhysX.PxTransform((PhysX.PxIDENTITYEnum as any).PxIdentity)

            let rigidBody: PhysXT.PxRigidActor
            switch (rigidBodyComponent.bodyType) {
                case Comps.BodyTypes.Dynamic: {
                    rigidBody = resources.physics.physics.createRigidDynamic(transform);
                } break;
                case Comps.BodyTypes.Static: {
                    rigidBody = resources.physics.physics.createRigidStatic(transform);
                } break;
            }
            let isRigidBodyInAggregate = false
            for (let aAC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Aggregate]) {
                let aggregateComponent = aAC as Comps.Aggregate
                for (let eUid of aggregateComponent.rigidBodiesEntityUid) {
                    if (rigidBodyComponent.entityUid == eUid) {
                        isRigidBodyInAggregate = true
                    }
                }
            }

            rigidBodyComponent.body = rigidBody
            if (!isRigidBodyInAggregate) {
                resources.physics.scene.addActor(rigidBody)
            }

            resources.physics.rigidBodyPtrToEntityUid.set(
                (rigidBody as any).ptr as number,
                rigidBodyComponent.entityUid)

            PhysX.destroy(transform)
        }
        /////////////////
        // added aggregate
        /////////////////
        for (let aAC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Aggregate]) {
            let aggregateComponent = aAC as Comps.Aggregate

            let shapeNumber = 0
            for (let eUid of aggregateComponent.rigidBodiesEntityUid) {
                let childEntityComponents = system.entities.get(eUid)!
                let childShapeComponent = childEntityComponents.components[Comps.ComponentTypes.Shape][0] as Comps.Shape

                if (childShapeComponent.shapeType == Comps.ShapeTypes.Compound) {
                    shapeNumber += childShapeComponent.shapesEntityUid.length;
                } else {
                    shapeNumber += 1
                }
            }
            let rigidBodyNumber = aggregateComponent.rigidBodiesEntityUid.length;

            let newAggregate = resources.physics.physics.createAggregate(rigidBodyNumber, shapeNumber, true)
            for (let eUid of aggregateComponent.rigidBodiesEntityUid) {
                let childEntityComponents = system.entities.get(eUid)!
                let childRigidBodyComponent = childEntityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
                newAggregate.addActor(childRigidBodyComponent.body!)
            }
            resources.physics.scene.addAggregate(newAggregate)
            aggregateComponent.aggregate = newAggregate
        }
        /////////////////
        // added shape
        /////////////////
        for (let aSC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            let entityComponents = system.entities.get(aSC.entityUid)!

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            if (rigidBodyComponent == undefined) continue

            let shapeComponent = aSC as Comps.Shape
            let geometry: PhysXT.PxGeometry
            let filterData = new PhysX.PxFilterData(1, 1,
                (PhysX.PxPairFlagEnum as any).eNOTIFY_TOUCH_FOUND |
                (PhysX.PxPairFlagEnum as any).eNOTIFY_CONTACT_POINTS, 0);
            //let filterData = new PhysX.PxFilterData(1, 1, 0, 0);
            // (PhysX.PxPairFlagEnum as any).eNOTIFY_TOUCH_LOST

            let destroyGeometry: boolean
            switch (shapeComponent.shapeType) {
                case Comps.ShapeTypes.Box: {
                    destroyGeometry = true
                    geometry = new PhysX.PxBoxGeometry(
                        shapeComponent.size!.x / 2,
                        shapeComponent.size!.y / 2,
                        shapeComponent.size!.z / 2);
                } break;
                case Comps.ShapeTypes.Capsule: {
                    destroyGeometry = true
                    geometry = new PhysX.PxCapsuleGeometry(
                        shapeComponent.radius!,
                        shapeComponent.height! / 2);
                } break;
                case Comps.ShapeTypes.Cylinder: {
                    destroyGeometry = false
                    geometry = resources.physics.customConvexShapes.createPrism(
                        shapeComponent.sideNumber!,
                        shapeComponent.height!,
                        shapeComponent.radius!);
                } break;
                case Comps.ShapeTypes.Compound: {

                    let shapesEntityUid = (entityComponents.components[Comps.ComponentTypes.Shape][0] as Comps.Shape).shapesEntityUid!

                    for (let eUid of shapesEntityUid) {
                        let shapeComponent = system.entities.get(eUid)!.components[Comps.ComponentTypes.Shape][0] as Comps.Shape;
                        let geometry: PhysXT.PxGeometry

                        switch (shapeComponent.shapeType) {
                            case Comps.ShapeTypes.Box: {
                                destroyGeometry = true
                                geometry = new PhysX.PxBoxGeometry(
                                    shapeComponent.size!.x / 2,
                                    shapeComponent.size!.y / 2,
                                    shapeComponent.size!.z / 2);
                            } break;
                            case Comps.ShapeTypes.Capsule: {
                                destroyGeometry = true
                                geometry = new PhysX.PxCapsuleGeometry(
                                    shapeComponent.radius!,
                                    shapeComponent.height! / 2);
                            } break;
                            case Comps.ShapeTypes.Cylinder: {
                                destroyGeometry = false
                                geometry = resources.physics.customConvexShapes.createPrism(
                                    shapeComponent.sideNumber!,
                                    shapeComponent.height!,
                                    shapeComponent.radius!);
                            } break;
                            case Comps.ShapeTypes.Compound: {
                                console.log("no way")
                            } continue;
                        }
                        let shape = resources.physics.physics.createShape(
                            geometry,
                            resources.physics.materials.default,
                            true)

                        let transform = new PhysX.PxTransform(
                            new PhysX.PxVec3(
                                shapeComponent.positionOffset!.x,
                                shapeComponent.positionOffset!.y,
                                shapeComponent.positionOffset!.z),
                            new PhysX.PxQuat(
                                shapeComponent.rotationOffset!.x,
                                shapeComponent.rotationOffset!.y,
                                shapeComponent.rotationOffset!.z,
                                shapeComponent.rotationOffset!.w))
                        shape.setLocalPose(transform)
                        shape.setSimulationFilterData(filterData)
                        resources.physics.shapePtrToEntityUid.set((shape as any).ptr, eUid)
                        shapeComponent.shape = shape
                        rigidBodyComponent.body!.attachShape(shape)

                        if (destroyGeometry) {
                            PhysX.destroy(geometry);
                        }
                        PhysX.destroy(filterData)
                    }
                } continue;
            }

            let material: PhysXT.PxMaterial;
            switch (shapeComponent.materialType) {
                case Comps.MaterialTypes.Wheel: {
                    material = resources.physics.materials.wheel
                } break;
                case Comps.MaterialTypes.Default: {
                    material = resources.physics.materials.default
                } break;
            }

            let shape = resources.physics.physics.createShape(geometry, material, true)
            shape.setSimulationFilterData(filterData)
            resources.physics.shapePtrToEntityUid.set((shape as any).ptr, aSC.entityUid)
            shapeComponent.shape = shape
            rigidBodyComponent.body!.attachShape(shape)

            if (destroyGeometry) {
                PhysX.destroy(geometry);
            }
            PhysX.destroy(filterData)
        }
        /////////////////
        // added position
        /////////////////
        for (let aPC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Position]) {
            let entityComponents = system.entities.get(aPC.entityUid)!
            if (entityComponents.components[Comps.ComponentTypes.RigidBody].length == 0) continue

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let positionComponent = aPC as Comps.Position
            let transform = rigidBodyComponent.body!.getGlobalPose();

            rigidBodyComponent.body!.setGlobalPose(
                new PhysX.PxTransform(
                    new PhysX.PxVec3(
                        positionComponent.x,
                        positionComponent.y,
                        positionComponent.z),
                    transform.q,
                ))
        }
        /////////////////
        // added rotation
        /////////////////
        for (let aRC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Rotation]) {
            let entityComponents = system.entities.get(aRC.entityUid)!
            if (entityComponents.components[Comps.ComponentTypes.RigidBody].length == 0) continue

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let rotationComponent = aRC as Comps.Rotation
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
        // added mass
        /////////////////
        for (let aMC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Mass]) {
            let entityComponents = system.entities.get(aMC.entityUid)!

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let rigidBody = rigidBodyComponent.body as PhysXT.PxRigidBody
            let massComponent = aMC as Comps.Mass
            (PhysX.PxRigidBodyExt.prototype as any).updateMassAndInertia(rigidBody, massComponent.mass)
        }
        /////////////////
        // added angular velocity
        /////////////////
        for (let aAVC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.AngularVelocity]) {
            let entityComponents = system.entities.get(aAVC.entityUid)!

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let angularVelocityComponent = aAVC as Comps.AngularVelocity
            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .setAngularVelocity(
                    new PhysX.PxVec3(
                        angularVelocityComponent.x,
                        angularVelocityComponent.y,
                        angularVelocityComponent.z))
        }
        /////////////////
        // added linear velocity
        /////////////////
        for (let aLVC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.LinearVelocity]) {
            let entityComponents = system.entities.get(aLVC.entityUid)!

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let linearVelocityComponent = aLVC as Comps.LinearVelocity
            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .setLinearVelocity(
                    new PhysX.PxVec3(
                        linearVelocityComponent.x,
                        linearVelocityComponent.y,
                        linearVelocityComponent.z))

        }
        /////////////////
        // added torque
        /////////////////
        for (let aTC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Torque]) {
            let entityComponents = system.entities.get(aTC.entityUid)!

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let torqueComponent = aTC as Comps.Torque

            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .addTorque(
                    new PhysX.PxVec3(
                        torqueComponent.xToApply,
                        torqueComponent.yToApply,
                        torqueComponent.zToApply))

            torqueComponent.xToApply = 0
            torqueComponent.yToApply = 0
            torqueComponent.zToApply = 0
        }
        /////////////////
        // added force
        /////////////////
        for (let aFC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Force]) {
            let entityComponents = system.entities.get(aFC.entityUid)!

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let forceComponent = aFC as Comps.Force

            (rigidBodyComponent.body as PhysXT.PxRigidDynamic)
                .addForce(
                    new PhysX.PxVec3(
                        forceComponent.xToApply,
                        forceComponent.yToApply,
                        forceComponent.zToApply));

            forceComponent.xToApply = 0
            forceComponent.yToApply = 0
            forceComponent.zToApply = 0
        }
        /////////////////
        // added constraint
        /////////////////
        for (let aCC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Constraint]) {
            let entityComponentsA = system.entities.get(aCC.entityUid)!
            let constraintComponent = aCC as Comps.Constraint

            let entityComponentsB = system.entities.get(constraintComponent.entityUidConstrainedTo)!

            let rigidBodyAComponent = entityComponentsA.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let rigidBodyBComponent = entityComponentsB.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody

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
                        rigidBodyB,
                        localFrameB,
                        rigidBodyA, // changed
                        localFrameA) as PhysXT.PxRevoluteJoint

                    (constraint as PhysXT.PxRevoluteJoint)
                        .setRevoluteJointFlag((PhysX.PxRevoluteJointFlagEnum as any)
                            .eDRIVE_ENABLED, true)

                } break;
            }
            constraintComponent.constraint = constraint
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
            let entityComponents = system.entities.get(cAVC.entityUid)!
            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody

            let angularVelocityComponent = cAVC as Comps.AngularVelocity
            let body = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            body.setAngularVelocity(
                new PhysX.PxVec3(
                    angularVelocityComponent.x,
                    angularVelocityComponent.y,
                    angularVelocityComponent.z))

        }
        /////////////////
        // changed force
        /////////////////
        for (let cFC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Force]) {
            let entityComponents = system.entities.get(cFC.entityUid)!
            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let forceComponent = cFC as Comps.Force

            let body = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            body.addForce(
                new PhysX.PxVec3(
                    forceComponent.xToApply,
                    forceComponent.yToApply,
                    forceComponent.zToApply))
            forceComponent.xToApply = 0
            forceComponent.yToApply = 0
            forceComponent.zToApply = 0
        }
        /////////////////
        // changed torque
        /////////////////
        for (let cTC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Torque]) {
            let entityComponents = system.entities.get(cTC.entityUid)!
            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let torqueComponent = cTC as Comps.Torque

            let body = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            body.addTorque(
                new PhysX.PxVec3(
                    torqueComponent.xToApply,
                    torqueComponent.yToApply,
                    torqueComponent.zToApply))
            torqueComponent.xToApply = 0
            torqueComponent.yToApply = 0
            torqueComponent.zToApply = 0
        }
        /////////////////
        // changed linear velocity
        /////////////////
        for (let cLVC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.LinearVelocity]) {
            let entityComponents = system.entities.get(cLVC.entityUid)!
            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
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
            let entityComponents = system.entities.get(cRC.entityUid)!
            if (entityComponents.components[Comps.ComponentTypes.RigidBody].length == 0) continue

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
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
            let entityComponents = system.entities.get(cPC.entityUid)!
            if (entityComponents.components[Comps.ComponentTypes.RigidBody].length == 0) continue

            let rigidBodyComponent = entityComponents.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
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
        //////      removed
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////
        // removed rigidBody
        /////////////////
        for (let rRBC of resources.componentChanges.proxyFreeRemovedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            let rigidBodyComponent = rRBC as Comps.RigidBody

            if (rigidBodyComponent.body == undefined) continue;
            resources.physics.scene.removeActor(rigidBodyComponent.body)
            resources.physics.rigidBodyPtrToEntityUid.delete(rigidBodyComponent.entityUid)
        }
        /////////////////
        // removed shape
        /////////////////
        for (let rSC of resources.componentChanges.proxyFreeRemovedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            resources.physics.shapePtrToEntityUid.delete(rSC.entityUid)
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      sync changes
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        let dt = resources.deltaTime.get()
        if (dt != null) {
            resources.physics.instantContacts = []
            resources.physics.scene.simulate(dt / 1000)
            resources.physics.scene.fetchResults(true)
        }

        let activeActors = (PhysX.SupportFunctions.prototype as any)
            .PxScene_getActiveActors(resources.physics.scene) as PhysXT.PxArray_PxActorPtr

        for (let i = 0; i < activeActors.size(); i++) {
            let entityUid = resources.physics.rigidBodyPtrToEntityUid.get((activeActors.get(i) as any).ptr)!
            let entityComponents = system.entities.get(entityUid)!

            let shapeComponent = entityComponents!.components[Comps.ComponentTypes.Shape][0] as Comps.Shape
            let rigidBodyComponent = entityComponents!.components[Comps.ComponentTypes.RigidBody][0] as Comps.RigidBody
            let body = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            let transform = body.getGlobalPose();

            let rigidBodyPosition = transform.p
            let rigidBodyQuaternion = transform.q

            if (shapeComponent!.shapeType == Comps.ShapeTypes.Compound) {
                let shapesEntityUid = shapeComponent.shapesEntityUid
                for (let eUid of shapesEntityUid) {
                    let childEntityComponents = system.entities.get(eUid)!

                    let childRotationComponent = childEntityComponents.components[Comps.ComponentTypes.Rotation][0] as Comps.Rotation
                    let childShapeComponent = childEntityComponents.components[Comps.ComponentTypes.Shape][0] as Comps.Shape
                    let childPositionComponent = childEntityComponents.components[Comps.ComponentTypes.Position][0] as Comps.Position
                    //resources.cameraViewEntities.updateEntity(childPositionComponent)

                    let shapeTransform = (PhysX.PxShapeExt.prototype as any)
                        .getGlobalPose(childShapeComponent.shape, body) as PhysXT.PxTransform;

                    let shapePosition = shapeTransform.p
                    let shapeRotation = shapeTransform.q

                    childPositionComponent.x = shapePosition.x;
                    childPositionComponent.y = shapePosition.y;
                    childPositionComponent.z = shapePosition.z;

                    childRotationComponent.x = shapeRotation.x;
                    childRotationComponent.y = shapeRotation.y;
                    childRotationComponent.z = shapeRotation.z;
                    childRotationComponent.w = shapeRotation.w;

                }
            }
            else {
                let positionComponent = entityComponents.components[Comps.ComponentTypes.Position][0] as Comps.Position
                let rotationComponent = entityComponents.components[Comps.ComponentTypes.Rotation][0] as Comps.Rotation
                //resources.cameraViewEntities.updateEntity(positionComponent)

                if (
                    rigidBodyPosition.x != positionComponent.x ||
                    rigidBodyPosition.y != positionComponent.y ||
                    rigidBodyPosition.z != positionComponent.z
                ) {
                    positionComponent.x = rigidBodyPosition.x
                    positionComponent.y = rigidBodyPosition.y
                    positionComponent.z = rigidBodyPosition.z
                }
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

                let linearVelocityComponent = entityComponents.components[Comps.ComponentTypes.LinearVelocity][0] as Comps.LinearVelocity
                if (linearVelocityComponent != undefined) {
                    let rigidBodyLinearVelocity = body.getLinearVelocity()
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

                let angularVelocityComponent = entityComponents.components[Comps.ComponentTypes.AngularVelocity][0] as Comps.AngularVelocity
                if (angularVelocityComponent != undefined) {
                    let rigidBodyAngularVelocity = body.getAngularVelocity()
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
}
