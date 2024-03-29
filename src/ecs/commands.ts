import * as ECS from "./ecs"
import * as Res from "./resources"
import * as Mat from "../math"
import * as Comps from "./components"
import * as Funs from "./functions"
import * as Ser from "../serialization"
import * as Utils from "../utils"
import { PhysX, PhysXT } from "../physx/physx"

// order in which they get executed
export enum CommandTypes {
    TheFirst = 0,
    CreateStickman,
    CreateRobot,
    CreateRobot2,
    CreateScene,
    CreateGun,
    Use,
    TorqueWheels,
    Shoot,
    HitDamage,
    MovePlayer,
    MoveVehicle,
    PickUp,
    DestroyRobotComponent,
    RunCode,
    SyncPhysics,
    CameraFollowPlayer,
    SendGraphicComponentsToRender,
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
        //system.addCommand(new DestroyRobotComponent())
        system.addCommand(new PickUp())
        //system.addCommand(new TorqueWheels())
        //system.addCommand(new MoveVehicle())
        system.addCommand(new MovePlayer())
        system.addCommand(new CreateRobot())
        system.addCommand(new CreateRobot2())
        system.addCommand(new CreateGun())
        system.addCommand(new HitDamage())
        system.addCommand(new Use())
        system.addCommand(new Shoot())
        system.addCommand(new CreateStickman())
        system.addCommand(new CameraFollowPlayer())


