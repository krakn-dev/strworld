import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Comps from "./components.js"
import * as Anims from "./animations.js"

// todo transform, reset timer

export enum Commands {
    TheFirst = 0,
    CreatePlayer = 1,
    MovePlayer = 2,
    SetEntityElementsPositionAndDisplayElement = 3,
    SendComputedElementsToRender = 4,
    CreateShadows = 5,
    WatchDevBox = 6,
    RemoveShadows = 7,
    PlayAnimations = 8,
    UpdateShadowNumber = 9,
    UpdateShadowProperties = 10,
    TickTimer = 11,
    UpdateAnimationTimerNumber = 12,
    CreateAnimationTimers = 13,
    MoveCameraWithPlayer = 14,
    CreateDog = 15,
    MoveDog = 16,
    ApplyForce,
    Collide,
}

export function getInstanceFromEnum(commandEnum: Commands): ECS.Command {
    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst()

        case Commands.MoveCameraWithPlayer:
            return new MoveCameraWithPlayer()

        case Commands.Collide:
            return new Collide()

        case Commands.ApplyForce:
            return new ApplyForce()

        case Commands.MoveDog:
            return new MoveDog()

        case Commands.CreateDog:
            return new CreateDog()

        case Commands.UpdateAnimationTimerNumber:
            return new UpdateAnimationTimerNumber()

        case Commands.TickTimer:
            return new TickTimer()

        case Commands.CreateAnimationTimers:
            return new CreateAnimationTimers()

        case Commands.UpdateShadowProperties:
            return new UpdateShadowProperties()

        case Commands.PlayAnimations:
            return new PlayAnimations()

        case Commands.UpdateShadowNumber:
            return new UpdateShadowNumber()

        case Commands.RemoveShadows:
            return new RemoveShadows()

        case Commands.WatchDevBox:
            return new WatchDevBox()

        case Commands.CreatePlayer:
            return new CreatePlayer()

        case Commands.MovePlayer:
            return new MovePlayer()

        case Commands.SetEntityElementsPositionAndDisplayElement:
            return new SetEntityElementsPositionAndDisplayElement()

        case Commands.SendComputedElementsToRender:
            return new SendComputedElementsToRender()

        case Commands.CreateShadows:
            return new CreateShadows()
    }
}

// the first
export class TheFirst implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.TheFirst
    }

    run(system: ECS.System) {
        // how to ensure they are created in a good order
        //
        // first ensure that commands
        // that depend of some components are created first
        //
        system.addCommand(Commands.CreatePlayer)
        system.addCommand(Commands.CreateDog)
        system.addCommand(Commands.SetEntityElementsPositionAndDisplayElement)
        system.addCommand(Commands.SendComputedElementsToRender)
        system.addCommand(Commands.PlayAnimations)
        system.addCommand(Commands.UpdateAnimationTimerNumber)
        system.addCommand(Commands.TickTimer)
        system.addCommand(Commands.ApplyForce)
        system.addCommand(Commands.Collide)
        system.addCommand(Commands.WatchDevBox)

        system.removeCommand(Commands.TheFirst)
    }
}

// create entity
export class CreateDog implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CreateDog
    }

    run(system: ECS.System) {
        for (let x = 0; x < 5; x++) {
            let dog = Utils.newUid()
            let positionComponent = new Comps.Position(new Utils.Vector3(50 * x + 100, 0, 0), dog)
            let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), dog)
            let massComponent = new Comps.Mass(2, dog)
            let sizeComponent = new Comps.Size(new Utils.Vector3(40, 90, 30), dog)
            let entityStateComponent = new Comps.EntityState(new Map([[Comps.EntityStates.Idle, null]]), dog)
            let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Dog, dog)
            let healthComponent = new Comps.Health(10, dog)
            let animationComponent = new Comps.Animation([new Anims.PlayerIdle(), new Anims.PlayerRunning()], dog)
            let computedElement = new Comps.ComputedElement(Comps.ElementTypes.Entity, dog)
            computedElement.translateX = positionComponent.x
            computedElement.translateY = positionComponent.y
            computedElement.zIndex = positionComponent.y
            computedElement.color = "#ff0000"

            system.addComponent(massComponent)
            system.addComponent(sizeComponent)
            system.addComponent(forceComponent)
            system.addComponent(healthComponent)
            system.addComponent(animationComponent)
            system.addComponent(positionComponent)
            system.addComponent(entityStateComponent)

            system.addComponent(computedElement)
            system.addComponent(entityTypeComponent)
        }

        system.addCommand(Commands.MoveDog)
        system.removeCommand(Commands.CreateDog)
    }
}
export class CreatePlayer implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CreatePlayer
    }

    run(system: ECS.System) {
        for (let x = 0; x < 1; x++) {
            for (let y = 0; y < 1; y++) {
                let player = Utils.newUid()
                let positionComponent = new Comps.Position(new Utils.Vector3(x * 70, y * 70, 0), player)
                let entityStateComponent = new Comps.EntityState(new Map([[Comps.EntityStates.Idle, null]]), player)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Player, player)
                let healthComponent = new Comps.Health(10, player)
                let animationComponent = new Comps.Animation([new Anims.PlayerIdle(), new Anims.PlayerRunning()], player)
                let forceComponent = new Comps.Force(new Utils.Vector3(0, 0, 0), player)
                let massComponent = new Comps.Mass(4, player)
                let sizeComponent = new Comps.Size(new Utils.Vector3(40, 90, 30), player)
                let computedElementComponent = new Comps.ComputedElement(Comps.ElementTypes.Entity, player)
                computedElementComponent.translateX = positionComponent.x
                computedElementComponent.translateY = positionComponent.y
                computedElementComponent.zIndex = positionComponent.y

                system.addComponent(massComponent)
                system.addComponent(sizeComponent)
                system.addComponent(forceComponent)
                system.addComponent(healthComponent)
                system.addComponent(animationComponent)
                system.addComponent(positionComponent)
                system.addComponent(entityStateComponent)
                system.addComponent(computedElementComponent)
                system.addComponent(entityTypeComponent)
            }
        }
        system.addCommand(Commands.MovePlayer)
        system.removeCommand(Commands.CreatePlayer)
    }
}

