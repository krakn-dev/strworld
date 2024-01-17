import * as ECS from "./ecs"
import * as Res from "./resources"
import * as Utils from "../utils"
import * as Comps from "./components"
import * as Ser from "../serialization"
import * as CANNON from 'cannon-es'
import * as Fn from "./functions"
import { Vector3 } from "three"

// order in which they get executed
export enum CommandTypes {
    TheFirst = 0,
    CreateStickman,
    MovePlayer,
    MoveGeometry,
    TorqueWheels,
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
        case CommandTypes.RunCode:
            return new RunCode()
        case CommandTypes.MoveGeometry:
            return new MoveGeometry()
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
        system.addCommand(CommandTypes.RunCode)
        system.addCommand(CommandTypes.SyncPhysics)

        system.removeCommand(CommandTypes.TheFirst)
    }
}
export class RunCode implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.RunCode
    }

    run(system: ECS.System, resources: Res.Resources) {

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
            let lightComponent = new Comps.Light(Comps.LightTypes.AmbientLight, 0.5, 0xffffff, 0, 0, ambientLight)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Light, ambientLight)
            system.addComponent(lightComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let plane = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Static, plane)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, plane)
            shapeComponent.size = new Utils.Vector3(25, 0.2, 80)
            let positionComponent = new Comps.Position(new Utils.Vector3(0, -3, 0), plane)
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
        {
            let obstacle = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, obstacle)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, obstacle)
            shapeComponent.size = new Utils.Vector3(1, 2, 1)
            //shapeComponent.height = 1
            //shapeComponent.numberOfSegments = 10
            //shapeComponent.radiusBottom = 1
            //shapeComponent.radiusTop = 1
            let positionComponent = new Comps.Position(new Utils.Vector3(3, 0, 2), obstacle)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), obstacle)
            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), obstacle)
            let velocityComponent = new Comps.Velocity(new Utils.Vector3(0, 0, 0), obstacle)
            let massComponent = new Comps.Mass(1, obstacle)
            let shapeColorComponent = new Comps.ShapeColor(0xffffff, obstacle)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, obstacle)

            system.addComponent(velocityComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(forceComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let obstacle = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, obstacle)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, obstacle)
            shapeComponent.size = new Utils.Vector3(1, 2, 1)
            //shapeComponent.height = 1
            //shapeComponent.numberOfSegments = 10
            //shapeComponent.radiusBottom = 1
            //shapeComponent.radiusTop = 1
            let positionComponent = new Comps.Position(new Utils.Vector3(5, 0, -5), obstacle)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), obstacle)
            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), obstacle)
            let velocityComponent = new Comps.Velocity(new Utils.Vector3(0, 0, 0), obstacle)
            let massComponent = new Comps.Mass(1, obstacle)
            let shapeColorComponent = new Comps.ShapeColor(0xffffff, obstacle)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, obstacle)

            system.addComponent(velocityComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(forceComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let obstacle = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, obstacle)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, obstacle)
            shapeComponent.size = new Utils.Vector3(1, 2, 1)
            //shapeComponent.height = 1
            //shapeComponent.numberOfSegments = 10
            //shapeComponent.radiusBottom = 1
            //shapeComponent.radiusTop = 1
            let positionComponent = new Comps.Position(new Utils.Vector3(-3, 0, -8), obstacle)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 90, 0), obstacle)
            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), obstacle)
            let velocityComponent = new Comps.Velocity(new Utils.Vector3(0, 0, 0), obstacle)
            let massComponent = new Comps.Mass(1, obstacle)
            let shapeColorComponent = new Comps.ShapeColor(0xffffff, obstacle)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, obstacle)

            system.addComponent(velocityComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(forceComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)
        }
        {
            let obstacle = Utils.newUid()
            let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, obstacle)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, obstacle)
            shapeComponent.size = new Utils.Vector3(1, 2, 1)
            //shapeComponent.height = 1
            //shapeComponent.numberOfSegments = 10
            //shapeComponent.radiusBottom = 1
            //shapeComponent.radiusTop = 1
            let positionComponent = new Comps.Position(new Utils.Vector3(-3, 0, 8), obstacle)
            let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), obstacle)
            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), obstacle)
            let velocityComponent = new Comps.Velocity(new Utils.Vector3(0, 0, 0), obstacle)
            let massComponent = new Comps.Mass(1, obstacle)
            let shapeColorComponent = new Comps.ShapeColor(0xffffff, obstacle)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, obstacle)

            system.addComponent(velocityComponent)
            system.addComponent(rigidBodyComponent)
            system.addComponent(forceComponent)
            system.addComponent(positionComponent)
            system.addComponent(rotationComponent)
            system.addComponent(massComponent)
            system.addComponent(shapeComponent)
            system.addComponent(shapeColorComponent)
            system.addComponent(entityTypeComponent)
        }
        {

            let robot = Utils.newUid()
            {
                let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, robot)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, robot)
                shapeComponent.size = new Utils.Vector3(2, 0.5, 1)
                //shapeComponent.height = 1
                //shapeComponent.numberOfSegments = 10
                //shapeComponent.radiusBottom = 1
                //shapeComponent.radiusTop = 1
                let positionComponent = new Comps.Position(new Utils.Vector3(0, 0, 0), robot)
                let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), robot)
                let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), robot)
                let velocityComponent = new Comps.Velocity(new Utils.Vector3(0, 0, 0), robot)
                let massComponent = new Comps.Mass(1, robot)
                let shapeColorComponent = new Comps.ShapeColor(0x95298d, robot)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, robot)
                let hardCodedIdComponent = new Comps.HardCodedId(0, robot)
                let vehicleComponent = new Comps.Vehicle(rigidBodyComponent.body, robot)

                system.addComponent(vehicleComponent)
                system.addComponent(velocityComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(forceComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(massComponent)
                system.addComponent(shapeComponent)
                system.addComponent(hardCodedIdComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            {
                let wheel = Utils.newUid()

                let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, wheel)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Cylinder, wheel)
                shapeComponent.height = 0.5
                shapeComponent.numberOfSegments = 6
                shapeComponent.radiusBottom = 0.5
                shapeComponent.radiusTop = 0.5
                let positionComponent = new Comps.Position(new Utils.Vector3(1, 0, -1), wheel)
                let massComponent = new Comps.Mass(1, wheel)
                let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), wheel)
                let shapeColorComponent = new Comps.ShapeColor(0x229ac4, wheel)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, wheel)
                let contraintComponent = new Comps.Constraint(wheel, Comps.ConstraintTypes.Hinge, robot)

                contraintComponent.pivotA = new Utils.Vector3(1, 0, -1)
                contraintComponent.pivotB = new Utils.Vector3(0, 0, 0)
                contraintComponent.axisA = new Utils.Vector3(0, 0, 1)
                contraintComponent.axisB = new Utils.Vector3(0, 1, 0)

                system.addComponent(contraintComponent)
                system.addComponent(massComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(shapeComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            {
                let wheel = Utils.newUid()

                let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, wheel)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Cylinder, wheel)
                shapeComponent.height = 0.5
                shapeComponent.numberOfSegments = 6
                shapeComponent.radiusBottom = 0.5
                shapeComponent.radiusTop = 0.5
                let positionComponent = new Comps.Position(new Utils.Vector3(-1, 0, 1), wheel)
                let massComponent = new Comps.Mass(1, wheel)
                let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), wheel)
                let shapeColorComponent = new Comps.ShapeColor(0x229ac4, wheel)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, wheel)
                let contraintComponent = new Comps.Constraint(wheel, Comps.ConstraintTypes.Hinge, robot)

                contraintComponent.pivotA = new Utils.Vector3(-1, 0, 1)
                contraintComponent.pivotB = new Utils.Vector3(0, 0, 0)
                contraintComponent.axisA = new Utils.Vector3(0, 0, 1)
                contraintComponent.axisB = new Utils.Vector3(0, 1, 0)

                system.addComponent(contraintComponent)
                system.addComponent(massComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(shapeComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            {
                let wheel = Utils.newUid()

                let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, wheel)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Cylinder, wheel)
                shapeComponent.height = 0.5
                shapeComponent.numberOfSegments = 6
                shapeComponent.radiusBottom = 0.5
                shapeComponent.radiusTop = 0.5
                let positionComponent = new Comps.Position(new Utils.Vector3(-1, 0, -1), wheel)
                let massComponent = new Comps.Mass(1, wheel)
                let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), wheel)
                let shapeColorComponent = new Comps.ShapeColor(0x229ac4, wheel)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, wheel)
                let contraintComponent = new Comps.Constraint(wheel, Comps.ConstraintTypes.Hinge, robot)

                contraintComponent.pivotA = new Utils.Vector3(-1, 0, -1)
                contraintComponent.pivotB = new Utils.Vector3(0, 0, 0)
                contraintComponent.axisA = new Utils.Vector3(0, 0, -1)
                contraintComponent.axisB = new Utils.Vector3(0, 1, 0)

                system.addComponent(contraintComponent)
                system.addComponent(massComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(shapeComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            {
                let wheel = Utils.newUid()

                let rigidBodyComponent = new Comps.RigidBody(Comps.BodyTypes.Dynamic, wheel)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Cylinder, wheel)
                shapeComponent.height = 0.5
                shapeComponent.numberOfSegments = 6
                shapeComponent.radiusBottom = 0.5
                shapeComponent.radiusTop = 0.5
                let positionComponent = new Comps.Position(new Utils.Vector3(1, 0, 1), wheel)
                let massComponent = new Comps.Mass(1, wheel)
                let rotationComponent = new Comps.Rotation(new Utils.Vector3(0, 0, 0), wheel)
                let shapeColorComponent = new Comps.ShapeColor(0x229ac4, wheel)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.GeometricShape, wheel)
                let contraintComponent = new Comps.Constraint(wheel, Comps.ConstraintTypes.Hinge, robot)

                contraintComponent.pivotA = new Utils.Vector3(1, 0, 1)
                contraintComponent.pivotB = new Utils.Vector3(0, 0, 0)
                contraintComponent.axisA = new Utils.Vector3(0, 0, 1)
                contraintComponent.axisB = new Utils.Vector3(0, 1, 0)

                system.addComponent(contraintComponent)
                system.addComponent(massComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(shapeComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            system.addCommand(CommandTypes.MoveGeometry)
        }
        system.removeCommand(CommandTypes.CreateScene)
    }
}
export class TorqueWheels implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.TorqueWheels
    }

    run(system: ECS.System, resources: Res.Resources) {
    }
}
export class MoveGeometry implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.MoveGeometry
    }

    run(system: ECS.System, resources: Res.Resources) {
        let movementForce = 2
        let maxVelocity = 10

        // get playerUid
        let foundHardCodedIdComponent = system.find([ECS.Get.All, [Comps.ComponentTypes.HardCodedId], ECS.By.Any, null])
        if (foundHardCodedIdComponent[0].length == 0) {
            console.log("no hardcodedid found")
            return
        }
        let geometryUid = (foundHardCodedIdComponent[0][0] as Comps.HardCodedId).entityUid

        let foundComponents = system.find(
            [
                ECS.Get.One,
                [
                    Comps.ComponentTypes.Force,
                    Comps.ComponentTypes.Velocity
                ],
                ECS.By.EntityUid,
                geometryUid
            ])
        if (foundComponents[0].length == 0 || foundComponents[1].length == 0) {
            console.log("no geometry components found")
            return
        }
        let forceComponent = foundComponents[0][0] as Comps.Force
        let velocityComponent = foundComponents[1][0] as Comps.Velocity
        let forceToApply = new Utils.Vector3(0, 0, 0)

        if (
            Math.abs(velocityComponent.x) < maxVelocity ||
            (velocityComponent.x < 0 != resources.input.movementDirection.x < 0)
        ) {
            forceToApply.x = resources.input.movementDirection.x * movementForce
        }

        if (
            Math.abs(velocityComponent.z) < maxVelocity ||
            (velocityComponent.z < 0 != -resources.input.movementDirection.y < 0)
        ) {
            forceToApply.z = -resources.input.movementDirection.y * movementForce
        }

        if (forceToApply.x != 0) {
            forceComponent.xToApply = forceToApply.x
        }
        if (forceToApply.z != 0) {
            forceComponent.zToApply = forceToApply.z
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
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, stickman)
                shapeComponent.size = new Utils.Vector3(40, 90, 30)

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
export class SyncPhysics implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.SyncPhysics
    }

    run(system: ECS.System, resources: Res.Resources) {
        resources.physics.world.fixedStep()

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      for added
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
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
                console.log("entity does not have rigidbody(mass)")
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let addedMassComponent = aMC as Comps.Mass
            rigidBodyComponent.body.mass = addedMassComponent.mass
            rigidBodyComponent.body.updateMassProperties()
        }
        /////////////////
        // added shape
        /////////////////
        for (let aSC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aSC.entityUid
            ])
            if (foundRigidBody[0].length == 0) {
                console.log("entity does not have rigidbody(shape)")
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let addedShapeComponent = aSC as Comps.Shape
            let shape: CANNON.Shape
            let isCylinder = false
            switch (addedShapeComponent.shapeType) {
                case (Comps.ShapeTypes.Box): {
                    let size = new CANNON.Vec3(
                        addedShapeComponent.size!.x / 2,
                        addedShapeComponent.size!.y / 2,
                        addedShapeComponent.size!.z / 2)
                    shape = new CANNON.Box(size)
                } break;
                case Comps.ShapeTypes.Cylinder: {
                    shape = new CANNON.Cylinder(
                        addedShapeComponent.radiusTop,
                        addedShapeComponent.radiusBottom,
                        addedShapeComponent.height,
                        addedShapeComponent.numberOfSegments,
                    )
                    isCylinder = true
                } break;

            }
            rigidBodyComponent.body.addShape(shape)
        }
        /////////////////
        // added rotation
        /////////////////
        for (let aRC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Rotation]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aRC.entityUid
            ])
            let rigidBodyComponent: Comps.RigidBody | undefined = undefined
            if (foundRigidBody[0].length != 0) {
                rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            } else {
                for (let aRBC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
                    if (aRBC.entityUid != aRC.entityUid) continue
                    rigidBodyComponent = aRBC as Comps.RigidBody
                }
            }
            if (rigidBodyComponent == undefined) {
                continue
            }
            let addedRotationComponent = aRC as Comps.Rotation
            let rotation = new CANNON.Quaternion(
                addedRotationComponent.x,
                addedRotationComponent.y,
                addedRotationComponent.z,
                addedRotationComponent.w)
            rigidBodyComponent.body.quaternion = rotation
        }
        /////////////////
        // added velocity
        /////////////////
        for (let aVC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Velocity]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aVC.entityUid
            ])
            if (foundRigidBody[0].length == 0) {
                console.log("entity does not have rigidbody(velocity)")
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let addedVelocityComponent = aVC as Comps.Velocity
            let newVelocity = new CANNON.Vec3(
                addedVelocityComponent.x,
                addedVelocityComponent.y,
                addedVelocityComponent.z)

            rigidBodyComponent.body.velocity = newVelocity
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
                console.log("entity does not have rigidbody(force)")
                continue
            }
            let rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            let addedForceComponent = aFC as Comps.Force
            let force = new CANNON.Vec3(addedForceComponent.x, addedForceComponent.y, addedForceComponent.z)
            rigidBodyComponent.body.force = force
        }
        /////////////////
        // added position
        /////////////////
        for (let aPC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Position]) {
            let foundRigidBody = system.find([
                ECS.Get.One,
                [Comps.ComponentTypes.RigidBody],
                ECS.By.EntityUid,
                aPC.entityUid
            ])

            let rigidBodyComponent: Comps.RigidBody | undefined = undefined
            if (foundRigidBody[0].length != 0) {
                rigidBodyComponent = foundRigidBody[0][0] as Comps.RigidBody
            } else {
                for (let aRBC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
                    if (aRBC.entityUid != aPC.entityUid) continue
                    rigidBodyComponent = aRBC as Comps.RigidBody
                }
            }
            if (rigidBodyComponent == undefined) {
                continue
            }

            let addedPositionComponent = aPC as Comps.Position
            rigidBodyComponent.body.position.set(addedPositionComponent.x, addedPositionComponent.y, addedPositionComponent.z,)
        }
        /////////////////
        // added rigidbody
        /////////////////
        for (let aRB of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            let rigidBodyComponent = aRB as Comps.RigidBody

            switch (rigidBodyComponent.bodyType) {
                case Comps.BodyTypes.Dynamic: {
                    rigidBodyComponent.body.type = CANNON.BODY_TYPES.DYNAMIC
                } break;
                case Comps.BodyTypes.Static: {
                    rigidBodyComponent.body.type = CANNON.BODY_TYPES.STATIC
                } break;
                case Comps.BodyTypes.Kinematic: {
                    rigidBodyComponent.body.type = CANNON.BODY_TYPES.KINEMATIC
                } break;
            }
            if (rigidBodyComponent.disableCollisions) {
                rigidBodyComponent.body.collisionFilterGroup = 0
            }
            resources.physics.world.addBody(rigidBodyComponent.body)
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
                console.log("entity does not have rigidbody (constraint)")
                continue
            }
            let addedConstraintComponent = aCC as Comps.Constraint
            let rigidBodyComponentA = foundRigidBodyA[0][0] as Comps.RigidBody

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
                continue
            }
            let constraint: CANNON.Constraint | undefined = undefined
            switch (addedConstraintComponent.constraintType) {
                case Comps.ConstraintTypes.Hinge: {
                    constraint = new CANNON.HingeConstraint(
                        rigidBodyComponentA.body, bodyB,
                        {
                            pivotA: Utils.toCannonVec3(addedConstraintComponent.pivotA!),
                            pivotB: Utils.toCannonVec3(addedConstraintComponent.pivotB!),
                            axisA: Utils.toCannonVec3(addedConstraintComponent.axisA!),
                            axisB: Utils.toCannonVec3(addedConstraintComponent.axisB!),
                        })
                } break;
                case Comps.ConstraintTypes.PointToPoint: {
                    console.log("point to point constraint not implemented")
                } break;
                case Comps.ConstraintTypes.Lock: {
                    console.log("lock constraint not implemented")
                } break;
                case Comps.ConstraintTypes.Distance: {
                    constraint = new CANNON.DistanceConstraint(
                        rigidBodyComponentA.body,
                        bodyB,
                        addedConstraintComponent.distance)
                } break;
            }
            if (constraint == undefined) continue
            resources.physics.world.addConstraint(constraint)
        }
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      for changed
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        let foundRigidBodyComponents = system.find([ECS.Get.All, [Comps.ComponentTypes.RigidBody], ECS.By.Any, null])

        /////////////////
        // changed rigidbody
        /////////////////
        for (let cRBC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            let changedRigidBodyComponent = cRBC as Comps.RigidBody

            switch (changedRigidBodyComponent.bodyType) {
                case Comps.BodyTypes.Dynamic: {
                    changedRigidBodyComponent.body.type = CANNON.BODY_TYPES.DYNAMIC
                } break;
                case Comps.BodyTypes.Static: {
                    changedRigidBodyComponent.body.type = CANNON.BODY_TYPES.STATIC
                } break;
                case Comps.BodyTypes.Kinematic: {
                    changedRigidBodyComponent.body.type = CANNON.BODY_TYPES.KINEMATIC
                } break;
            }
            if (changedRigidBodyComponent.disableCollisions) {
                changedRigidBodyComponent.body.collisionFilterGroup = 0
            } else {
                changedRigidBodyComponent.body.collisionFilterGroup = 1
            }
        }
        /////////////////
        // changed mass
        /////////////////
        for (let cMC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Mass]) {
            let changedMassComponent = cMC as Comps.Mass
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedMassComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                rigidBodyComponent.body.mass = changedMassComponent.mass
            }
        }
        /////////////////
        // changed force
        /////////////////
        for (let cFC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Force]) {
            let changedForceComponent = cFC as Comps.Force
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedForceComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                rigidBodyComponent.body.applyImpulse(
                    new CANNON.Vec3(
                        changedForceComponent.xToApply,
                        changedForceComponent.yToApply,
                        changedForceComponent.zToApply))
                changedForceComponent.xToApply = 0
                changedForceComponent.yToApply = 0
                changedForceComponent.zToApply = 0
            }
        }
        /////////////////
        // changed position
        /////////////////
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
        /////////////////
        // changed rotation
        /////////////////
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
        /////////////////
        // changed velocity
        /////////////////
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
        /////////////////
        // changed shape
        /////////////////
        for (let cSC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            let changedShapeComponent = cSC as Comps.Shape
            for (let rBC of foundRigidBodyComponents[0]) {
                if (rBC.entityUid != changedShapeComponent.entityUid) continue
                let rigidBodyComponent = rBC as Comps.RigidBody
                let position = rigidBodyComponent.body.position
                let rotation = rigidBodyComponent.body.quaternion
                let velocity = rigidBodyComponent.body.velocity

                let shape: CANNON.Shape
                switch (changedShapeComponent.shapeType) {
                    case (Comps.ShapeTypes.Box): {
                        let size = new CANNON.Vec3(
                            changedShapeComponent.size!.x / 2,
                            changedShapeComponent.size!.y / 2,
                            changedShapeComponent.size!.z / 2)
                        shape = new CANNON.Box(size)
                    } break;
                    case (Comps.ShapeTypes.Cylinder): {
                        shape = new CANNON.Cylinder(
                            changedShapeComponent.radiusTop,
                            changedShapeComponent.radiusBottom,
                            changedShapeComponent.height,
                            changedShapeComponent.numberOfSegments,
                        )
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
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      update components
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        let foundComponentsToUpdate = system.find(
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

            /////////////////
            // update position
            /////////////////
            for (let pC of foundComponentsToUpdate[0]) {
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
            /////////////////
            // update rotation
            /////////////////
            for (let rC of foundComponentsToUpdate[1]) {
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
            /////////////////
            // update force
            /////////////////
            for (let fC of foundComponentsToUpdate[2]) {
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
            /////////////////
            // update velocity
            /////////////////
            for (let vC of foundComponentsToUpdate[3]) {
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
