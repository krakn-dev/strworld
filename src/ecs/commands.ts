import * as ECS from "./ecs"
import * as Res from "./resources"
import * as Utils from "../utils"
import * as Comps from "./components"
import * as Ser from "../serialization"
import * as CANNON from 'cannon-es'
import * as Fn from "./functions"
import * as esprima from "esprima"

// order in which they get executed
export enum CommandTypes {
    TheFirst = 0,
    RunCode,
    CreateStickman,
    MovePlayer,
    MoveGeometry,
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
    SendGraphicComponentsToRender,
    SyncRigidbody,
    CameraFollowGeometry,
}

export function getInstanceFromEnum(commandEnum: CommandTypes): ECS.Command {
    switch (commandEnum) {
        case CommandTypes.TheFirst:
            return new TheFirst()

        //        case Commands.MoveCameraWithPlayer:
        //            return new MoveCameraWithPlayer()
        //
        case CommandTypes.RunCode:
            return new RunCode()
        case CommandTypes.MoveGeometry:
            return new MoveGeometry()
        case CommandTypes.SyncRigidbody:
            return new SyncRigidBody()
        case CommandTypes.CameraFollowGeometry:
            return new CameraFollowGeometry()
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
        system.addCommand(CommandTypes.RunCode)
        system.addCommand(CommandTypes.SyncRigidbody)

        system.removeCommand(CommandTypes.TheFirst)
    }
}
export class RunCode implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.RunCode
    }

    run(system: ECS.System, resources: Res.Resources) {

        resources.physics.world.fixedStep()
        //if (resources.input.code == undefined) {
        //    return
        //}
        //return
        //try {
        //    let f = new Function()
        //    //            f()
        //}
        //catch (e: any) {
        //            let line = e.stack.split("\n").find((e:any) => e.includes("<anonymous>:") || e.includes("Function:"));
        //            let lineIndex = (line.includes("<anonymous>:") && line.indexOf("<anonymous>:") + "<anonymous>:".length) ||  (line.includes("Function:") && line.indexOf("Function:") + "Function:".length);
        //            console.log(+line.substring(lineIndex, lineIndex + 1) - 2);
        //            if (e instanceof SyntaxError) {
        //                console.log(":( syntax error")
        //            }
        //            else if (e instanceof ReferenceError) {
        //                console.log(":( reference error")
        //            }
        //console.log(e)
        //            console.log((e as any).lineNumber)
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
                45,
                0.1,
                500,
                resources.domState.windowWidth! / resources.domState.windowHeight!,
                camera)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, 0, 0), camera)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(-45, 0, 0), camera)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Camera, camera)
            system.addComponent(cameraComponent)
            system.addComponent(rotationComponent)
            system.addComponent(positionComponent)
            system.addComponent(entityTypeComponent)
            system.addCommand(CommandTypes.CameraFollowGeometry)
        }
        {
            let pointLight = Utils.newUid()
            let lightComponent = new Comps.Light(Comps.LightTypes.PointLight, 50, 0xffffff, 10, 0, pointLight)
            let positionComponent = new Comps.Position(new Utils.Vector3(3, 8, 3), pointLight)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Light, pointLight)
            system.addComponent(lightComponent)
            system.addComponent(positionComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let ambientLight = Utils.newUid()
            let lightComponent = new Comps.Light(Comps.LightTypes.AmbientLight, 1, 0xffffff, 0, 0, ambientLight)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Light, ambientLight)
            system.addComponent(lightComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let plane = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(plane)
            let shapeComponent = new Comps.Shape(new Utils.Vector3(8, 0.2, 8), Comps.ShapeTypes.Box, plane)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, 0, 0), plane)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), plane)
            let massComponent = new Comps.Mass(0, plane)
            let shapeColorComponent = new Comps.ShapeColor(0x88ffcc, plane)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, plane)

            system.addComponent(shapeComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(positionComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)
        }
        let staticCube;
        {
            staticCube = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(staticCube)
            let shapeComponent = new Comps.Shape(new Utils.Vector3(1, 1, 1), Comps.ShapeTypes.Box, staticCube)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, 3, 2), staticCube)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 45, 0), staticCube)
            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), staticCube)
            let velocityComponent = new Comps.Velocity(new Utils.Vector3(0, 0, 0), staticCube)
            let massComponent = new Comps.Mass(1, staticCube)
            let shapeColorComponent = new Comps.ShapeColor(0xffaadd, staticCube)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, staticCube)

            system.addComponent(rigidBodyComponent)
            system.addComponent(velocityComponent)
            system.addComponent(forceComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)

        }
        {
            let movingCube = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(movingCube)
            let shapeComponent = new Comps.Shape(new Utils.Vector3(1, 1, 1), Comps.ShapeTypes.Box, movingCube)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, 3, 0), movingCube)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), movingCube)
            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), movingCube)
            let velocityComponent = new Comps.Velocity(new Utils.Vector3(0, 0, 0), movingCube)
            let massComponent = new Comps.Mass(1, movingCube)
            let shapeColorComponent = new Comps.ShapeColor(0xffaadd, movingCube)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, movingCube)
            let hardCodedIdComponent = new Comps.HardCodedId(0, movingCube)
            let constraintComponent = new Comps.Constraint(staticCube, Comps.ConstraintTypes.Distance, 3, movingCube)

            system.addComponent(constraintComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(velocityComponent)
            system.addComponent(forceComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(shapeComponent)
            system.addComponent(hardCodedIdComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)

            system.addCommand(CommandTypes.MoveGeometry)
        }
        system.removeCommand(CommandTypes.CreateScene)
    }
}
export class MoveGeometry implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.MoveGeometry
    }

    run(system: ECS.System, resources: Res.Resources) {
        let acceleration = 0.1
        let velocityLimit = 3
        // get playerUid
        let foundHardCodedIdComponent = system.find([ECS.Get.All, [Comps.ComponentTypes.HardCodedId], ECS.By.Any, null])
        if (foundHardCodedIdComponent[0].length == 0) {
            console.log("no hardcodedid found")
            return
        }
        let geometryUid = (foundHardCodedIdComponent[0][0] as Comps.HardCodedId).entityUid

        let foundForceAndVelocityComponent = system.find(
            [
                ECS.Get.One,
                [
                    Comps.ComponentTypes.Force,
                    Comps.ComponentTypes.Velocity
                ],
                ECS.By.EntityUid,
                geometryUid
            ])
        if (foundForceAndVelocityComponent[0].length == 0 || foundForceAndVelocityComponent[1].length == 0) {
            console.log("no geometry components found")
            return
        }
        let forceComponent = foundForceAndVelocityComponent[0][0] as Comps.Force
        let velocityComponent = foundForceAndVelocityComponent[1][0] as Comps.Velocity

        let newForce = new Utils.Vector3(0, 0, 0)
        newForce.x = forceComponent.x + resources.input.movementDirection.x * acceleration
        newForce.z = forceComponent.z + (-resources.input.movementDirection.y) * acceleration
        if (Math.abs(velocityComponent.x) > velocityLimit) {
            newForce.x = 0
        }
        if (Math.abs(velocityComponent.z) > velocityLimit) {
            newForce.z = 0
        }

        if (resources.input.movementDirection.x != 0) {
            forceComponent.x = newForce.x
        }
        if (resources.input.movementDirection.y != 0) {
            forceComponent.z = newForce.z
        }
    }
}
// create entity
//export class CreateDog implements ECS.Command {
//    readonly type: Commands
//    constructor() {
//        this.type = Commands.CreateDog
//    }
//
//    run(system: ECS.System) {
//        for (let x = 0; x < 5; x++) {
//            let dog = Utils.newUid()
//            let positionComponent = new Comps.Position(new Utils.Vector3(50 * x + 100, 0, 0), dog)
//            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), dog)
//            let massComponent = new Comps.Mass(2, dog)
//            let sizeComponent = new Comps.Size(new Utils.Vector3(40, 90, 30), dog)
//            let entityStateComponent = new Comps.EntityState(new Map([[Comps.EntityStates.Idle, null]]), dog)
//            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Dog, dog)
//            let healthComponent = new Comps.Health(10, dog)
//            let animationComponent = new Comps.Animation([new Anims.PlayerIdle(), new Anims.PlayerRunning()], dog)
//            let computedElement = new Comps.GraphicProperties(Comps.ElementTypes.Entity, dog)
//            computedElement.translateX = positionComponent.x
//            computedElement.translateY = positionComponent.y
//            computedElement.zIndex = positionComponent.y
//            computedElement.color = "#ff0000"
//
//            system.addComponent(massComponent)
//            system.addComponent(sizeComponent)
//            system.addComponent(forceComponent)
//            system.addComponent(healthComponent)
//            system.addComponent(animationComponent)
//            system.addComponent(positionComponent)
//            system.addComponent(entityStateComponent)
//
//            system.addComponent(computedElement)
//            system.addComponent(entityTypeComponent)
//        }
//
//        system.addCommand(Commands.MoveDog)
//        system.removeCommand(Commands.CreateDog)
//    }
//}
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
                let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), stickman)
                let massComponent = new Comps.Mass(4, stickman)
                let shapeComponent = new Comps.Shape(new Utils.Vector3(40, 90, 30), Comps.ShapeTypes.Box, stickman)

                system.addComponent(massComponent)
                system.addComponent(shapeComponent)
                system.addComponent(forceComponent)
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
        let acceleration = 0.003
        let forceLimit = 0.02
        // get playerUid
        let foundEntityTypeComponents = system.find([ECS.Get.All, [Comps.ComponentTypes.EntityType], ECS.By.Any, null])
        if (foundEntityTypeComponents[0].length == 0) {
            console.log("no entity types found")
            return
        }
        let playerUid: number | null = null
        for (let fC of foundEntityTypeComponents[0]) {
            let entityTypeComponent = fC as Comps.EntityType
            if (entityTypeComponent.entityType == Comps.EntityTypes.Stickman) {
                playerUid = entityTypeComponent.entityUid
            }
        }
        if (playerUid == null)
            return

        // if was found, move it
        if (resources.input.movementDirection.x == 0 &&
            resources.input.movementDirection.y == 0
        ) {
            let foundEntityState = system.find(
                [
                    ECS.Get.All,
                    [
                        Comps.ComponentTypes.EntityState,
                    ],
                    ECS.By.EntityUid,
                    foundEntityTypeComponents[0][0].entityUid
                ]
            )
            if (foundEntityState[0].length == 0) {
                console.log("entityState not found")
                return
            }

            for (let fC of foundEntityState[0]) {
                let entityStateComponent = fC as Comps.EntityState

                if (entityStateComponent.entityUid == playerUid) {
                    // cannot change state to idle if wasnt runnning
                    let indexOfRun = entityStateComponent.states.indexOf(Comps.EntityStates.Run)
                    if (indexOfRun != -1) {
                        entityStateComponent.states.splice(indexOfRun, 1)

                        if (entityStateComponent.states.includes(Comps.EntityStates.Idle)) return
                        entityStateComponent.states.push(Comps.EntityStates.Idle)
                    }
                    return
                }
            }
        }

        let foundForceComponent = system.find([ECS.Get.One, [Comps.ComponentTypes.Force], ECS.By.EntityUid, playerUid])
        if (foundForceComponent[0].length == 0) {
            console.log("no player force found found")
            return
        }
        let forceComponent = foundForceComponent[0][0] as Comps.Force
        let newForce = new Utils.Vector3(0, 0, 0)
        newForce.x = forceComponent.x + resources.input.movementDirection.x * acceleration
        newForce.z = forceComponent.z + (-resources.input.movementDirection.y) * acceleration

        if (Math.abs(newForce.x) > forceLimit) {
            newForce.x = forceLimit * (newForce.x < 0 ? -1 : 1)
        }
        if (Math.abs(newForce.z) > forceLimit) {
            newForce.z = forceLimit * (newForce.z < 0 ? -1 : 1)
        }

        let foundEntityState = system.find(
            [ECS.Get.One, [Comps.ComponentTypes.EntityState], ECS.By.EntityUid, playerUid])

        if (foundEntityState[0].length == 0) {
            console.log("player entityState not found")
            return
        }
        let entityStateComponent = foundEntityState[0][0] as Comps.EntityState

        if (!entityStateComponent.states.includes(Comps.EntityStates.Run)) {
            entityStateComponent.states.push(Comps.EntityStates.Run)
        }
        let indexOfIdle = entityStateComponent.states.indexOf(Comps.EntityStates.Idle)
        if (indexOfIdle != -1) {
            entityStateComponent.states.splice(indexOfIdle, 1)
        }

        if (resources.input.movementDirection.x != 0) {
            forceComponent.x = newForce.x
        }
        if (resources.input.movementDirection.y != 0) {
            forceComponent.z = newForce.z
        }
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
        // for changed
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

        // for added
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.EntityType])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Camera])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Light])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Position])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.EntityState])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Rotation])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.Shape])
        graphicChanges.changedComponents.push(
            ...resources.componentChanges.addedComponents[Comps.ComponentTypes.ShapeColor])


        // check for removed entities
        for (let rC of resources.componentChanges.removedComponents[Comps.ComponentTypes.EntityType]) {
            graphicChanges.removedEntitiesUid.push(rC.entityUid)
        }

        // check for added entities
        for (let rC of resources.componentChanges.addedComponents[Comps.ComponentTypes.EntityType]) {
            graphicChanges.addedEntitiesUid.push(rC.entityUid)
        }

        if (graphicChanges.changedComponents.length == 0 &&
            graphicChanges.removedEntitiesUid.length == 0
        ) {
            return
        }
        postMessage(new Ser.Message(Ser.Messages.GraphicChanges, graphicChanges))
    }
}
export class SyncRigidBody implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.SyncRigidbody
    }

    run(system: ECS.System, resources: Res.Resources) {
        ///////////// update body
        // for new
        for (let aRB of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            let addedRigidBody = aRB as Comps.RigidBody
            let isMassSet = false
            let isShapeSet = false
            let isPositionSet = false
            let isRotationSet = false

            for (let aMC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Mass]) {
                if (aMC.entityUid != addedRigidBody.entityUid) continue
                let addedMassComponent = aMC as Comps.Mass
                addedRigidBody.body.mass = addedMassComponent.mass
                addedRigidBody.body.updateMassProperties()
                isMassSet = true
            }
            //            for (let aCC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Constraint]) {
            //                if (aCC.entityUid != addedRigidBody.entityUid) continue
            //                let addedConstraintComponent = aCC as Comps.Constraint
            //                switch (addedConstraintComponent.constraintType) {
            //                    case Comps.ConstraintTypes.PointToPoint: {
            //                        console.log("point to point constraint not implemented")
            //                    } break;
            //                    case Comps.ConstraintTypes.Lock: {
            //                        console.log("lock constraint not implemented")
            //                    } break;
            //                    case Comps.ConstraintTypes.Distance: {
            //                        let foundRigidBody = system.find([
            //                            ECS.Get.One,
            //                            [Comps.ComponentTypes.RigidBody],
            //                            ECS.By.EntityUid,
            //                            addedConstraintComponent.entityUidConstrainedTo
            //                        ])
            //                        let constrainedBody: CANNON.Body | undefined = undefined
            //                        if (foundRigidBody[0].length == 0) {
            //                            for (let aCC2 of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            //                                if (aCC2.entityUid != addedConstraintComponent.entityUidConstrainedTo) continue
            //                                let constrainedRigidBodyComponent = aCC2 as Comps.RigidBody
            //                                constrainedBody = constrainedRigidBodyComponent.body
            //                            }
            //                        } else {
            //                            constrainedBody = (foundRigidBody[0][0] as Comps.RigidBody).body
            //                        }
            //                        if (constrainedBody == undefined) {
            //                            console.log("constrained body wasn't found")
            //                        } else {
            //                            let constraint = new CANNON.DistanceConstraint(addedRigidBody.body, constrainedBody, addedConstraintComponent.distance)
            //                            resources.physics.world.addConstraint(constraint)
            //                        }
            //                    } break;
            //                }
            //}
            for (let aVC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Velocity]) {
                if (aVC.entityUid != addedRigidBody.entityUid) continue
                let addedVelocityComponent = aVC as Comps.Velocity
                let newVelocity = new CANNON.Vec3(
                    addedVelocityComponent.x,
                    addedVelocityComponent.y,
                    addedVelocityComponent.z)

                addedRigidBody.body.velocity = newVelocity
            }
            for (let aFC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Force]) {
                if (aFC.entityUid != addedRigidBody.entityUid) continue
                let addedForceComponent = aFC as Comps.Force
                let force = new CANNON.Vec3(addedForceComponent.x, addedForceComponent.y, addedForceComponent.z)
                addedRigidBody.body.force = force
            }
            for (let aSC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Shape]) {
                if (aSC.entityUid != addedRigidBody.entityUid) continue
                let addedShapeComponent = aSC as Comps.Shape
                let size = new CANNON.Vec3(
                    addedShapeComponent.size.x / 2,
                    addedShapeComponent.size.y / 2,
                    addedShapeComponent.size.z / 2)
                let shape: CANNON.Shape
                switch (addedShapeComponent.shapeType) {
                    case (Comps.ShapeTypes.Box): {
                        shape = new CANNON.Box(size)
                    } break;
                }
                addedRigidBody.body.addShape(shape)
                isShapeSet = true
            }
            for (let aPC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Position]) {
                if (aPC.entityUid != addedRigidBody.entityUid) continue
                let addedPositionComponent = aPC as Comps.Position
                addedRigidBody.body.position.set(addedPositionComponent.x, addedPositionComponent.y, addedPositionComponent.z,)
                isPositionSet = true
            }
            for (let rPC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Rotation]) {
                if (rPC.entityUid != addedRigidBody.entityUid) continue
                let addedRotationComponent = rPC as Comps.Rotation
                let rotation = new CANNON.Quaternion(addedRotationComponent.x, addedRotationComponent.y, addedRotationComponent.z, addedRotationComponent.w)
                addedRigidBody.body.quaternion = rotation
                isRotationSet = true
            }
            if (isShapeSet && isMassSet && isPositionSet && isRotationSet) {
                resources.physics.world.addBody(addedRigidBody.body)
            } else {
                console.log("not enough components for rigidbody")
            }
        }
        // added constraints
        for (let aCC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Constraint]) {
            let foundRigidBodyA = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aCC.entityUid
            ])
            if (foundRigidBodyA[0].length == 0) {
                console.log("entity does not have rigidbody")
                continue
            }
            let addedConstraintComponent = aCC as Comps.Constraint
            let rigidBodyComponentA = foundRigidBodyA[0][0] as Comps.RigidBody

            switch (addedConstraintComponent.constraintType) {
                case Comps.ConstraintTypes.PointToPoint: {
                    console.log("point to point constraint not implemented")
                } break;
                case Comps.ConstraintTypes.Lock: {
                    console.log("lock constraint not implemented")
                } break;
                case Comps.ConstraintTypes.Distance: {
                    let foundRigidBodyB = system.find([
                        ECS.Get.One,
                        [Comps.ComponentTypes.RigidBody],
                        ECS.By.EntityUid,
                        addedConstraintComponent.entityUidConstrainedTo
                    ])
                    let bodyB: CANNON.Body | undefined = undefined
                    if (foundRigidBodyB[0].length == 0) {
                        for (let aRBB of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
                            if (aRBB.entityUid != addedConstraintComponent.entityUidConstrainedTo) continue
                            let rigidBodyComponentB = aRBB as Comps.RigidBody
                            bodyB = rigidBodyComponentB.body
                        }
                    } else {
                        bodyB = (foundRigidBodyB[0][0] as Comps.RigidBody).body
                    }
                    if (bodyB == undefined) {
                        console.log("constrained body wasn't found")
                    } else {
                        let constraint = new CANNON.DistanceConstraint(rigidBodyComponentA.body, bodyB, addedConstraintComponent.distance)
                        resources.physics.world.addConstraint(constraint)
                    }
                } break;
            }
        }

        //for changed
        let foundRigidBodyComponents = system.find([ECS.Get.All, [Comps.ComponentTypes.RigidBody], ECS.By.Any, null])
        for (let cMC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Mass]) {
            let changedMassComponent = cMC as Comps.Mass
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedMassComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                rigidBodyComponent.body.mass = changedMassComponent.mass
            }
        }
        for (let cFC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Force]) {
            let changedForceComponent = cFC as Comps.Force
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedForceComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                rigidBodyComponent.body.applyForce(
                    new CANNON.Vec3(
                        changedForceComponent.x,
                        changedForceComponent.y,
                        changedForceComponent.z))
            }
        }
        for (let cPC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Position]) {
            let changedPositionComponent = cPC as Comps.Position
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedPositionComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                rigidBodyComponent.body.position = new CANNON.Vec3(
                    changedPositionComponent.x,
                    changedPositionComponent.y,
                    changedPositionComponent.z)
            }
        }
        for (let cRC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Rotation]) {
            let changedRotationComponent = cRC as Comps.Rotation
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedRotationComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                rigidBodyComponent.body.quaternion = new CANNON.Quaternion(
                    changedRotationComponent.x,
                    changedRotationComponent.y,
                    changedRotationComponent.z,
                    changedRotationComponent.w)
            }
        }
        for (let cVC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Velocity]) {
            let changedVelocityComponent = cVC as Comps.Velocity
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedVelocityComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                let newVelocity = new CANNON.Vec3(
                    changedVelocityComponent.x,
                    changedVelocityComponent.y,
                    changedVelocityComponent.z)

                rigidBodyComponent.body.velocity = newVelocity
            }
        }
        for (let cSC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            let changedShapeComponent = cSC as Comps.Shape
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedShapeComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                let position = rigidBodyComponent.body.position
                let rotation = rigidBodyComponent.body.quaternion
                let velocity = rigidBodyComponent.body.velocity

                let size = new CANNON.Vec3(
                    changedShapeComponent.size.x / 2,
                    changedShapeComponent.size.y / 2,
                    changedShapeComponent.size.z / 2)
                let shape: CANNON.Shape
                switch (changedShapeComponent.shapeType) {
                    case (Comps.ShapeTypes.Box): {
                        shape = new CANNON.Box(size)
                    } break;
                }
                let newBody = new CANNON.Body({
                    velocity: velocity,
                    position: position,
                    quaternion: rotation,
                    shape: shape
                })
                rigidBodyComponent.body = newBody
            }
        }
        ///////////// update components
        let foundComponents = system.find(
            [
                ECS.Get.All,
                [
                    Comps.ComponentTypes.Position,
                    Comps.ComponentTypes.Rotation,
                    Comps.ComponentTypes.Force,
                    Comps.ComponentTypes.Velocity
                ], ECS.By.Any, null
            ])
        for (let rBC of foundRigidBodyComponents[0]) {
            let rigidBodyComponent = rBC as Comps.RigidBody

            for (let pC of foundComponents[0]) {
                if (pC.entityUid != rigidBodyComponent.entityUid) continue
                let positionComponent = pC as Comps.Position
                if (
                    rigidBodyComponent.body.position.x != positionComponent.x ||
                    rigidBodyComponent.body.position.y != positionComponent.y ||
                    rigidBodyComponent.body.position.z != positionComponent.z
                ) {
                    positionComponent.x = rigidBodyComponent.body.position.x
                    positionComponent.y = rigidBodyComponent.body.position.y
                    positionComponent.z = rigidBodyComponent.body.position.z
                }
            }
            for (let rC of foundComponents[1]) {
                if (rC.entityUid != rigidBodyComponent.entityUid) continue
                let rotationComponent = rC as Comps.Rotation
                if (
                    rotationComponent.x != rigidBodyComponent.body.quaternion.x ||
                    rotationComponent.y != rigidBodyComponent.body.quaternion.y ||
                    rotationComponent.z != rigidBodyComponent.body.quaternion.z ||
                    rotationComponent.w != rigidBodyComponent.body.quaternion.w
                ) {
                    rotationComponent.x = rigidBodyComponent.body.quaternion.x
                    rotationComponent.y = rigidBodyComponent.body.quaternion.y
                    rotationComponent.z = rigidBodyComponent.body.quaternion.z
                    rotationComponent.w = rigidBodyComponent.body.quaternion.w
                }

            }
            for (let fC of foundComponents[2]) {
                if (fC.entityUid != rigidBodyComponent.entityUid) continue
                let forceComponent = fC as Comps.Force
                if (
                    forceComponent.x != rigidBodyComponent.body.force.x ||
                    forceComponent.y != rigidBodyComponent.body.force.y ||
                    forceComponent.z != rigidBodyComponent.body.force.z
                ) {
                    forceComponent.x = rigidBodyComponent.body.force.x
                    forceComponent.y = rigidBodyComponent.body.force.y
                    forceComponent.z = rigidBodyComponent.body.force.z
                }
            }
            for (let vC of foundComponents[3]) {
                if (vC.entityUid != rigidBodyComponent.entityUid) continue
                let velocityComponent = vC as Comps.Velocity
                if (
                    rigidBodyComponent.body.velocity.x != velocityComponent.x ||
                    rigidBodyComponent.body.velocity.y != velocityComponent.y ||
                    rigidBodyComponent.body.velocity.z != velocityComponent.z
                ) {
                    velocityComponent.x = rigidBodyComponent.body.velocity.x
                    velocityComponent.y = rigidBodyComponent.body.velocity.y
                    velocityComponent.z = rigidBodyComponent.body.velocity.z
                }
            }
        }
    }
}