// movement
export class MovePlayer implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.MovePlayer
    }

    run(system: ECS.System) {

        let delta = system.delta()
        if (delta == null) return

        //        let acceleration = 0.03
        //        let forceLimit = 0.5
        let acceleration = 0.1
        let forceLimit = 1
        // get playerUid
        let foundEntityTypeComponents = system.find([ECS.Get.All, [Comps.Components.EntityType], ECS.By.Any, null])
        if (foundEntityTypeComponents[0].length == 0) {
            console.log("no entity types found")
            return
        }
        let playerUid: number | null = null
        for (let fC of foundEntityTypeComponents[0]) {
            let entityTypeComponent = fC.component as Comps.EntityType
            if (entityTypeComponent.entityType == Comps.EntityTypes.Player) {
                playerUid = entityTypeComponent.entityUid
            }
        }
        if (playerUid == null)
            return

        // if was found, move it
        if (system.input.movementDirection.x == 0 &&
            system.input.movementDirection.y == 0
        ) {
            let foundEntityState = system.find(
                [
                    ECS.Get.All,
                    [
                        Comps.Components.EntityState,
                    ],
                    ECS.By.EntityId,
                    foundEntityTypeComponents[0][0].component.entityUid
                ]
            )
            if (foundEntityState[0].length == 0) {
                console.log("entityState not found")
                return
            }

            for (let fC of foundEntityState[0]) {
                if (fC.component.entityUid == playerUid) {
                    let entityStateComponent = fC.component as Comps.EntityState

                    // cannot change state to idle if wasnt runnning
                    if (entityStateComponent.states.has(Comps.EntityStates.Run)) {
                        system.removeElementFromMapProperty<Comps.EntityState, "states">(
                            fC,
                            "states",
                            Comps.EntityStates.Run
                        )

                        if (entityStateComponent.states.has(Comps.EntityStates.Idle)) return

                        system.addElementToMapProperty<Comps.EntityState, "states">(
                            fC,
                            "states",
                            new Utils.MapEntry(Comps.EntityStates.Idle, null)
                        )
                    }
                    return
                }
            }
        }

        let foundForceComponent = system.find([ECS.Get.One, [Comps.Components.Force], ECS.By.EntityId, playerUid])
        if (foundForceComponent[0].length == 0) {
            console.log("no player force found found")
            return
        }
        let forceComponent = foundForceComponent[0][0].component as Comps.Force
        let newForce = new Utils.Vector2(0, 0)
        newForce.x = forceComponent.x + system.input.movementDirection.x * acceleration
        newForce.y = forceComponent.y + system.input.movementDirection.y * acceleration

        if (Math.abs(newForce.x) > forceLimit) {
            newForce.x = forceLimit * (newForce.x < 0 ? -1 : 1)
        }
        if (Math.abs(newForce.y) > forceLimit) {
            newForce.y = forceLimit * (newForce.y < 0 ? -1 : 1)
        }

        let foundEntityState = system.find(
            [ECS.Get.One, [Comps.Components.EntityState], ECS.By.EntityId, playerUid])

        if (foundEntityState[0].length == 0) {
            console.log("player entityState not found")
            return
        }
        let entityStateComponent = foundEntityState[0][0].component as Comps.EntityState

        if (!entityStateComponent.states.has(Comps.EntityStates.Run)) {
            system.addElementToMapProperty<Comps.EntityState, "states">(
                foundEntityState[0][0],
                "states",
                new Utils.MapEntry(Comps.EntityStates.Run, null)
            )
        }
        if (entityStateComponent.states.has(Comps.EntityStates.Idle)) {
            system.removeElementFromMapProperty<Comps.EntityState, "states">(
                foundEntityState[0][0],
                "states",
                Comps.EntityStates.Idle
            )
        }

        if (system.input.movementDirection.x != 0) {
            system.setProperty<Comps.Force, "x">(
                foundForceComponent[0][0],
                "x",
                newForce.x
            )
        }
        if (system.input.movementDirection.y != 0) {
            system.setProperty<Comps.Force, "y">(
                foundForceComponent[0][0],
                "y",
                newForce.y
            )
        }
    }
}
export class MoveDog implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.MoveDog
    }

    run(system: ECS.System) {

        let delta = system.delta()
        if (delta == null) return

        let acceleration = 0.02
        let forceLimit = 1


        // get dog and player entityTypes
        let foundEntityTypeComponents = system.find([ECS.Get.All, [Comps.Components.EntityType], ECS.By.Any, null])
        if (foundEntityTypeComponents[0].length == 0) {
            console.log("no entity types found")
            return
        }


        for (let fC of foundEntityTypeComponents[0]) {
            // for every dog
            let entityTypeComponent = fC.component as Comps.EntityType
            if (entityTypeComponent.entityType != Comps.EntityTypes.Dog) {
                continue
            }

            // current dog uid
            let dogUid = entityTypeComponent.entityUid

            // dog position
            let foundDogComponents = system.find(
                [ECS.Get.One, [Comps.Components.Position, Comps.Components.TargetLocation, Comps.Components.Force], ECS.By.EntityId, dogUid])
            if (foundDogComponents[0].length == 0 || foundDogComponents[2].length == 0) {
                console.log("no dog component found")
                return
            }
            let dogPositionComponent = foundDogComponents[0][0].component as Comps.Position
            let dogTargetLocationComponent: Comps.TargetLocation | null = null

            if (foundDogComponents[1].length != 0) {
                dogTargetLocationComponent = foundDogComponents[1][0].component as Comps.TargetLocation
            }
            // get closest player
            let closestPlayerPositionComponent: Comps.Position | null = null
            let closestPositionHypothenuse: number | null = null
            // loop through players
            for (let fETC of foundEntityTypeComponents[0]) {
                let entityTypeComponent = fETC.component as Comps.EntityType
                if (entityTypeComponent.entityType == Comps.EntityTypes.Player) {

                    // get player position
                    let foundPlayerPositionComponents = system.find(
                        [ECS.Get.One, [Comps.Components.Position], ECS.By.EntityId, fETC.component.entityUid])
                    if (foundPlayerPositionComponents[0].length == 0) {
                        console.log("no player position found")
                        break
                    }
                    let playerPositionComponent = foundPlayerPositionComponents[0][0].component as Comps.Position

                    // calculate closest player
                    let side1 = playerPositionComponent.x - dogPositionComponent.x
                    let side2 = playerPositionComponent.y - dogPositionComponent.y

                    let hypothenuse = Math.hypot(side1, side2)

                    // if is the first set to closest
                    if (closestPlayerPositionComponent == null) {
                        closestPlayerPositionComponent = playerPositionComponent
                        closestPositionHypothenuse = hypothenuse
                        continue
                    }
                    if (hypothenuse < closestPositionHypothenuse!) {
                        closestPlayerPositionComponent = playerPositionComponent
                        closestPositionHypothenuse = hypothenuse
                    }
                }
            }
            if (closestPlayerPositionComponent == null) {
                console.log("no player to follow")
                return
            }

            let isDogInPlayerRadius = false
            let playerRadius = 200
            if (playerRadius >= closestPositionHypothenuse!) {
                isDogInPlayerRadius = true
            }

            // follow player
            if (!isDogInPlayerRadius) {
                if (dogTargetLocationComponent != null) {
                    system.setProperty<Comps.TargetLocation, "x">
                        (foundDogComponents[1][0], "x", closestPlayerPositionComponent.x)
                    system.setProperty<Comps.TargetLocation, "y">
                        (foundDogComponents[1][0], "y", closestPlayerPositionComponent.y)
                } else {
                    let newTargetLocation = new Comps.TargetLocation(
                        new Utils.Vector2(
                            closestPlayerPositionComponent.x,
                            closestPlayerPositionComponent.y),
                        dogUid)
                    system.addComponent(newTargetLocation)
                }
            }

            // random movement
            if (isDogInPlayerRadius && Utils.randomNumber(1000) == 10) {
                let targetLocation = new Utils.Vector2(0, 0)
                if (Utils.randomNumber(2) == 2) {
                    targetLocation.x = closestPlayerPositionComponent.x + Utils.randomNumber(playerRadius - 50)
                } else {
                    targetLocation.x = closestPlayerPositionComponent.x - Utils.randomNumber(playerRadius - 50)
                }

                if (Utils.randomNumber(2) == 2) {
                    targetLocation.y = closestPlayerPositionComponent.y + Utils.randomNumber(playerRadius - 50)
                } else {
                    targetLocation.y = closestPlayerPositionComponent.y - Utils.randomNumber(playerRadius - 50)
                }
                if (dogTargetLocationComponent != null) {
                    system.setProperty<Comps.TargetLocation, "x">
                        (foundDogComponents[1][0], "x", targetLocation.x)
                    system.setProperty<Comps.TargetLocation, "y">
                        (foundDogComponents[1][0], "y", targetLocation.y)
                } else {
                    let newTargetLocationComponent = new Comps.TargetLocation(
                        new Utils.Vector2(
                            targetLocation.x,
                            targetLocation.y), dogUid)
                    system.addComponent(newTargetLocationComponent)
                }
            }

            if (dogTargetLocationComponent == null) continue

            let direction = new Utils.Vector2(0, 0)

            if ((dogTargetLocationComponent.y - dogPositionComponent.y) > -40) direction.y += 1
            if ((dogTargetLocationComponent.y - dogPositionComponent.y) < 40) direction.y -= 1
            if ((dogTargetLocationComponent.x - dogPositionComponent.x) > -40) direction.x += 1
            if ((dogTargetLocationComponent.x - dogPositionComponent.x) < 40) direction.x -= 1

            let forceComponent = foundDogComponents[2][0].component as Comps.Force
            let resultDogForce =
                new Utils.Vector2(
                    forceComponent.x + direction.x * acceleration,
                    forceComponent.y + direction.y * acceleration)

            if (Math.abs(resultDogForce.x) > forceLimit) {
                if (resultDogForce.x < 0) {
                    resultDogForce.x = -forceLimit
                }
                else {
                    resultDogForce.x = +forceLimit
                }
            }
            if (Math.abs(resultDogForce.y) > forceLimit) {
                if (resultDogForce.y < 0) {
                    resultDogForce.y = -forceLimit
                }
                else {
                    resultDogForce.y = +forceLimit
                }
            }
            // check if arrived at target position
            if (
                Math.abs(dogPositionComponent.x - dogTargetLocationComponent.x) < 1 &&
                Math.abs(dogPositionComponent.y - dogTargetLocationComponent.y) < 1
            ) {
                system.removeComponent(foundDogComponents[1][0])
            }

            if (resultDogForce.x != 0) {
                system.setProperty<Comps.Force, "x">(
                    foundDogComponents[2][0],
                    "x",
                    resultDogForce.x
                )
            }
            if (resultDogForce.y != 0) {
                system.setProperty<Comps.Force, "y">(
                    foundDogComponents[2][0],
                    "y",
                    resultDogForce.y
                )
            }

        }








        //        if (isDogInPlayerRadius) {
        //            let foundEntityState = system.find(
        //                [
        //                    ECS.Get.All,
        //                    [
        //                        Comps.Components.EntityState,
        //                    ],
        //                    ECS.By.EntityId,
        //                    dogUid
        //                ]
        //            )
        //            if (foundEntityState[0].length == 0) {
        //                console.log("dog entityState not found")
        //                return
        //            }
        //
        //            let entityStateComponent = foundEntityState[0][0].component as Comps.EntityState
        //
        //            // cannot change state to idle if wasnt runnning
        //            if (entityStateComponent.states.has(Comps.EntityStates.Run)) {
        //                system.removeElementFromMapProperty<Comps.EntityState, "states">(
        //                    foundEntityState[0][0],
        //                    "states",
        //                    Comps.EntityStates.Run
        //                )
        //
        //                if (entityStateComponent.states.has(Comps.EntityStates.Idle)) return
        //
        //                system.addElementToMapProperty<Comps.EntityState, "states">(
        //                    foundEntityState[0][0],
        //                    "states",
        //                    new Utils.MapEntry(Comps.EntityStates.Idle, null)
        //                )
        //            }
        //            return
        //
        //
        //        }

        // move to desired target position

        //        let foundEntityState = system.find(
        //            [
        //                ECS.Get.All,
        //                [
        //                    Comps.Components.EntityState,
        //                ],
        //                ECS.By.EntityId,
        //                dogUid
        //            ]
        //        )
        //        if (foundEntityState[0].length == 0) {
        //            console.log("dog entityState not found")
        //            return
        //        }

        //  let entityStateComponent = foundEntityState[0][0].component as Comps.EntityState

        //  if (!entityStateComponent.states.has(Comps.EntityStates.Run)) {
        //      system.addElementToMapProperty<Comps.EntityState, "states">(
        //          foundEntityState[0][0],
        //          "states",
        //          new Utils.MapEntry(Comps.EntityStates.Run, null)
        //      )
        //  }
        //  if (entityStateComponent.states.has(Comps.EntityStates.Idle)) {
        //      system.removeElementFromMapProperty<Comps.EntityState, "states">(
        //          foundEntityState[0][0],
        //          "states",
        //          Comps.EntityStates.Idle
        //      )
        //  }
    }
}