        system.removeCommand(this.commandType)
    }
}
export class RunCode implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.RunCode
    }

    run(system: ECS.System, resources: Res.Resources) {
    }
}
export class CameraFollowPlayer implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CameraFollowPlayer
    }

    run(system: ECS.System, resources: Res.Resources) {
        let playerEntityComponents: (ECS.Component | undefined)[] | undefined
        let cameraEntityComponents: (ECS.Component | undefined)[] | undefined

        for (let eTC of system.components[Comps.ComponentTypes.EntityType]) {
            let entityTypeComponent = eTC as Comps.EntityType

            if (entityTypeComponent.entityType == Comps.EntityTypes.Character) {
                playerEntityComponents = system.entities.get(eTC.entityUid)
            }
            if (entityTypeComponent.entityType == Comps.EntityTypes.Camera) {
                cameraEntityComponents = system.entities.get(eTC.entityUid)
            }
        }
        if (playerEntityComponents == undefined || cameraEntityComponents == undefined) return

        let playerHoldingComponent = playerEntityComponents[Comps.ComponentTypes.Holding] as Comps.Holding

        let playerRotationComponent = playerEntityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation
        let cameraRotationComponent = cameraEntityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation

        let playerPositionComponent = playerEntityComponents[Comps.ComponentTypes.Position] as Comps.Position
        let cameraPositionComponent = cameraEntityComponents[Comps.ComponentTypes.Position] as Comps.Position

        let positionOffset = new Mat.Vector3(1.2, 3.2, 6)
        if (resources.input.isButtonPressed(Ser.Buttons.RMB)) {
            positionOffset = new Mat.Vector3(2, 1, 3)
        }
        positionOffset = Mat.applyQuaternionToVector3(positionOffset, playerRotationComponent)
        positionOffset = Mat.sumVector3(playerPositionComponent, positionOffset)

        let mouseAddedMovement = resources.input.mouseAddedMovement

        let yMin = playerPositionComponent.y - 3
        let yMax = playerPositionComponent.y + 5

        let ySensitivity = 0.005
        let alphaY = playerPositionComponent.y + mouseAddedMovement.y * ySensitivity

        if (alphaY < yMin) {
            alphaY = yMin
            mouseAddedMovement.y -= resources.input.mouseMovement.y
        }
        else if (alphaY > yMax) {
            alphaY = yMax
            mouseAddedMovement.y -= resources.input.mouseMovement.y
        }
        positionOffset.y = alphaY

        let delta = resources.deltaTime.get()
        if (delta == undefined) return
        // lerp
        let t0 = delta * 0.5 * 0.08
        positionOffset = Mat.lerpVector3(cameraPositionComponent, positionOffset, t0)

        cameraPositionComponent.x = positionOffset.x
        cameraPositionComponent.y = positionOffset.y
        cameraPositionComponent.z = positionOffset.z

        let lookAtOffset = new Mat.Vector3(1.5, 1.5, 0)
        if (resources.input.isButtonPressed(Ser.Buttons.RMB)) {
            lookAtOffset = new Mat.Vector3(1.5, 0.5, 0)
        }
        lookAtOffset = Mat.applyQuaternionToVector3(lookAtOffset, playerRotationComponent)
        lookAtOffset = Mat.sumVector3(playerPositionComponent, lookAtOffset)
        let rotation = Mat.lookAt(lookAtOffset, cameraPositionComponent, new Mat.Vector3(0, 1, 0))
        // lerp
        let t1 = delta * 0.5 * 0.08
        rotation = Mat.slerpQuaternion(cameraRotationComponent, rotation, t1)

        cameraRotationComponent.x = rotation.x
        cameraRotationComponent.y = rotation.y
        cameraRotationComponent.z = rotation.z
        cameraRotationComponent.w = rotation.w


        if (playerHoldingComponent.holdingEntityUid != undefined) {
            let gunEntityComponents = system.entities.get(playerHoldingComponent.holdingEntityUid)!
            let gunRotationComponent = gunEntityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation

            gunRotationComponent.x = rotation.x
            gunRotationComponent.y = rotation.y
            gunRotationComponent.z = rotation.z
            gunRotationComponent.w = rotation.w
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
            let camera = system.createEntity()
            let cameraComponent = new Comps.Camera(
                50,
                0.1,
                500,
                resources.domState.windowWidth! / resources.domState.windowHeight!,
                camera)
            let positionComponent = new Comps.Position(new Mat.Vector3(0, 3, 10), camera)
            let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), camera)
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
            let rigidBodyComponent = new Comps.RigidBody(Comps.RigidBodyTypes.Static, floor)
            let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, floor)
            shapeComponent.size = new Mat.Vector3(200, 5, 200)
            let positionComponent = new Comps.Position(new Mat.Vector3(0, -10, 0), floor)
            let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), floor)
            let shapeColorComponent = new Comps.ShapeColor(0xffffff, floor)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Structure, floor)

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
export class CreateRobot2 implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CreateRobot2
    }

    run(system: ECS.System, resources: Res.Resources) {
        if (!resources.input.isButtonPressed(Ser.Buttons.E)) return
        if (resources.newRobot.elements == undefined) return

        let components = resources.newRobot.components!
        let elements = resources.newRobot.elements

        let subEnts = []
        let ent;

        let id = Utils.newUid()
        {
            for (let i = 0; i < components[Comps.ComponentTypes.Position].length; i++) {
                let localPosition = components[Comps.ComponentTypes.Position][i] as Comps.Position
                let localRotation = components[Comps.ComponentTypes.Rotation][i] as Comps.Rotation

                let subEnt = system.createEntity(localRotation.entityUid + id)
                subEnts.push(subEnt)

                let positionComponent = new Comps.Position(new Mat.Vector3(0, 0, 0), subEnt)
                let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), subEnt)
                let resistanceComponent = new Comps.Resistance(20, subEnt)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, subEnt)
                shapeComponent.size = new Mat.Vector3(1, 1, 1)
                shapeComponent.positionOffset = new Mat.Vector3(localPosition.x, localPosition.y, localPosition.z)
                shapeComponent.rotationOffset = new Mat.Quaternion(localRotation.x, localRotation.y, localRotation.z, localRotation.w)
                let shapeColorComponent = new Comps.ShapeColor(0x00ff00, subEnt)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.RobotComponent, subEnt)

                system.addComponent(resistanceComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(shapeComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            {
                ent = system.createEntity()

                let positionComponent = new Comps.Position(new Mat.Vector3(Mat.getRandomNumberInclusive(-15, 30), 5, Mat.getRandomNumberInclusive(-15, 30)), ent)
                let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), ent)
                let rigidBodyComponent = new Comps.RigidBody(Comps.RigidBodyTypes.Dynamic, ent)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Compound, ent)
                let linearVelocityComponent = new Comps.LinearVelocity(ent)
                let angularVelocityComponent = new Comps.AngularVelocity(ent)
                shapeComponent.shapesEntityUid = subEnts
                let massComponent = new Comps.Mass(subEnts.length / 2, ent)

                system.addComponent(angularVelocityComponent)
                system.addComponent(massComponent)
                system.addComponent(linearVelocityComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(shapeComponent)
            }
        }
        {
            let superEnt = system.createEntity()

            let entityGraphComponent = new Comps.EntityGraph(superEnt)

            for (let i = 0; i < subEnts.length; i++) {
                entityGraphComponent.graph.createElement(
                    subEnts[i])
            }
            for (let e of elements) {
                for (let s of e[1]) {
                    entityGraphComponent.graph.addSiblings(e[0] + id, s + id)
                }
            }

            system.addComponent(entityGraphComponent)
        }
    }
}
export class CreateRobot implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CreateRobot
    }

    run(system: ECS.System, resources: Res.Resources) {
        let subEntsEntityUid = []
        let constrainedEnt;
        {
            for (let i = 0; i < 3; i++) {
                let subEnt = system.createEntity()
                subEntsEntityUid.push(subEnt)

                let positionComponent = new Comps.Position(new Mat.Vector3(0, 0, 0), subEnt)
                let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), subEnt)
                let resistanceComponent = new Comps.Resistance(25, subEnt)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, subEnt)
                shapeComponent.size = new Mat.Vector3(1, 1, 1)
                shapeComponent.positionOffset = new Mat.Vector3(i, i, 0)
                shapeComponent.rotationOffset = new Mat.Quaternion(0, 0, 0, 1)
                let shapeColorComponent = new Comps.ShapeColor(0x000ff, subEnt)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.RobotComponent, subEnt)

                system.addComponent(resistanceComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(shapeComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            {
                constrainedEnt = system.createEntity()

                let positionComponent = new Comps.Position(new Mat.Vector3(-15, 0, 0), constrainedEnt)
                let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), constrainedEnt)
                let rigidBodyComponent = new Comps.RigidBody(Comps.RigidBodyTypes.Dynamic, constrainedEnt)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Compound, constrainedEnt)
                let linearVelocityComponent = new Comps.LinearVelocity(constrainedEnt)
                let angularVelocityComponent = new Comps.AngularVelocity(constrainedEnt)
                shapeComponent.shapesEntityUid = subEntsEntityUid
                let massComponent = new Comps.Mass(subEntsEntityUid.length, constrainedEnt)

                system.addComponent(angularVelocityComponent)
                system.addComponent(massComponent)
                system.addComponent(linearVelocityComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(shapeComponent)
            }

        }
        let constraintSubEnt0;
        {
            {
                constraintSubEnt0 = system.createEntity()

                let positionComponent = new Comps.Position(new Mat.Vector3(0, 0, 0), constraintSubEnt0)
                let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), constraintSubEnt0)
                let resistanceComponent = new Comps.Resistance(30, constraintSubEnt0)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, constraintSubEnt0)
                shapeComponent.size = new Mat.Vector3(0.5, 0.5, 0.5)
                shapeComponent.positionOffset = new Mat.Vector3(0, 0, 0)
                shapeComponent.rotationOffset = new Mat.Quaternion(0, 0, 0, 1)
                let shapeColorComponent = new Comps.ShapeColor(0x000ff, constraintSubEnt0)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.RobotComponent, constraintSubEnt0)

                system.addComponent(positionComponent)
                system.addComponent(resistanceComponent)
                system.addComponent(rotationComponent)
                system.addComponent(shapeComponent)
                system.addComponent(shapeColorComponent)
                system.addComponent(entityTypeComponent)
            }
            {
                let ent = system.createEntity()

                let positionComponent = new Comps.Position(new Mat.Vector3(-14, 0, 0), ent)
                let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), ent)
                let rigidBodyComponent = new Comps.RigidBody(Comps.RigidBodyTypes.Dynamic, ent)
                let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Compound, ent)
                shapeComponent.shapesEntityUid = [constraintSubEnt0]
                let linearVelocityComponent = new Comps.LinearVelocity(ent)
                let angularVelocityComponent = new Comps.AngularVelocity(ent)
                let constraintComponent = new Comps.Constraints(ent)
                let constraint = new Comps.Constraint(Comps.ConstraintTypes.Lock, constrainedEnt)
                constraint.axisA = new Mat.Quaternion(0, 0, 0, 1)
                constraint.axisB = new Mat.Quaternion(0, 0, 0, 1)
                constraint.pivotA = new Mat.Vector3(0, 0, -2)
                constraint.pivotB = new Mat.Vector3(0, 0, 0)
                constraintComponent.constraints.push(constraint)
                let massComponent = new Comps.Mass(1, ent)

                system.addComponent(constraintComponent)
                system.addComponent(angularVelocityComponent)
                system.addComponent(massComponent)
                system.addComponent(linearVelocityComponent)
                system.addComponent(positionComponent)
                system.addComponent(rotationComponent)
                system.addComponent(rigidBodyComponent)
                system.addComponent(shapeComponent)
            }
        }
        {
            let superEnt = system.createEntity()

            let entityGraphComponent = new Comps.EntityGraph(superEnt)

            for (let i = 0; i < subEntsEntityUid.length; i++) {
                entityGraphComponent.graph.createElement(
                    subEntsEntityUid[i])
            }
            for (let i = 0; i < subEntsEntityUid.length; i++) {
                if (i == subEntsEntityUid.length - 1) break;
                entityGraphComponent.graph.addSiblings(
                    subEntsEntityUid[i],
                    subEntsEntityUid[i + 1])
            }

            entityGraphComponent.graph.createElement(constraintSubEnt0)
            entityGraphComponent.graph.addSiblings(constraintSubEnt0, subEntsEntityUid[0])
            entityGraphComponent.graph.setStopElement(true, constraintSubEnt0)

            system.addComponent(entityGraphComponent)
        }
        system.removeCommand(this.commandType)
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
export class TorqueWheels implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.TorqueWheels
    }

    run(system: ECS.System, resources: Res.Resources) {
        //    for (let cWC of resources.componentChanges.changedComponents[Comps.ComponentTypes.Wheel]) {
        //        let wheelComponent = cWC as Comps.Wheel
        //        let entityComponents = system.entities.get(wheelComponent.entityUid)

        //        if (
        //            entityComponents == undefined ||
        //            entityComponents[Comps.ComponentTypes.Constraint] == undefined
        //        ) {
        //            continue
        //        }

        //        let constraintComponent = entityComponents[Comps.ComponentTypes.Constraint] as Comps.Constraint;
        //        if (constraintComponent.constraint == undefined) continue

        //        let hinge = constraintComponent.constraint as PhysXT.PxRevoluteJoint
        //        hinge.setDriveVelocity(wheelComponent.velocity)
        //    }
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

    run(system: ECS.System, resources: Res.Resources) {

        let stickman = system.createEntity()
        let positionComponent = new Comps.Position(new Mat.Vector3(0, 0, 0), stickman)
        let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), stickman)
        let entityStateComponent = new Comps.EntityState([Comps.EntityStates.Idle], stickman)
        let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Character, stickman)
        let rigidBodyComponent = new Comps.RigidBody(Comps.RigidBodyTypes.Dynamic, stickman)
        let axisLockComponent = new Comps.AxisLocks(stickman)
        let resistanceComponent = new Comps.Resistance(40, stickman)
        axisLockComponent.angularLock.x = true
        axisLockComponent.angularLock.y = true
        axisLockComponent.angularLock.z = true
        let massComponent = new Comps.Mass(1, stickman)
        let shapeColorComponent = new Comps.ShapeColor(0xff0000, stickman)
        let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Capsule, stickman)
        let holdingComponent = new Comps.Holding(stickman)
        shapeComponent.materialType = Comps.MaterialTypes.Wheel
        shapeComponent.height = 1.5
        shapeComponent.radius = 0.5
        let torqueComponent = new Comps.Torque(stickman)
        let forceComponent = new Comps.Force(stickman)
        let linearVelocityComponent = new Comps.LinearVelocity(stickman)


        system.addComponent(resistanceComponent)
        system.addComponent(holdingComponent)
        system.addComponent(linearVelocityComponent)
        system.addComponent(forceComponent)
        system.addComponent(axisLockComponent)
        system.addComponent(torqueComponent)
        system.addComponent(rotationComponent)
        system.addComponent(rigidBodyComponent)
        system.addComponent(massComponent)
        system.addComponent(shapeColorComponent)
        system.addComponent(shapeComponent)
        system.addComponent(positionComponent)
        system.addComponent(entityStateComponent)
        system.addComponent(entityTypeComponent)


        //system.addCommand(new MovePlayer())
        system.removeCommand(this.commandType)
    }
}
export class CreateGun implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.CreateGun
    }

    run(system: ECS.System, resources: Res.Resources) {

        let gun = system.createEntity()

        let positionComponent = new Comps.Position(new Mat.Vector3(-2, 0, 2), gun)
        let switchComponent = new Comps.Switch(false, gun)
        let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), gun)
        let entityType = new Comps.EntityType(Comps.EntityTypes.Weapon, gun)
        let rigidBodyComponent = new Comps.RigidBody(Comps.RigidBodyTypes.Dynamic, gun)
        let constraintComponent = new Comps.Constraints(gun)
        let massComponent = new Comps.Mass(0.1, gun)
        let damageComponent = new Comps.Damage(2, gun)
        let shapeColorComponent = new Comps.ShapeColor(0x00fff0, gun)
        let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Box, gun)
        shapeComponent.size = new Mat.Vector3(0.1, 0.18, 0.8)
        let torqueComponent = new Comps.Torque(gun)
        let forceComponent = new Comps.Force(gun)
        let linearVelocityComponent = new Comps.LinearVelocity(gun)


        system.addComponent(damageComponent)
        system.addComponent(switchComponent)
        system.addComponent(entityType)
        system.addComponent(constraintComponent)
        system.addComponent(linearVelocityComponent)
        system.addComponent(forceComponent)
        system.addComponent(torqueComponent)
        system.addComponent(rotationComponent)
        system.addComponent(rigidBodyComponent)
        system.addComponent(massComponent)
        system.addComponent(shapeColorComponent)
        system.addComponent(shapeComponent)
        system.addComponent(positionComponent)


        system.removeCommand(this.commandType)
    }
}
export class PickUp implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.PickUp
    }

    run(system: ECS.System, resources: Res.Resources) {
        let playerEntityUid: number | undefined
        let gunEntityUid: number | undefined

        for (let eTC of system.components[Comps.ComponentTypes.EntityType]) {
            let entityTypeComponent = eTC as Comps.EntityType

            if (entityTypeComponent.entityType == Comps.EntityTypes.Character) {
                playerEntityUid = eTC.entityUid
            }
            if (entityTypeComponent.entityType == Comps.EntityTypes.Weapon) {
                gunEntityUid = eTC.entityUid
            }
        }
        if (playerEntityUid == undefined || gunEntityUid == undefined) return

        let playerEntityComponents = system.entities.get(playerEntityUid)!
        let gunEntityComponents = system.entities.get(gunEntityUid)!

        let playerHoldingComponent = playerEntityComponents[Comps.ComponentTypes.Holding] as Comps.Holding
        let playerPositionComponent = playerEntityComponents[Comps.ComponentTypes.Position] as Comps.Position
        let gunPositionComponent = gunEntityComponents[Comps.ComponentTypes.Position] as Comps.Position
        let gunConstraintComponent = gunEntityComponents[Comps.ComponentTypes.Constraints] as Comps.Constraints

        if (playerHoldingComponent.holdingEntityUid == gunEntityUid) {
            return // gun already wielded
        }

        let distance = Math.hypot(
            playerPositionComponent.x - gunPositionComponent.x,
            playerPositionComponent.y - gunPositionComponent.y,
            playerPositionComponent.z - gunPositionComponent.z)


        if (distance < 2 && resources.input.isButtonPressed(Ser.Buttons.E)) {
            playerHoldingComponent.holdingEntityUid = gunEntityUid
            let newConstraint = new Comps.Constraint(Comps.ConstraintTypes.Hinge, playerEntityUid)
            newConstraint.pivotA = new Mat.Vector3(-0.7, 0, 0)
            newConstraint.changeType = Comps.ChangeTypes.Add
            gunConstraintComponent.constraints.push(newConstraint)
            Funs.triggerComponentChange(gunConstraintComponent)
        }
    }
}
export class Shoot implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.Shoot
    }

    run(system: ECS.System, resources: Res.Resources) {
        for (let sC of resources.componentChanges.changedComponents[Comps.ComponentTypes.Switch]) {
            let switchComponent = sC as Comps.Switch
            if (!switchComponent.isOn) continue
            switchComponent.isOn = false

            let entityComponents = system.entities.get(sC.entityUid)
            if (entityComponents == undefined) continue
            let entityTypeComponent = entityComponents[Comps.ComponentTypes.EntityType] as Comps.EntityType
            if (entityTypeComponent.entityType != Comps.EntityTypes.Weapon) continue

            let gunRotationComponent = entityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation
            let gunDamageComponent = entityComponents[Comps.ComponentTypes.Damage] as Comps.Damage
            let gunPositionComponent = entityComponents[Comps.ComponentTypes.Position] as Comps.Position
            let gunDirection = Mat.normalizeVector3(Mat.applyQuaternionToVector3(new Mat.Vector3(0, 0, -1), gunRotationComponent))
            let gunTip = new Mat.Vector3(
                gunPositionComponent.x + (gunDirection.x),
                gunPositionComponent.y + (gunDirection.y),
                gunPositionComponent.z + (gunDirection.z))

            let buffer = new PhysX.PxRaycastBuffer10()
            resources.physics.scene.raycast(
                new PhysX.PxVec3(
                    gunTip.x,
                    gunTip.y,
                    gunTip.z),
                new PhysX.PxVec3(
                    gunDirection.x,
                    gunDirection.y,
                    gunDirection.z),
                100, buffer)
            let shortestTouch: PhysXT.PxRaycastHit | undefined
            for (let i = 0; i < buffer.getNbTouches(); i++) {
                let touch = buffer.getTouch(i)
                let rigidBody = touch.actor
                if (rigidBody.getType() == (PhysX.PxActorTypeEnum as any).eRIGID_STATIC) continue

                if (i == 0 || shortestTouch == undefined) {
                    shortestTouch = touch
                    continue
                }
                if (touch.distance < shortestTouch.distance) {
                    shortestTouch = touch
                }
            }
            if (shortestTouch == undefined) return

            let shape = shortestTouch.shape
            let shapeEntityUid = resources.physics.shapePtrToEntityUid.get((shape as any).ptr)!
            let shapeEntityComponents = system.entities.get(shapeEntityUid)
            if (shapeEntityComponents == undefined) continue
            let shapeResistanceComponent = shapeEntityComponents[Comps.ComponentTypes.Resistance] as Comps.Resistance
            if (shapeResistanceComponent == undefined) continue
            if (!Funs.shouldDestroyEntity(gunDamageComponent.damage, shapeResistanceComponent.resistance)) continue
            system.removeEntity(shapeEntityUid)


            let entityGraphComponent: Comps.EntityGraph | undefined
            for (let eGC of system.components[Comps.ComponentTypes.EntityGraph]) {
                let entityGraphComp = eGC as Comps.EntityGraph
                let breakFor = false
                for (let e of entityGraphComp.graph.elements) {
                    if (e.id == shapeEntityUid) {
                        entityGraphComponent = entityGraphComp
                        breakFor = true
                        break;
                    }
                }
                if (breakFor) break
            }
            if (entityGraphComponent == undefined) return
            entityGraphComponent.graph.removeElement(shapeEntityUid)
            Funs.triggerComponentChange(entityGraphComponent)
        }
    }
}
export class HitDamage implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.HitDamage
    }

    run(system: ECS.System, resources: Res.Resources) {
        for (let iC of resources.physics.instantContacts) {
            let entityComponentsA = system.entities.get(iC.rigidBodyAEntityUid)
            let entityComponentsB = system.entities.get(iC.rigidBodyBEntityUid)

            if (entityComponentsA == undefined) continue
            if (entityComponentsB == undefined) continue

            let rigidBodyComponentA = entityComponentsA[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
            let rigidBodyComponentB = entityComponentsB[Comps.ComponentTypes.RigidBody] as Comps.RigidBody

            let shapeContacts = []
            if (rigidBodyComponentA.rigidBodyType == Comps.RigidBodyTypes.Dynamic) {
                shapeContacts.push(...iC.shapesContactA)
            }
            if (rigidBodyComponentB.rigidBodyType == Comps.RigidBodyTypes.Dynamic) {
                shapeContacts.push(...iC.shapesContactB)
            }

            for (let sC of shapeContacts) {
                let damage = Math.abs(sC.impulse.x) + Math.abs(sC.impulse.y) + Math.abs(sC.impulse.z);

                let shapeEntityComponents = system.entities.get(sC.shapeEntityUid)
                if (shapeEntityComponents == undefined) continue
                let shapeResistanceComponent = shapeEntityComponents[Comps.ComponentTypes.Resistance] as Comps.Resistance
                if (shapeResistanceComponent == undefined) continue
                if (!Funs.shouldDestroyEntity(damage, shapeResistanceComponent.resistance)) continue
                system.removeEntity(sC.shapeEntityUid)

                let entityGraphComponent: Comps.EntityGraph | undefined
                for (let eGC of system.components[Comps.ComponentTypes.EntityGraph]) {
                    let entityGraphComp = eGC as Comps.EntityGraph
                    let breakFor = false
                    for (let e of entityGraphComp.graph.elements) {
                        if (e.id == sC.shapeEntityUid) {
                            entityGraphComponent = entityGraphComp
                            breakFor = true
                            break;
                        }
                    }
                    if (breakFor) break
                }
                if (entityGraphComponent == undefined) return
                entityGraphComponent.graph.removeElement(sC.shapeEntityUid)
                Funs.triggerComponentChange(entityGraphComponent)
            }
        }
    }
}
export class Use implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.Use
    }

    run(system: ECS.System, resources: Res.Resources) {
        if (!resources.input.isButtonPressed(Ser.Buttons.LMB)) return
        //resources.input.buttons.set(Ser.Buttons.LMB, false)

        for (let hC of system.components[Comps.ComponentTypes.Holding]) {
            let holdingComponent = hC as Comps.Holding
            if (holdingComponent.holdingEntityUid == undefined) continue

            let entityComponents = system.entities.get(holdingComponent.holdingEntityUid)!
            let switchComponent = entityComponents[Comps.ComponentTypes.Switch] as Comps.Switch
            switchComponent.isOn = true
        }
    }
}
export class MovePlayer implements ECS.Command {
    readonly commandType: CommandTypes
    constructor() {
        this.commandType = CommandTypes.MovePlayer
    }