// camera
export class MoveCameraWithPlayer implements ECS.Command {
    // move computed element's position to emulate camera movement
    readonly type: Commands
    constructor() {
        this.type = Commands.MoveCameraWithPlayer
    }

    run(system: ECS.System) {
        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null])

        let playerPosition = new Utils.Vector2(0, 0)
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Position) continue
            let positionComponent = cC.component as Comps.Position
            let foundComponents = system.find(
                [ECS.Get.All, [Comps.Components.EntityType], ECS.By.Any, null])

            let entityTypeComponent = foundComponents[0][0].component as Comps.EntityType
            if (entityTypeComponent.entityType == Comps.EntityTypes.Player) {

            }
        }

        //        for (let fC of foundComponents[0]) {
        //            let computedElementComponent = fC.component as Comps.ComputedElement
        //
        //            if (computedElementComponent.entityUid ==
        //                positionComponent.entityUid
        //            ) {
        //                system.setProperty<Comps.ComputedElement, "translateY">(
        //                    fC, "translateY", positionComponent.y - 10)
        //                system.setProperty<Comps.ComputedElement, "isTranslateYChanged">(
        //                    fC, "isTranslateYChanged", true)
        //
        //                system.setProperty<Comps.ComputedElement, "translateX">(
        //                    fC, "translateX", positionComponent.x - 10)
        //                system.setProperty<Comps.ComputedElement, "isTranslateXChanged">(
        //                    fC, "isTranslateXChanged", true)
        //
        //                system.setProperty<Comps.ComputedElement, "isChanged">(
        //                    fC, "isChanged", true)
        //                break;
        //            }
        //        }




    }
}

// shadows elements
export class UpdateShadowProperties implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.UpdateShadowProperties
    }

    run(system: ECS.System) {
        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null])

        for (let cC of system.componentDiffs.changedComponents) {

            if (cC.component.type == Comps.Components.Animation) {
                let animationComponent = cC.component as Comps.Animation

                for (let fC of foundComponents[0]) {
                    let computedElementComponent = fC.component as Comps.ComputedElement

                    if (computedElementComponent.entityUid ==
                        animationComponent.entityUid &&
                        computedElementComponent.elementType ==
                        Comps.ElementTypes.Shadow
                    ) {
                        system.setProperty<Comps.ComputedElement, "displayElement">(
                            fC, "displayElement", animationComponent.currentDisplayElement)
                        system.setProperty<Comps.ComputedElement, "isDisplayElementChanged">(
                            fC, "isDisplayElementChanged", true)
                        system.setProperty<Comps.ComputedElement, "isChanged">(
                            fC, "isChanged", true)
                        break;
                    }
                }
            }
            if (cC.component.type == Comps.Components.Position) {
                let position = cC.component as Comps.Position

                for (let fC of foundComponents[0]) {
                    let computedElement = fC.component as Comps.ComputedElement

                    if (computedElement.entityUid ==
                        position.entityUid &&
                        computedElement.elementType ==
                        Comps.ElementTypes.Shadow
                    ) {
                        system.setProperty<Comps.ComputedElement, "translateY">(
                            fC, "translateY", position.y - 10)
                        system.setProperty<Comps.ComputedElement, "isTranslateYChanged">(
                            fC, "isTranslateYChanged", true)

                        system.setProperty<Comps.ComputedElement, "translateX">(
                            fC, "translateX", position.x - 10)
                        system.setProperty<Comps.ComputedElement, "isTranslateXChanged">(
                            fC, "isTranslateXChanged", true)

                        system.setProperty<Comps.ComputedElement, "isChanged">(
                            fC, "isChanged", true)
                        break;
                    }
                }
            }
        }
    }
}
export class RemoveShadows implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.RemoveShadows
    }
    run(system: ECS.System) {
        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null])

        for (let fC of foundComponents[0]) {
            let computedElement = fC.component as Comps.ComputedElement

            if (computedElement.elementType == Comps.ElementTypes.Shadow) {
                system.removeComponent(fC)
            }
        }

        system.removeCommand(this.type)
    }
}
export class UpdateShadowNumber implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.UpdateShadowNumber
    }

    run(system: ECS.System) {
        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null])

        if (foundComponents[0].length == 0) return
        // check for added entities
        for (let aC of system.componentDiffs.addedComponents) {
            if (aC.component.type != Comps.Components.ComputedElement) continue
            if ((aC.component as Comps.ComputedElement).elementType != Comps.ElementTypes.Entity) continue

            let computedElement = aC.component as Comps.ComputedElement

            let shadowElement = new Comps.ComputedElement(
                Comps.ElementTypes.Shadow,
                computedElement.entityUid)

            shadowElement.color = "#aaa"

            shadowElement.translateX =
                computedElement.translateX - 10

            shadowElement.translateY =
                computedElement.translateY - 10

            shadowElement.zIndex = -1

            system.addComponent(shadowElement)
        }

        // check for removed entities
        for (let rC of system.componentDiffs.removedComponents) {
            if (rC.component.type != Comps.Components.ComputedElement) continue
            if ((rC.component as Comps.ComputedElement).elementType != Comps.ElementTypes.Entity) continue


            for (let fC of foundComponents[0]) {
                if (fC.component.entityUid != rC.component.entityUid) continue
                if ((fC.component as Comps.ComputedElement).elementType != Comps.ElementTypes.Shadow) continue

                system.removeComponent(fC)
                break;
            }
        }
    }
}
export class CreateShadows implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CreateShadows
    }

    run(system: ECS.System) {
        // first time run

        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null])

        for (let fC of foundComponents[0]) {
            let computedElement = fC.component as Comps.ComputedElement
            if (computedElement.elementType == Comps.ElementTypes.Entity) {
                let shadowElement = new Comps.ComputedElement(
                    Comps.ElementTypes.Shadow,
                    computedElement.entityUid)
                shadowElement.color = "#666"

                shadowElement.translateX =
                    computedElement.translateX - 10

                shadowElement.translateY =
                    computedElement.translateY - 10

                shadowElement.displayElement =
                    computedElement.displayElement

                shadowElement.zIndex = -1

                system.addComponent(shadowElement)

            }
        }
        system.addCommand(Commands.UpdateShadowNumber)
        system.addCommand(Commands.UpdateShadowProperties)

        system.removeCommand(this.type)
    }
}