    run(system: ECS.System, resources: Res.Resources) {
        let entityComponents: (ECS.Component | undefined)[] | undefined

        for (let eTC of system.components[Comps.ComponentTypes.EntityType]) {
            let entityTypeComponent = eTC as Comps.EntityType

            if (entityTypeComponent.entityType == Comps.EntityTypes.Character) {
                entityComponents = system.entities.get(eTC.entityUid)
                break;
            }
        }
        if (entityComponents == undefined) return

        let forceComponent = entityComponents[Comps.ComponentTypes.Force] as Comps.Force
        let positionComponent = entityComponents[Comps.ComponentTypes.Position] as Comps.Position
        let rotationComponent = entityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation
        let linearVelocityComponent = entityComponents[Comps.ComponentTypes.LinearVelocity] as Comps.LinearVelocity

        let buffer = new PhysX.PxOverlapBuffer10()
        resources.physics.scene.overlap(
            new PhysX.PxBoxGeometry(0.25, 0.1, 0.25),
            new PhysX.PxTransform(
                new PhysX.PxVec3(
                    positionComponent.x,
                    positionComponent.y - 1.375,
                    positionComponent.z),
                new PhysX.PxQuat(0, 0, 0, 1)),
            buffer)
        let isTouchingGround = buffer.hasAnyHits()
        let inputDirection = Mat.normalizeVector2(Funs.getMovementDirection(resources))
        let forward = Mat.normalizeVector3(Mat.applyQuaternionToVector3(new Mat.Vector3(0, 0, -1), rotationComponent))
        let right = Mat.normalizeVector3(Mat.applyQuaternionToVector3(new Mat.Vector3(1, 0, 0), rotationComponent))

        let groundForce = 70
        let jumpForce = 80
        let velocityLimit = 12

        let velocitySum = Math.abs(linearVelocityComponent.x) + Math.abs(linearVelocityComponent.z)
        let forceMultiplier = new Mat.Vector2(1, 1)

        // limit movement force
        if (velocitySum > velocityLimit) {
            if (
                (
                    (linearVelocityComponent.x && inputDirection.x * right.x > 0) ||
                    (linearVelocityComponent.x && inputDirection.y * forward.x > 0)
                ) ||
                (
                    (linearVelocityComponent.x && inputDirection.x * right.x < 0) ||
                    (linearVelocityComponent.x && inputDirection.y * forward.x < 0)
                )
            ) {
                forceMultiplier.x = 0
            }
            if (
                (
                    (linearVelocityComponent.z && inputDirection.x * right.z > 0) ||
                    (linearVelocityComponent.z && inputDirection.y * forward.z > 0)
                ) ||
                (
                    (linearVelocityComponent.z && inputDirection.x * right.z < 0) ||
                    (linearVelocityComponent.z && inputDirection.y * forward.z < 0)
                )
            ) {
                forceMultiplier.y = 0
            }
        }
        if (
            inputDirection.y != 0
        ) {
            forceComponent.xToApply += forward.x * forceMultiplier.x * inputDirection.y * groundForce
            forceComponent.zToApply += forward.z * forceMultiplier.y * inputDirection.y * groundForce
        }
        if (
            inputDirection.x != 0
        ) {
            forceComponent.xToApply += right.x * forceMultiplier.x * inputDirection.x * groundForce
            forceComponent.zToApply += right.z * forceMultiplier.y * inputDirection.x * groundForce
        }

        if (resources.input.isButtonPressed(Ser.Buttons.Space) && isTouchingGround) {
            forceComponent.yToApply = jumpForce
        }

        let mouseMovement = resources.input.mouseAddedMovement
        let xSensitivity = 0.045
        let rotation = Mat.axisAngletoQuaternion(
            new Mat.Vector3(0, 1, 0),
            Mat.deg2rad(-mouseMovement.x * xSensitivity))

        let delta = resources.deltaTime.get()
        if (delta == undefined) return

        let t = delta * 0.5 * 0.08
        rotation = Mat.slerpQuaternion(rotationComponent, rotation, t)
        rotationComponent.x = rotation.x
        rotationComponent.y = rotation.y
        rotationComponent.z = rotation.z
        rotationComponent.w = rotation.w

    }
}
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
        graphicChanges.changedComponents.push(...resources.componentChanges.proxyFreeChangedComponentsBuffer[Comps.ComponentTypes.Position])
        graphicChanges.changedComponents.push(...resources.componentChanges.proxyFreeChangedComponentsBuffer[Comps.ComponentTypes.Rotation])

        // order is important
        // added
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.EntityType])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.Camera])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.Light])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.Shape])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.EntityState])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.Rotation])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.Position])
        graphicChanges.addedComponents.push(...resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.ShapeColor])

        // check for removed entities
        for (let rC of resources.componentChanges.proxyFreeRemovedComponentsBuffer[Comps.ComponentTypes.EntityType]) {
            graphicChanges.removedEntitiesUid.push(rC.entityUid)
        }

        // check for added entities
        for (let aC of resources.componentChanges.proxyFreeAddedComponentsBuffer[Comps.ComponentTypes.EntityType]) {
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

        /////////////////
        // changed entity graph
        /////////////////
        for (let cEGC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.EntityGraph]) {
            let entityGraphComponent = cEGC as Comps.EntityGraph
            let oldConnections = entityGraphComponent.graph.islandConnections
            let oldIslands = entityGraphComponent.graph.islands
            entityGraphComponent.graph.updateIslands()
            entityGraphComponent.graph.updateIslandConnections()

            // handle removed constraints 
            let removedIslandConnections = []
            for (let c0 of oldConnections) {
                let isRemoved = true
                for (let c1 of entityGraphComponent.graph.islandConnections) {
                    if (
                        (c1.elementA.id == c0.elementA.id && c1.elementB.id == c0.elementB.id) ||
                        (c1.elementA.id == c0.elementB.id && c1.elementB.id == c0.elementA.id)
                    ) {
                        isRemoved = false
                        break;
                    }
                }
                if (isRemoved) {
                    removedIslandConnections.push(c0)
                }
            }
            // remove constraint
            for (let rC of removedIslandConnections) {
                for (let cC of system.components[Comps.ComponentTypes.Constraints]) {
                    let constraintComponent = cC as Comps.Constraints
                    let entityComponents = system.entities.get(cC.entityUid)!
                    let shapeComponent = entityComponents[Comps.ComponentTypes.Shape] as Comps.Shape
                    if (shapeComponent.shapeType != Comps.ShapeTypes.Compound) continue

                    let foundFirstElement = false
                    for (let eUid of shapeComponent.shapesEntityUid) {
                        if (eUid == rC.elementA.id || eUid == rC.elementB.id) {
                            foundFirstElement = true
                            break;
                        }
                    }
                    if (!foundFirstElement) {
                        continue
                    }

                    // get constraint
                    let foundSecondElement = false;
                    for (let constraint of constraintComponent.constraints) {
                        let entityComponents = system.entities.get(constraint.entityUidConstrainedTo)!
                        let shapeComponent = entityComponents[Comps.ComponentTypes.Shape] as Comps.Shape
                        for (let eUid of shapeComponent.shapesEntityUid) {
                            if (eUid == rC.elementA.id || eUid == rC.elementB.id) {
                                foundSecondElement = true
                                break;
                            }
                        }
                        if (foundSecondElement) {
                            constraint.changeType = Comps.ChangeTypes.Remove
                            break;
                        }
                    }
                    if (foundSecondElement) break;
                }
            }

            // get split islands
            //                 old           new
            let splitIslands: [Utils.Island, Utils.Island[]][] = []
            for (let i0 of oldIslands) {
                for (let i1 of entityGraphComponent.graph.islands) {

                    // get matching islands
                    // if elements match, the new island is part ot the original island
                    let isMatch = false
                    for (let e0 of i0.elements) {
                        for (let e1 of i1.elements) {
                            if (e0.id == e1.id) {
                                isMatch = true
                                break;
                            }
                        }
                        if (isMatch) {
                            break;
                        }
                    }

                    // if the matching island is less than the original, it's a split island
                    if (isMatch && (i1.elements.length < i0.elements.length)) {
                        let isIslandPushed = false
                        for (let sI of splitIslands) {
                            if (sI[0].id == i0.id) {
                                isIslandPushed = true
                                sI[1].push(i1)
                            }
                        }
                        if (!isIslandPushed) {
                            splitIslands.push([i0, [i1]])
                        }
                        continue
                    }
                }
            }

            // handle split rigid bodies
            let oldEntities = []
            let newEntities = []
            for (let splitIsland of splitIslands) {

                // remove old rigid body
                let childEntityComponents = system.entities.get(splitIsland[1][0].elements[0].id)!
                let childShapeComponent = childEntityComponents[Comps.ComponentTypes.Shape]! as Comps.Shape
                let parentRigidBody = childShapeComponent.shape!.getActor() as PhysXT.PxRigidDynamic
                let parentEntityUid = resources.physics.rigidBodyPtrToEntityUid.get((parentRigidBody as any).ptr)
                if (parentEntityUid == undefined) continue
                oldEntities.push(parentEntityUid)
                let parentEntityComponents = system.entities.get(parentEntityUid)
                if (parentEntityComponents == undefined) continue

                let parentPosition = parentEntityComponents[Comps.ComponentTypes.Position] as Comps.Position
                let parentRotation = parentEntityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation
                let parentLinearVelocity = parentEntityComponents[Comps.ComponentTypes.LinearVelocity] as Comps.LinearVelocity
                let parentAngularVelocity = parentEntityComponents[Comps.ComponentTypes.AngularVelocity] as Comps.AngularVelocity

                // create rigidbodies for new islands
                for (let island of splitIsland[1]) {

                    let superComp = system.createEntity()
                    newEntities.push(superComp)

                    let positionComponent = new Comps.Position(new Mat.Vector3(0, 0, 0), superComp)
                    positionComponent.x = parentPosition.x
                    positionComponent.y = parentPosition.y
                    positionComponent.z = parentPosition.z
                    let rotationComponent = new Comps.Rotation(new Mat.Vector3(0, 0, 0), superComp)
                    rotationComponent.x = parentRotation.x;
                    rotationComponent.y = parentRotation.y;
                    rotationComponent.z = parentRotation.z;
                    rotationComponent.w = parentRotation.w;
                    let linearVelocityComponent = new Comps.LinearVelocity(superComp)
                    linearVelocityComponent.x = parentLinearVelocity.x;
                    linearVelocityComponent.y = parentLinearVelocity.y;
                    linearVelocityComponent.z = parentLinearVelocity.z;
                    let angularVelocityComponent = new Comps.AngularVelocity(superComp)
                    angularVelocityComponent.x = parentAngularVelocity.x;
                    angularVelocityComponent.y = parentAngularVelocity.y;
                    angularVelocityComponent.z = parentAngularVelocity.z;
                    let rigidBodyComponent = new Comps.RigidBody(Comps.RigidBodyTypes.Dynamic, superComp)
                    let shapeComponent = new Comps.Shape(Comps.ShapeTypes.Compound, superComp)
                    shapeComponent.shapesEntityUid = island.elements.map(e => e.id)
                    let massComponent = new Comps.Mass(island.elements.length, superComp)

                    system.addComponent(angularVelocityComponent)
                    system.addComponent(linearVelocityComponent)
                    system.addComponent(massComponent)
                    system.addComponent(positionComponent)
                    system.addComponent(rotationComponent)
                    system.addComponent(rigidBodyComponent)
                    system.addComponent(shapeComponent)
                }
            }
            // add constraints to new islands
            for (let splitIsland of splitIslands) {

                // find split islands connnections
                for (let island of splitIsland[1]) {
                    for (let iC of entityGraphComponent.graph.islandConnections) {
                        if (iC.islandA.id == island.id || iC.islandB.id == island.id) {

                            let isBAttachedToA = false
                            let oldParentUid: number | undefined
                            let matchConstraint: Comps.Constraint | undefined;

                            // find old constraint involving these connections 
                            for (let cC of system.components[Comps.ComponentTypes.Constraints]) {
                                let constraintComponent = cC as Comps.Constraints
                                let entityComponents = system.entities.get(cC.entityUid)!
                                let shapeComponent = entityComponents[Comps.ComponentTypes.Shape] as Comps.Shape
                                if (shapeComponent.shapeType != Comps.ShapeTypes.Compound) continue

                                let foundFirstElement = false
                                for (let eUid of shapeComponent.shapesEntityUid) {
                                    if (eUid == iC.elementA.id) {
                                        foundFirstElement = true
                                        isBAttachedToA = false
                                        break;
                                    }
                                    if (eUid == iC.elementB.id) {
                                        foundFirstElement = true
                                        isBAttachedToA = true
                                        break;
                                    }
                                }
                                if (!foundFirstElement) {
                                    continue
                                }
                                // verify that the other entity has the other element
                                for (let constraint of constraintComponent.constraints) {
                                    let entityComponents = system.entities.get(constraint.entityUidConstrainedTo)!
                                    let shapeComponent = entityComponents[Comps.ComponentTypes.Shape] as Comps.Shape
                                    for (let eUid of shapeComponent.shapesEntityUid) {
                                        if (eUid == iC.elementA.id || eUid == iC.elementB.id) {
                                            matchConstraint = constraint
                                            oldParentUid = constraintComponent.entityUid
                                            break;
                                        }
                                    }
                                }
                            }
                            if (matchConstraint == undefined || oldParentUid == undefined) continue;

                            // get new parents to attach the matched constraint

                            // check if element A island was split
                            let elementAParentUid: number | undefined
                            let elementBParentUid: number | undefined

                            for (let eUid of newEntities) {
                                let entityComponents = system.entities.get(eUid)!
                                let shapeComponent = entityComponents[Comps.ComponentTypes.Shape] as Comps.Shape

                                for (let shapeUid of shapeComponent.shapesEntityUid) {
                                    if (shapeUid == iC.elementA.id) {
                                        elementAParentUid = eUid
                                    }
                                    if (shapeUid == iC.elementB.id) {
                                        elementBParentUid = eUid
                                    }
                                }
                            }

                            let attacherParentUid: number
                            let attachedToParentUid: number

                            if (elementAParentUid == undefined) {
                                elementAParentUid = oldParentUid
                            }
                            if (elementBParentUid == undefined) {
                                elementBParentUid = oldParentUid
                            }

                            if (isBAttachedToA) {
                                attacherParentUid = elementBParentUid
                                attachedToParentUid = elementAParentUid!
                            } else {
                                attacherParentUid = elementAParentUid
                                attachedToParentUid = elementBParentUid!
                            }

                            let constraintComponent = new Comps.Constraints(attacherParentUid)
                            constraintComponent.constraints.push(matchConstraint)
                            matchConstraint.entityUidConstrainedTo = attachedToParentUid
                            matchConstraint.changeType = undefined

                            system.addComponent(constraintComponent)
                        }
                    }
                }
            }
            for (let eUid of oldEntities) {
                system.removeEntity(eUid)
            }
        }


        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      added
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////
        // added entity graph
        /////////////////
        for (let aEGC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.EntityGraph]) {
            let entityGraphComponent = aEGC as Comps.EntityGraph
            entityGraphComponent.graph.updateIslands()
            entityGraphComponent.graph.updateIslandConnections()
        }
        /////////////////
        // added rigidbody
        /////////////////
        for (let aRBC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.RigidBody]) {
            let rigidBodyComponent = aRBC as Comps.RigidBody

            let transform = new PhysX.PxTransform((PhysX.PxIDENTITYEnum as any).PxIdentity)

            let rigidBody: PhysXT.PxRigidActor
            switch (rigidBodyComponent.rigidBodyType) {
                case Comps.RigidBodyTypes.Dynamic: {
                    rigidBody = resources.physics.physics.createRigidDynamic(transform);
                } break;
                case Comps.RigidBodyTypes.Static: {
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
        // added axis locks
        /////////////////
        for (let aALC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.AxisLocks]) {
            let axisLockComponent = aALC as Comps.AxisLocks
            let entityComponents = system.entities.get(aALC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
            if (rigidBodyComponent == undefined) continue

            let rigidBody = rigidBodyComponent.body as PhysXT.PxRigidDynamic

            // reset everything
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_X, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Y, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Z, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_X, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Y, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Z, false)

            // angular
            if (axisLockComponent.angularLock.x) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_X, true)
            }
            if (axisLockComponent.angularLock.y) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Y, true)
            }
            if (axisLockComponent.angularLock.z) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Z, true)
            }
            // linear
            if (axisLockComponent.linearLock.x) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_X, true)
            }
            if (axisLockComponent.linearLock.y) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Y, true)
            }
            if (axisLockComponent.linearLock.z) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Z, true)
            }
        }
        /////////////////
        // added aggregate
        /////////////////
        for (let aAC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Aggregate]) {
            let aggregateComponent = aAC as Comps.Aggregate

            let shapeNumber = 0
            for (let eUid of aggregateComponent.rigidBodiesEntityUid) {
                let childEntityComponents = system.entities.get(eUid)!
                let childShapeComponent = childEntityComponents[Comps.ComponentTypes.Shape] as Comps.Shape

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
                let childRigidBodyComponent = childEntityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
                newAggregate.addActor(childRigidBodyComponent.body!)
            }
            resources.physics.scene.addAggregate(newAggregate)
            aggregateComponent.aggregate = newAggregate
        }
        /////////////////
        // added shape
        /////////////////
        for (let aSC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            let entityComponents = system.entities.get(aSC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
            let shapeComponent = aSC as Comps.Shape

            if (rigidBodyComponent == undefined) continue

            let filterData = new PhysX.PxFilterData(1, 1,
                (PhysX.PxPairFlagEnum as any).eNOTIFY_TOUCH_FOUND |
                (PhysX.PxPairFlagEnum as any).eNOTIFY_CONTACT_POINTS, 0);

            let material: PhysXT.PxMaterial;
            switch (shapeComponent.materialType) {
                case Comps.MaterialTypes.Wheel: {
                    material = resources.physics.materials.wheel
                } break;
                case Comps.MaterialTypes.Default: {
                    material = resources.physics.materials.default
                } break;
            }
            let shape: PhysXT.PxShape;
            switch (shapeComponent.shapeType) {
                case Comps.ShapeTypes.Box: {
                    let geometry = new PhysX.PxBoxGeometry(
                        shapeComponent.size!.x / 2,
                        shapeComponent.size!.y / 2,
                        shapeComponent.size!.z / 2);
                    shape = resources.physics.physics.createShape(geometry, material, true)
                } break;
                case Comps.ShapeTypes.Sphere: {
                    let geometry = new PhysX.PxSphereGeometry(shapeComponent.radius!);
                    shape = resources.physics.physics.createShape(geometry, material, true)
                } break;
                case Comps.ShapeTypes.Capsule: {
                    let geometry = new PhysX.PxCapsuleGeometry(
                        shapeComponent.radius!,
                        shapeComponent.height! / 2);
                    shape = resources.physics.physics.createShape(geometry, material, true)

                    let z90deg = Mat.eulerToQuaternion(
                        new Mat.Vector3(
                            Mat.deg2rad(0),
                            Mat.deg2rad(0),
                            Mat.deg2rad(90)));
                    shape.setLocalPose(
                        new PhysX.PxTransform(
                            new PhysX.PxVec3(0, 0, 0),
                            new PhysX.PxQuat(
                                z90deg.x, z90deg.y, z90deg.z, z90deg.w)));
                } break;
                case Comps.ShapeTypes.Cylinder: {
                    let geometry = resources.physics.customConvexShapes.createPrism(
                        shapeComponent.sideNumber!,
                        shapeComponent.height!,
                        shapeComponent.radius!);
                    shape = resources.physics.physics.createShape(geometry, material, true)
                } break;
                case Comps.ShapeTypes.Compound: {
                    let shapesEntityUid = (entityComponents[Comps.ComponentTypes.Shape] as Comps.Shape).shapesEntityUid!

                    for (let i = shapesEntityUid.length - 1; i >= 0; i--) {
                        let shapeEntityUid = shapesEntityUid[i]
                        let shapeEntityComponents = system.entities.get(shapeEntityUid);
                        if (shapeEntityComponents == undefined) {
                            shapesEntityUid.splice(i, 1)
                            continue;
                        }
                        let shapeComponent = shapeEntityComponents[Comps.ComponentTypes.Shape] as Comps.Shape;

                        let material: PhysXT.PxMaterial;
                        switch (shapeComponent.materialType) {
                            case Comps.MaterialTypes.Wheel: {
                                material = resources.physics.materials.wheel
                            } break;
                            case Comps.MaterialTypes.Default: {
                                material = resources.physics.materials.default
                            } break;
                        }
                        let shape: PhysXT.PxShape;
                        switch (shapeComponent.shapeType) {
                            case Comps.ShapeTypes.Box: {
                                let geometry = new PhysX.PxBoxGeometry(
                                    shapeComponent.size!.x / 2,
                                    shapeComponent.size!.y / 2,
                                    shapeComponent.size!.z / 2);
                                shape = resources.physics.physics.createShape(geometry, material, true)
                            } break;
                            case Comps.ShapeTypes.Sphere: {
                                let geometry = new PhysX.PxSphereGeometry(shapeComponent.radius!);
                                shape = resources.physics.physics.createShape(geometry, material, true)
                            } break;
                            case Comps.ShapeTypes.Capsule: {
                                let geometry = new PhysX.PxCapsuleGeometry(
                                    shapeComponent.radius!,
                                    shapeComponent.height! / 2);
                                shape = resources.physics.physics.createShape(geometry, material, true)

                                let z90deg = Mat.eulerToQuaternion(
                                    new Mat.Vector3(
                                        Mat.deg2rad(0),
                                        Mat.deg2rad(0),
                                        Mat.deg2rad(90)));
                                shape.setLocalPose(
                                    new PhysX.PxTransform(
                                        new PhysX.PxVec3(0, 0, 0),
                                        new PhysX.PxQuat(
                                            z90deg.x, z90deg.y, z90deg.z, z90deg.w)));
                            } break;
                            case Comps.ShapeTypes.Cylinder: {
                                let geometry = resources.physics.customConvexShapes.createPrism(
                                    shapeComponent.sideNumber!,
                                    shapeComponent.height!,
                                    shapeComponent.radius!);
                                shape = resources.physics.physics.createShape(geometry, material, true)
                            } break;
                            case Comps.ShapeTypes.Compound: {
                                console.log("inception")
                            } continue;
                        }
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
                        resources.physics.shapePtrToEntityUid.set((shape as any).ptr, shapeEntityUid)
                        shapeComponent.shape = shape
                        rigidBodyComponent.body!.attachShape(shape)
                    }
                } continue;
            }
            shape.setSimulationFilterData(filterData)
            resources.physics.shapePtrToEntityUid.set((shape as any).ptr, aSC.entityUid)
            shapeComponent.shape = shape
            rigidBodyComponent.body!.attachShape(shape)
        }
        /////////////////
        // added position
        /////////////////
        for (let aPC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Position]) {
            let entityComponents = system.entities.get(aPC.entityUid)
            if (entityComponents == undefined) continue
            if (entityComponents[Comps.ComponentTypes.RigidBody] == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(aRC.entityUid)
            if (entityComponents == undefined) continue
            if (entityComponents[Comps.ComponentTypes.RigidBody] == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(aMC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
            let rigidBody = rigidBodyComponent.body as PhysXT.PxRigidBody
            let massComponent = aMC as Comps.Mass
            (PhysX.PxRigidBodyExt.prototype as any).updateMassAndInertia(rigidBody, massComponent.mass)
        }
        /////////////////
        // added angular velocity
        /////////////////
        for (let aAVC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.AngularVelocity]) {
            let entityComponents = system.entities.get(aAVC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(aLVC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(aTC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(aFC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
        // added constraints
        /////////////////
        for (let aCC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.Constraints]) {
            let entityComponentsA = system.entities.get(aCC.entityUid)!
            if (entityComponentsA == undefined) continue

            let constraintsComponent = aCC as Comps.Constraints

            for (let constraint of constraintsComponent.constraints) {
                let entityComponentsB = system.entities.get(constraint.entityUidConstrainedTo)
                if (entityComponentsB == undefined) continue

                let rigidBodyAComponent = entityComponentsA[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
                let rigidBodyBComponent = entityComponentsB[Comps.ComponentTypes.RigidBody] as Comps.RigidBody

                let rigidBodyA = rigidBodyAComponent.body!
                let rigidBodyB = rigidBodyBComponent.body!

                let newConstraint: PhysXT.PxJoint
                let localFrameA = new PhysX.PxTransform(
                    new PhysX.PxVec3(
                        constraint.pivotA!.x,
                        constraint.pivotA!.y,
                        constraint.pivotA!.z),
                    new PhysX.PxQuat(
                        constraint.axisA!.x,
                        constraint.axisA!.y,
                        constraint.axisA!.z,
                        constraint.axisA!.w));
                let localFrameB = new PhysX.PxTransform(
                    new PhysX.PxVec3(
                        constraint.pivotB!.x,
                        constraint.pivotB!.y,
                        constraint.pivotB!.z),
                    new PhysX.PxQuat(
                        constraint.axisB!.x,
                        constraint.axisB!.y,
                        constraint.axisB!.z,
                        constraint.axisB!.w));

                switch (constraint.constraintType) {
                    case Comps.ConstraintTypes.Lock: {
                        newConstraint = (PhysX.PxTopLevelFunctions.prototype as any).FixedJointCreate(
                            resources.physics.physics,
                            rigidBodyA,
                            localFrameA,
                            rigidBodyB,
                            localFrameB)
                    } break;
                    case Comps.ConstraintTypes.Distance: {
                        newConstraint = (PhysX.PxTopLevelFunctions.prototype as any).DistanceJointCreate(
                            resources.physics.physics,
                            rigidBodyA,
                            localFrameA,
                            rigidBodyB,
                            localFrameB)
                    } break;
                    case Comps.ConstraintTypes.Hinge: {
                        newConstraint = (PhysX.PxTopLevelFunctions.prototype as any).RevoluteJointCreate(
                            resources.physics.physics,
                            rigidBodyB,
                            localFrameB,
                            rigidBodyA, // changed
                            localFrameA) as PhysXT.PxRevoluteJoint

                        (newConstraint as PhysXT.PxRevoluteJoint)
                            .setRevoluteJointFlag((PhysX.PxRevoluteJointFlagEnum as any)
                                .eDRIVE_ENABLED, true)

                    } break;
                }
                constraint.constraintReference = newConstraint;
                constraint.changeType = undefined
            }
        }
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      changed
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        /////////////////
        // changed constraints
        /////////////////
        for (let cCC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.Constraints]) {
            let constraintComponent = cCC as Comps.Constraints

            for (let i = constraintComponent.constraints.length - 1; i >= 0; i--) {
                let constraint = constraintComponent.constraints[i]

                switch (constraint.changeType) {
                    case Comps.ChangeTypes.Remove: {
                        constraintComponent.constraints.splice(i, 1)
                        constraint.constraintReference?.release()
                    } break;
                    case Comps.ChangeTypes.Add: {
                        let entityComponentsA = system.entities.get(cCC.entityUid)!
                        let entityComponentsB = system.entities.get(constraint.entityUidConstrainedTo)!

                        if (entityComponentsA == undefined || entityComponentsB == undefined) continue

                        let rigidBodyAComponent = entityComponentsA[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
                        let rigidBodyBComponent = entityComponentsB[Comps.ComponentTypes.RigidBody] as Comps.RigidBody

                        let rigidBodyA = rigidBodyAComponent.body!
                        let rigidBodyB = rigidBodyBComponent.body!

                        let newConstraint: PhysXT.PxJoint
                        let localFrameA = new PhysX.PxTransform(
                            new PhysX.PxVec3(
                                constraint.pivotA!.x,
                                constraint.pivotA!.y,
                                constraint.pivotA!.z),
                            new PhysX.PxQuat(
                                constraint.axisA!.x,
                                constraint.axisA!.y,
                                constraint.axisA!.z,
                                constraint.axisA!.w));
                        let localFrameB = new PhysX.PxTransform(
                            new PhysX.PxVec3(
                                constraint.pivotB!.x,
                                constraint.pivotB!.y,
                                constraint.pivotB!.z),
                            new PhysX.PxQuat(
                                constraint.axisB!.x,
                                constraint.axisB!.y,
                                constraint.axisB!.z,
                                constraint.axisB!.w));

                        switch (constraint.constraintType) {
                            case Comps.ConstraintTypes.Lock: {
                                newConstraint = (PhysX.PxTopLevelFunctions.prototype as any).FixedJointCreate(
                                    resources.physics.physics,
                                    rigidBodyA,
                                    localFrameA,
                                    rigidBodyB,
                                    localFrameB)
                            } break;
                            case Comps.ConstraintTypes.Distance: {
                                newConstraint = (PhysX.PxTopLevelFunctions.prototype as any).DistanceJointCreate(
                                    resources.physics.physics,
                                    rigidBodyA,
                                    localFrameA,
                                    rigidBodyB,
                                    localFrameB)
                            } break;
                            case Comps.ConstraintTypes.Hinge: {
                                newConstraint = (PhysX.PxTopLevelFunctions.prototype as any).RevoluteJointCreate(
                                    resources.physics.physics,
                                    rigidBodyB,
                                    localFrameB,
                                    rigidBodyA, // changed
                                    localFrameA) as PhysXT.PxRevoluteJoint

                                (newConstraint as PhysXT.PxRevoluteJoint)
                                    .setRevoluteJointFlag((PhysX.PxRevoluteJointFlagEnum as any)
                                        .eDRIVE_ENABLED, true)

                            } break;
                        }
                        constraint.constraintReference = newConstraint;
                        constraint.changeType = undefined;
                    } break;
                }
            }
        }
        /////////////////
        // changed angular velocity
        /////////////////
        for (let cAVC of resources.componentChanges.changedComponentsBuffer[Comps.ComponentTypes.AngularVelocity]) {
            let entityComponents = system.entities.get(cAVC.entityUid)
            if (entityComponents == undefined) continue
            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody

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
            let entityComponents = system.entities.get(cFC.entityUid)
            if (entityComponents == undefined) continue
            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(cTC.entityUid)
            if (entityComponents == undefined) continue
            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(cLVC.entityUid)
            if (entityComponents == undefined) continue
            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(cRC.entityUid)
            if (entityComponents == undefined) continue
            if (entityComponents[Comps.ComponentTypes.RigidBody] == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
            let entityComponents = system.entities.get(cPC.entityUid)
            if (entityComponents == undefined) continue
            if (entityComponents[Comps.ComponentTypes.RigidBody] == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
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
        /////////////////
        // changed axis locks
        /////////////////
        for (let cALC of resources.componentChanges.addedComponentsBuffer[Comps.ComponentTypes.AxisLocks]) {
            let axisLockComponent = cALC as Comps.AxisLocks
            let entityComponents = system.entities.get(cALC.entityUid)
            if (entityComponents == undefined) continue

            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
            if (rigidBodyComponent == undefined) continue

            let rigidBody = rigidBodyComponent.body as PhysXT.PxRigidDynamic

            // reset everything
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_X, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Y, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Z, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_X, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Y, false)
            rigidBody.setRigidDynamicLockFlag(
                (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Z, false)

            // angular
            if (axisLockComponent.angularLock.x) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_X, true)
            }
            if (axisLockComponent.angularLock.y) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Y, true)
            }
            if (axisLockComponent.angularLock.z) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_ANGULAR_Z, true)
            }
            // linear
            if (axisLockComponent.linearLock.x) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_X, true)
            }
            if (axisLockComponent.linearLock.y) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Y, true)
            }
            if (axisLockComponent.linearLock.z) {
                rigidBody.setRigidDynamicLockFlag(
                    (PhysX.PxRigidDynamicLockFlagEnum as any).eLOCK_LINEAR_Z, true)
            }
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
            resources.physics.scene.removeActor(rigidBodyComponent.body, true)
            resources.physics.rigidBodyPtrToEntityUid.delete(rigidBodyComponent.entityUid)
        }
        /////////////////
        // removed shape
        /////////////////
        for (let rSC of resources.componentChanges.proxyFreeRemovedComponentsBuffer[Comps.ComponentTypes.Shape]) {
            let shapeComponent = rSC as Comps.Shape
            let childShapeComponent = shapeComponent
            resources.physics.shapePtrToEntityUid.delete(childShapeComponent.entityUid)

            if (childShapeComponent.shape == undefined) continue

            let parentRigidBody = childShapeComponent.shape.getActor()
            let parentEntityUid = resources.physics.rigidBodyPtrToEntityUid.get((parentRigidBody as any).ptr)

            if (parentEntityUid == undefined) continue
            let parentEntityComponents = system.entities.get(parentEntityUid)
            if (parentEntityComponents == undefined) continue

            parentRigidBody.detachShape(childShapeComponent.shape);

            let parentShapeComponent = parentEntityComponents[Comps.ComponentTypes.Shape] as Comps.Shape

            let shapesEntityUid = parentShapeComponent.shapesEntityUid
            for (let [i, eUid] of shapesEntityUid.entries()) {
                if (childShapeComponent.entityUid == eUid) {
                    shapesEntityUid.splice(i, 1)
                    return
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////
        //////      sync physics engine changes
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
            let entityComponents = system.entities.get(entityUid)
            if (entityComponents == undefined) continue

            let shapeComponent = entityComponents[Comps.ComponentTypes.Shape] as Comps.Shape
            let rigidBodyComponent = entityComponents[Comps.ComponentTypes.RigidBody] as Comps.RigidBody
            let rigidBody = rigidBodyComponent.body as PhysXT.PxRigidDynamic
            let transform = rigidBody.getGlobalPose();

            let rigidBodyPosition = transform.p
            let rigidBodyQuaternion = transform.q

            if (shapeComponent!.shapeType == Comps.ShapeTypes.Compound) {
                let shapesEntityUid = shapeComponent.shapesEntityUid
                for (let eUid of shapesEntityUid) {
                    let childEntityComponents = system.entities.get(eUid)
                    if (childEntityComponents == undefined) continue

                    let childRotationComponent = childEntityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation
                    let childShapeComponent = childEntityComponents[Comps.ComponentTypes.Shape] as Comps.Shape
                    let childPositionComponent = childEntityComponents[Comps.ComponentTypes.Position] as Comps.Position
                    //resources.cameraViewEntities.updateEntity(childPositionComponent)

                    let shapeTransform = (PhysX.PxShapeExt.prototype as any)
                        .getGlobalPose(childShapeComponent.shape, rigidBody) as PhysXT.PxTransform;

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
            let positionComponent = entityComponents[Comps.ComponentTypes.Position] as Comps.Position
            let rotationComponent = entityComponents[Comps.ComponentTypes.Rotation] as Comps.Rotation
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

            let linearVelocityComponent = entityComponents[Comps.ComponentTypes.LinearVelocity] as Comps.LinearVelocity
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

            let angularVelocityComponent = entityComponents[Comps.ComponentTypes.AngularVelocity] as Comps.AngularVelocity
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