// computed elements
export class SendComputedElementsToRender implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.SendComputedElementsToRender
    }

    run(system: ECS.System) {
        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null])

        if (foundComponents[0].length == 0) return

        let graphicDiff = new Utils.GraphicDiff()

        // for changed
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.ComputedElement) continue
            let computedElementComponent = cC.component as Comps.ComputedElement

            if (!computedElementComponent.isChanged) continue

            graphicDiff.changedComputedElements.push(cC)
            // set properties to not changed
            system.setProperty<Comps.ComputedElement, "isChanged">(
                cC, "isChanged", false)

            if (computedElementComponent.addedClasses.size != 0)
                system.removeElementFromMapProperty<Comps.ComputedElement, "addedClasses">(
                    cC, "addedClasses", null, true)

            if (computedElementComponent.removedClasses.size != 0)
                system.removeElementFromMapProperty<Comps.ComputedElement, "removedClasses">(
                    cC, "removedClasses", null, true)

            if (computedElementComponent.isTranslateXChanged)
                system.setProperty<Comps.ComputedElement, "isTranslateXChanged">(
                    cC, "isTranslateXChanged", false)
            if (computedElementComponent.isTranslateYChanged)
                system.setProperty<Comps.ComputedElement, "isTranslateYChanged">(
                    cC, "isTranslateYChanged", false)
            if (computedElementComponent.isZIndexChanged)
                system.setProperty<Comps.ComputedElement, "isZIndexChanged">(
                    cC, "isZIndexChanged", false)
            if (computedElementComponent.isColorChanged)
                system.setProperty<Comps.ComputedElement, "isColorChanged">(
                    cC, "isColorChanged", false)
            if (computedElementComponent.isDisplayElementChanged)
                system.setProperty<Comps.ComputedElement, "isDisplayElementChanged">(
                    cC, "isDisplayElementChanged", false)
        }
        // check for new
        for (let aC of system.componentDiffs.addedComponents) {
            if (aC.component.type == Comps.Components.ComputedElement) {
                graphicDiff.addedComputedElements.push(aC)
            }

        }
        // check for removed
        for (let rC of system.componentDiffs.removedComponents) {
            if (rC.component.type == Comps.Components.ComputedElement) {
                graphicDiff.removedComputedElements.push(rC)
            }
        }

        if (graphicDiff.addedComputedElements.length == 0 &&
            graphicDiff.removedComputedElements.length == 0 &&
            graphicDiff.changedComputedElements.length == 0
        ) {
            return
        }
        postMessage(new Utils.Message(Utils.Messages.RenderIt, graphicDiff))
    }
}

// entity elements
export class SetEntityElementsPositionAndDisplayElement implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.SetEntityElementsPositionAndDisplayElement
    }

    run(system: ECS.System) {

        let foundComponents =
            system.find(
                [
                    ECS.Get.All,
                    [
                        Comps.Components.ComputedElement,
                    ],
                    ECS.By.Any,
                    null
                ])
        // position
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Position) continue
            let position = cC.component as Comps.Position

            for (let fC of foundComponents[0]) {
                let computedElement = fC.component as Comps.ComputedElement

                if (computedElement.entityUid ==
                    position.entityUid &&
                    computedElement.elementType ==
                    Comps.ElementTypes.Entity
                ) {
                    system.setProperty<Comps.ComputedElement, "isChanged">(
                        fC, "isChanged", true)

                    system.setProperty<Comps.ComputedElement, "translateY">(
                        fC, "translateY", position.y)
                    system.setProperty<Comps.ComputedElement, "isTranslateYChanged">(
                        fC, "isTranslateYChanged", true)

                    system.setProperty<Comps.ComputedElement, "translateX">(
                        fC, "translateX", position.x)
                    system.setProperty<Comps.ComputedElement, "isTranslateXChanged">(
                        fC, "isTranslateXChanged", true)

                    system.setProperty<Comps.ComputedElement, "zIndex">(
                        fC, "zIndex", position.y)
                    system.setProperty<Comps.ComputedElement, "isZIndexChanged">(
                        fC, "isZIndexChanged", true)
                    break;
                }
            }
        }

        // displayElement
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Animation) continue
            let animationComponent = cC.component as Comps.Animation

            for (let fC of foundComponents[0]) {
                let computedElementComponent = fC.component as Comps.ComputedElement

                if (computedElementComponent.entityUid ==
                    animationComponent.entityUid &&
                    computedElementComponent.elementType ==
                    Comps.ElementTypes.Entity
                ) {
                    system.setProperty<Comps.ComputedElement, "isChanged">(
                        fC, "isChanged", true)
                    system.setProperty<Comps.ComputedElement, "displayElement">(
                        fC, "displayElement", animationComponent.currentDisplayElement)
                    system.setProperty<Comps.ComputedElement, "isDisplayElementChanged">(
                        fC, "isDisplayElementChanged", true)
                    break;
                }
            }
        }
    }
}

// animation
export class CreateAnimationTimers implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CreateAnimationTimers
    }

    run(system: ECS.System) {

        let foundComponents = system.find([
            ECS.Get.All,
            [
                Comps.Components.Animation,
            ],
            ECS.By.Any,
            null
        ])
        if (foundComponents[0].length == 0) console.log("there are not animation components")
        for (let fC of foundComponents[0]) {
            let foundComponents = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                ],
                ECS.By.EntityId,
                fC.component.entityUid
            ])
            if (foundComponents[0].length == 0) {
                console.log("entityState component missing")
                continue;
            }

            let entityState = foundComponents[0][0].component as Comps.EntityState
            let animation = fC.component as Comps.Animation

            let currentStateAnimation: Anims.Animation | null = null;
            for (let a of animation.animations) {
                if (entityState.states.has(a.executeOn)) {
                    currentStateAnimation = a
                }
            }
            if (currentStateAnimation == null) continue

            let timer = new Comps.Timer(
                currentStateAnimation.frames[currentStateAnimation.frames.length - 1].frameTime,
                Comps.TimerTypes.Animation,
                entityState.entityUid
            )
            system.addComponent(timer)
            system.setProperty<Comps.Animation, "currentDisplayElement">(
                foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0].frameDisplay
            )

        }
        system.removeCommand(this.type)
    }
}
export class UpdateAnimationTimerNumber implements ECS.Command {
    // Creates and deletes animation timers
    readonly type: Commands
    constructor() {
        this.type = Commands.UpdateAnimationTimerNumber
    }
    run(system: ECS.System) {
        // on new graphic entity
        for (let aC of system.componentDiffs.addedComponents) {

            // get added animation components
            if (aC.component.type != Comps.Components.Animation) continue


            // get entityState Components
            let foundComponents = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                ],
                ECS.By.EntityId,
                aC.component.entityUid
            ])
            if (foundComponents[0].length == 0) {
                console.log("entityState component missing")
                continue;
            }

            let entityStateComponent = foundComponents[0][0].component as Comps.EntityState
            let animationAddedComponent = aC.component as Comps.Animation

            let currentStateAnimation: Anims.Animation | null = null
            let isFirstTime = true
            for (let a of animationAddedComponent.animations) {
                if (entityStateComponent.states.has(a.executeOn)) {
                    if (isFirstTime) {
                        currentStateAnimation = a
                        isFirstTime = false
                        continue;
                    }
                    if (a.priority > currentStateAnimation!.priority) {
                        currentStateAnimation = a
                    }
                }
            }
            if (currentStateAnimation == null) continue

            let timer = new Comps.Timer(
                currentStateAnimation.frames[currentStateAnimation.frames.length - 1].frameTime,
                Comps.TimerTypes.Animation,
                entityStateComponent.entityUid
            )
            system.addComponent(timer)
            system.setProperty<Comps.Animation, "currentDisplayElement">(
                foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0].frameDisplay!
            )
            console.log("added timer")
        }
        // on graphic entity removed
        for (let cC of system.componentDiffs.removedComponents) {
            if (cC.component.type != Comps.Components.Animation) continue

            let foundComponents = system.find([
                ECS.Get.All,
                [
                    Comps.Components.Timer,
                ],
                ECS.By.EntityId,
                cC.component.entityUid
            ])
            if (foundComponents[0].length == 0) {
                console.log("timer component missing")
                continue;
            }
            let timer = foundComponents[0][0].component as Comps.Timer
            if (timer.timerType == Comps.TimerTypes.Animation) {
                system.removeComponent(foundComponents[0][0])
                console.log("removed timer")
            }
        }
    }
}
export class PlayAnimations implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.PlayAnimations
    }

    run(system: ECS.System) {
        let updatedTimersUid = []

        // change animation for entity state change
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.EntityState) continue

            let foundComponents = system.find([
                ECS.Get.All,
                [Comps.Components.Animation, Comps.Components.Timer],
                ECS.By.EntityId,
                cC.component.entityUid])
            if (foundComponents[0].length == 0) {
                console.log("animation component missing")
                break;
            }

            let timer: ECS.ComponentAndIndex | null = null
            for (let t of foundComponents[1]) {
                if ((t.component as Comps.Timer).timerType == Comps.TimerTypes.Animation) {
                    timer = t
                }
            }
            if (timer == null) continue

            let animationComponent = foundComponents[0][0].component as Comps.Animation
            let entityStateComponent = cC.component as Comps.EntityState

            let currentStateAnimation: Anims.Animation | null = null
            let isFirstTime = true
            for (let a of animationComponent.animations) {
                if (entityStateComponent.states.has(a.executeOn)) {
                    if (isFirstTime) {
                        currentStateAnimation = a
                        isFirstTime = false
                        continue;
                    }
                    if (a.priority > currentStateAnimation!.priority) {
                        currentStateAnimation = a
                    }
                }
            }
            if (currentStateAnimation == null) continue

            updatedTimersUid.push(timer.component.componentUid)
            system.setProperty<Comps.Timer, "originalTime">(
                timer,
                "originalTime",
                currentStateAnimation.frames[currentStateAnimation.frames.length - 1].frameTime
            )
            system.setProperty<Comps.Timer, "isRestart">(
                timer, "isRestart", true)
            //            system.setProperty<Comps.Animation, "currentDisplayElement">(
            //                foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0]!)
        }

        // play next frame

        // get animation timers
        let foundTimers = system.find(
            [ECS.Get.All, [Comps.Components.Timer], ECS.By.Any, null])
        if (foundTimers[0].length == 0) {
            console.log("no timers")
            return;
        }
        for (let fC of foundTimers[0]) {
            // check if is an updated timer
            let isFound = false
            for (let uT of updatedTimersUid) {
                if (fC.component.componentUid == uT) {
                    isFound = true
                    break;
                }
            }
            if (isFound) continue
            // check that are animation timers
            let timerComponent = fC.component as Comps.Timer
            if (timerComponent.timerType != Comps.TimerTypes.Animation) continue

            // if timer is finised restart it 
            if (timerComponent.isFinished) {
                system.setProperty<Comps.Timer, "isRestart">(fC, "isRestart", true)
                continue
            }

            // get animations and entity states
            let foundComponents = system.find(
                [ECS.Get.One,
                [Comps.Components.Animation, Comps.Components.EntityState],
                ECS.By.EntityId,
                timerComponent.entityUid])
            if (foundComponents[0].length == 0) {
                console.log("animation component missing")
                break;
            }
            if (foundComponents[1].length == 0) {
                console.log("entityState component missing")
                break;
            }
            let animationComponent = foundComponents[0][0].component as Comps.Animation
            let entityStateComponent = foundComponents[1][0].component as Comps.EntityState

            // get playing animation based on EntityState
            let currentStateAnimation: Anims.Animation | null = null
            let isFirstTime = true
            for (let a of animationComponent.animations) {
                if (entityStateComponent.states.has(a.executeOn)) {
                    if (isFirstTime) {
                        currentStateAnimation = a
                        isFirstTime = false
                        continue;
                    }
                    if (a.priority > currentStateAnimation!.priority) {
                        currentStateAnimation = a
                    }
                }
            }
            if (currentStateAnimation == null) continue


            // get current animation frame
            let elapsedTime = timerComponent.originalTime - timerComponent.timeLeft
            let currentFrameIndex = 0
            for (let [fI, f] of currentStateAnimation.frames.entries()) {
                if (f.frameTime > elapsedTime && fI != 0) {
                    currentFrameIndex = fI - 1
                    break;
                }
                if (f.isEndFrame) currentFrameIndex = fI - 1
            }
            if (currentStateAnimation.frames[currentFrameIndex].frameDisplay ==
                animationComponent.currentDisplayElement)
                continue
            // // if already is in this frame
            //            if (currentStateAnimation.frames[currentFrameIndex] ==
            //                animation.currentDisplayElement)
            //                continue
            //            console.log(elapsedTime,
            //                currentFrameIndex
            //                //                currentStateAnimation
            //                //                    .frames[currentFrameIndex]!
            //                //                    .charCodeAt(0)
            //                //                    .toString()
            //                //                    .split("")
            //                //                    .map((e, i) => { if (i > 2) return e })
            //                //                    .join("")
            //            )

            //currentFrameIndex
            //                currentStateAnimation
            //                    .frames[currentFrameIndex]!
            //                    .charCodeAt(0)
            //                    .toString()
            //                    .split("")
            //                    .map((e, i) => { if (i > 2) return e })
            //                    .join("")

            system.setProperty<Comps.Animation, "currentDisplayElement">(
                foundComponents[0][0],
                "currentDisplayElement",
                currentStateAnimation.frames[currentFrameIndex].frameDisplay
            )
        }
    }
}

// timer
export class TickTimer implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.TickTimer
    }

    run(system: ECS.System) {
        let delta = system.delta()
        if (delta == null) return

        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.Timer], ECS.By.Any, null])

        for (let fC of foundComponents[0]) {
            let timer = fC.component as Comps.Timer

            if (timer.isRestart) {
                system.setProperty<Comps.Timer, "timeLeft">(fC, "timeLeft", timer.originalTime)
                system.setProperty<Comps.Timer, "isFinished">(fC, "isFinished", false)
                system.setProperty<Comps.Timer, "isRestart">(fC, "isRestart", false)
                continue
            }

            if (timer.isFinished) continue

            let newTimeLeft = timer.timeLeft - delta

            system.setProperty<Comps.Timer, "timeLeft">(fC, "timeLeft", newTimeLeft)
            if (newTimeLeft <= 0) {
                system.setProperty<Comps.Timer, "isFinished">(fC, "isFinished", true)
            }
        }
    }
}

// devbox
export class WatchDevBox implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.WatchDevBox
    }

    run(system: ECS.System) {
        // Add commands
        if (system.devBox.isEnableFreeCamera && !system.getState("isEnableFreeCamera")) {
            system.setState("isEnableFreeCamera", true)
        }

        if (system.devBox.isEnablePhysics && !system.getState("isEnablePhysics")) {
            system.setState("isEnablePhysics", true)
        }

        if (system.devBox.isSetNight && !system.getState("isSetNight")) {
            system.setState("isSetNight", true)
        }
        if (system.devBox.isShadowsEnabled && !system.getState("isEnableShadows")) {
            system.addCommand(Commands.CreateShadows)
            system.setState("isEnableShadows", true)
        }

        // Remove commands
        if (!system.devBox.isEnableFreeCamera && system.getState("isEnableFreeCamera")) {
            system.setState("isEnableFreeCamera", false)
        }

        if (!system.devBox.isEnablePhysics && system.getState("isEnablePhysics")) {
            system.setState("isEnablePhysics", false)
        }

        if (!system.devBox.isSetNight && system.getState("isSetNight")) {
            system.setState("isSetNight", false)
        }
        if (!system.devBox.isShadowsEnabled && system.getState("isEnableShadows")) {
            system.removeCommand(Commands.UpdateShadowNumber)
            system.removeCommand(Commands.UpdateShadowProperties)
            system.addCommand(Commands.RemoveShadows)

            system.setState("isEnableShadows", false)
        }

    }
}

// physics
export class ApplyForce implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.ApplyForce
    }

    run(system: ECS.System) {
        let delta = system.delta()
        if (delta == null) return

        let foundForceComponents = system.find(
            [ECS.Get.All, [Comps.Components.Force], ECS.By.Any, null])
        if (foundForceComponents[0].length == 0) {
            console.log("no force components")
            return
        }

        for (let fFC of foundForceComponents[0]) {

            let foundPositionComponents = system.find(
                [ECS.Get.One, [Comps.Components.Position, Comps.Components.Mass], ECS.By.EntityId, fFC.component.entityUid])
            if (foundPositionComponents[0].length == 0 || foundPositionComponents[1].length == 0) {
                console.log("no position or mass component")
                return
            }

            let forceComponent = fFC.component as Comps.Force
            let positionComponent = foundPositionComponents[0][0].component as Comps.Position
            let massComponent = foundPositionComponents[1][0].component as Comps.Mass

            let velocity = new Utils.Vector2(0, 0)
            let airDrag = 0.005
            let resultForce = new Utils.Vector2(0, 0)

            // apply air drag
            if (forceComponent.x < 0) {
                velocity.x = forceComponent.x / massComponent.mass
                resultForce.x = forceComponent.x + airDrag
            }
            if (forceComponent.x > 0) {
                velocity.x = forceComponent.x / massComponent.mass
                resultForce.x = forceComponent.x - airDrag
            }
            if (forceComponent.y < 0) {
                velocity.y = forceComponent.y / massComponent.mass
                resultForce.y = forceComponent.y + airDrag
            }
            if (forceComponent.y > 0) {
                velocity.y = forceComponent.y / massComponent.mass
                resultForce.y = forceComponent.y - airDrag
            }

            // make mass not invert velocity, ex. force < mass
            if (forceComponent.x > 0 && velocity.x < 0 || forceComponent.x < 0 && velocity.x > 0) {
                velocity.x = 0
            }
            if (forceComponent.y > 0 && velocity.y < 0 || forceComponent.y < 0 && velocity.y > 0) {
                velocity.y = 0
            }

            // make force dont invert because of drag
            if (forceComponent.x > 0 && resultForce.x < 0 || forceComponent.x < 0 && resultForce.x > 0) {
                resultForce.x = 0
            }
            if (forceComponent.y > 0 && resultForce.y < 0 || forceComponent.y < 0 && resultForce.y > 0) {
                resultForce.y = 0
            }

            //let airDrag = 0.001
            // for x
            if (velocity.x != 0) {
                system.setProperty<Comps.Position, "x">(
                    foundPositionComponents[0][0], "x", positionComponent.x + velocity.x * delta)

                // forces always should always go towards 0
                system.setProperty<Comps.Force, "x">(
                    fFC, "x", resultForce.x)
            }
            // for y
            if (velocity.y != 0) {
                system.setProperty<Comps.Position, "y">(
                    foundPositionComponents[0][0], "y", positionComponent.y + velocity.y * delta)

                system.setProperty<Comps.Force, "y">(
                    fFC, "y", resultForce.y)
            }
        }
    }
}
export class Collide implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.Collide
    }

    run(system: ECS.System) {
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Force) continue


            let giverFoundComponents = system.find(
                [ECS.Get.One, [Comps.Components.Position, Comps.Components.Size, Comps.Components.Mass], ECS.By.EntityId, cC.component.entityUid])
            if (giverFoundComponents[0].length == 0) {
                console.log("no position component")
                return
            }

            let giverForceComponent = cC.component as Comps.Force
            let giverPositionComponent = giverFoundComponents[0][0].component as Comps.Position
            let giverSizeComponent = giverFoundComponents[1][0].component as Comps.Size
            let giverMassComponent = giverFoundComponents[2][0].component as Comps.Mass

            let foundTakerSizeComponents = system.find(
                [ECS.Get.All, [Comps.Components.Size], ECS.By.Any, null])

            for (let fSC of foundTakerSizeComponents[0]) {
                if (fSC.component.entityUid == cC.component.entityUid) continue
                let foundComponents = system.find(
                    [ECS.Get.One, [Comps.Components.Position, Comps.Components.Force, Comps.Components.Mass], ECS.By.EntityId, fSC.component.entityUid])
                if (foundComponents[0].length == 0) {
                    console.log("no position found")
                    continue
                }
                if (foundComponents[1].length == 0) {
                    continue
                }
                let takerSizeComponent = fSC.component as Comps.Size
                let takerPositionComponent = foundComponents[0][0].component as Comps.Position
                let takerForceComponent = foundComponents[1][0].component as Comps.Force
                let takerMassComponent = foundComponents[2][0].component as Comps.Mass

                // from, to
                let xRange1 = [
                    giverPositionComponent.x - giverSizeComponent.x / 2,
                    giverPositionComponent.x + giverSizeComponent.x / 2]
                let yRange1 = [
                    giverPositionComponent.y - giverSizeComponent.y / 2,
                    giverPositionComponent.y + giverSizeComponent.y / 2]

                let xRange2 = [
                    takerPositionComponent.x - (takerSizeComponent.x / 2),
                    takerPositionComponent.x + (takerSizeComponent.x / 2)]
                let yRange2 = [
                    takerPositionComponent.y - (takerSizeComponent.y / 2),
                    takerPositionComponent.y + (takerSizeComponent.y / 2)]

                let numberHitPoints = 0
                let touchingDirection = new Utils.Vector2(0, 0)
                if (
                    xRange1[1] >= xRange2[0] &&
                    !(xRange1[0] > xRange2[0]) &&
                    !(xRange1[0] == xRange2[0] && xRange1[1] == xRange2[1])
                ) {
                    numberHitPoints += 1
                    touchingDirection.x += 1
                }
                if (
                    xRange1[0] <= xRange2[1] &&
                    !(xRange1[1] < xRange2[1]) &&
                    !(xRange1[0] == xRange2[0] && xRange1[1] == xRange2[1])
                ) {
                    numberHitPoints += 1
                    touchingDirection.x -= 1
                }
                if (
                    yRange1[1] >= yRange2[0] &&
                    !(yRange1[0] > yRange2[0]) &&
                    !(yRange1[0] == yRange2[0] && yRange1[1] == yRange2[1])
                ) {
                    numberHitPoints += 1
                    touchingDirection.y += 1
                }
                if (
                    yRange1[0] <= yRange2[1] &&
                    !(yRange1[1] < yRange2[1]) &&
                    !(yRange1[0] == yRange2[0] && yRange1[1] == yRange2[1])
                ) {
                    numberHitPoints += 1
                    touchingDirection.y -= 1
                }
                if (yRange1[0] == yRange2[0] && yRange1[1] == yRange2[1]) {
                    numberHitPoints += 1
                }
                if (xRange1[0] == xRange2[0] && xRange1[1] == xRange2[1]) {
                    numberHitPoints += 1
                }

                if (numberHitPoints < 2) continue
                let forceDirection = new Utils.Vector2(0, 0)
                if (giverForceComponent.x > 0) {
                    forceDirection.x += 1
                }
                if (giverForceComponent.y > 0) {
                    forceDirection.y += 1
                }
                if (giverForceComponent.x < 0) {
                    forceDirection.x -= 1
                }
                if (giverForceComponent.y < 0) {
                    forceDirection.y -= 1
                }

                //if (takerMassComponent.mass == takerMassComponent.mass) {
                //    //skip
                //}

                //let giverNewForce = new Utils.Vector2(0, 0)
                //let takerNewForce = new Utils.Vector2(0, 0)

                //// one has more mass
                //if (giverMassComponent.mass != takerMassComponent.mass) {
                //    if (giverMassComponent.mass > takerMassComponent.mass) {
                //    }
                //}
                //// they are the same mass
                //if () { }

                // console.log(forceDirection)
                // calculate force taken for moving it out of reach
                // substract force took for moving it
                if (forceDirection.x == touchingDirection.x && forceDirection.x != 0) {
                    system.setProperty<Comps.Force, "x">(
                        foundComponents[1][0],
                        "x",
                        giverForceComponent.x + takerForceComponent.x)
                    system.setProperty<Comps.Force, "x">(cC, "x", 0)
                    system.setProperty<Comps.Position, "x">(
                        giverFoundComponents[0][0],
                        "x",
                        giverPositionComponent.x - giverForceComponent.x)
                }
                if (forceDirection.y == touchingDirection.y && forceDirection.y != 0) {
                    system.setProperty<Comps.Force, "y">(
                        foundComponents[1][0],
                        "y",
                        giverForceComponent.y + takerForceComponent.y)
                    system.setProperty<Comps.Force, "y">(cC, "y", 0)
                    system.setProperty<Comps.Position, "y">(
                        giverFoundComponents[0][0],
                        "y",
                        giverPositionComponent.y - giverForceComponent.y)
                }
            }
        }
    }
}
