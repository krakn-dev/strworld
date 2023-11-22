import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Comps from "./components.js"
import * as Anims from "./animations.js"

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
}

export function getInstanceFromEnum(commandEnum: Commands): ECS.Command {
    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst()

        case Commands.MoveCameraWithPlayer:
            return new MoveCameraWithPlayer()

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
        system.addCommand(Commands.SetEntityElementsPositionAndDisplayElement)
        system.addCommand(Commands.SendComputedElementsToRender)
        system.addCommand(Commands.PlayAnimations)
        system.addCommand(Commands.UpdateAnimationTimerNumber)
        system.addCommand(Commands.TickTimer)
        //        system.addCommand(Commands.CreateAnimationTimers)
        system.addCommand(Commands.WatchDevBox)

        system.removeCommand(Commands.TheFirst)
    }
}

// player
export class CreatePlayer implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CreatePlayer
    }

    run(system: ECS.System) {
        for (let x = 0; x < 1; x++) {
            for (let y = 0; y < 1; y++) {
                let player = Utils.newUid()
                let positionComponent = new Comps.Position(x * 70, y * 70, player)
                let entityStateComponent = new Comps.EntityState(new Map([[Comps.EntityStates.Idle, null]]), player)
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Player, player)
                let healthComponent = new Comps.Health(10, player)
                let animationComponent = new Comps.Animation([new Anims.PlayerIdle(), new Anims.PlayerRunning()], player)
                let computedElement = new Comps.ComputedElement(Comps.ElementTypes.Entity, player)
                computedElement.translateX = positionComponent.x
                computedElement.translateY = positionComponent.y
                computedElement.zIndex = y

                system.addComponent(healthComponent)
                system.addComponent(animationComponent)
                system.addComponent(positionComponent)
                system.addComponent(entityStateComponent)
                system.addComponent(computedElement)
                system.addComponent(entityTypeComponent)
            }
        }
        system.addCommand(Commands.MovePlayer)
        system.removeCommand(Commands.CreatePlayer)
    }
}
export class MovePlayer implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.MovePlayer
    }

    run(system: ECS.System) {

        let delta = system.delta()
        if (delta == null) return

        let velocity = 0.3


        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Position], ECS.By.Any, null])
        if (foundComponents[0].length == 0) {
            return
        }

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
                    foundComponents[0][0].component.entityUid
                ]
            )
            if (foundEntityState[0].length == 0) {
                console.log("entityState not found")
                return
            }

            let entityStateComponent = foundEntityState[0][0].component as Comps.EntityState
            // cannot change state if

            if (entityStateComponent.states.has(Comps.EntityStates.Run)) {
                system.removeElementFromMapProperty<Comps.EntityState, "states">(
                    foundEntityState[0][0],
                    "states",
                    Comps.EntityStates.Run
                )

                if (entityStateComponent.states.has(Comps.EntityStates.Idle)) return

                system.addElementToMapProperty<Comps.EntityState, "states">(
                    foundEntityState[0][0],
                    "states",
                    new Utils.MapEntry(Comps.EntityStates.Idle, null)
                )
            }
            return
        }

        let fC = foundComponents[0][0]

        let positionComponent = (fC.component as Comps.Position)
        let newPosition = new Utils.Vector2(positionComponent.x, positionComponent.y)
        newPosition.x += system.input.movementDirection.x * delta * velocity
        newPosition.y += system.input.movementDirection.y * delta * velocity

        let foundEntityState = system.find(
            [ECS.Get.One, [Comps.Components.EntityState], ECS.By.EntityId, fC.component.entityUid])

        if (foundEntityState[0].length == 0) {
            console.log("entityState not found")
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

        if (newPosition.x != positionComponent.x) {
            system.setProperty<Comps.Position, "x">(
                fC,
                "x",
                newPosition.x
            )
        }
        if (newPosition.y != positionComponent.y) {
            system.setProperty<Comps.Position, "y">(
                fC,
                "y",
                newPosition.y
            )
        }
    }
}

// Camera
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
            if (cC.component.type != Comps.Components.Position) continue
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

                shadowElement.zIndex = -1

                system.addComponent(shadowElement)

            }
        }
        system.addCommand(Commands.UpdateShadowNumber)
        system.addCommand(Commands.UpdateShadowProperties)

        system.removeCommand(this.type)
    }
}

// computed Elements
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
                console.log("restart")
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
        // run first time
        if (system.getState("isSetCommandsAreNotCreated") == null) {
            system.setState("isSetCommandsAreNotCreated", true)

            system.setState("createdIsEnableFreeCameraCommand", false)
            system.setState("createdIsEnablePhysicsCommand", false)
            system.setState("createdIsSetNightCommand", false)
            system.setState("createdIsShadowsEnabledCommand", false)
            return;
        }

        // Add commands
        if (system.devBox.isEnableFreeCamera &&
            !system.getState("createdIsEnableFreeCameraCommand")
        ) {
            // create enable free camera command !TODO
            system.setState("createdIsEnableFreeCameraCommand", true)
        }

        if (system.devBox.isEnablePhysics &&
            !system.getState("createdIsEnablePhysicsCommand")
        ) {
            // create physics commands !TODO
            system.setState("createdIsEnablePhysicsCommand", true)
        }

        if (system.devBox.isSetNight &&
            !system.getState("createdIsSetNightCommand")
        ) {
            // create night commands !TODO
            system.setState("createdIsSetNightCommand", true)
        }
        if (system.devBox.isShadowsEnabled &&
            !system.getState("createdIsShadowsEnabledCommand")
        ) {
            system.addCommand(Commands.CreateShadows)
            system.setState("createdIsShadowsEnabledCommand", true)
        }

        // Remove commands
        if (!system.devBox.isEnableFreeCamera &&
            system.getState("createdIsEnableFreeCameraCommand")
        ) {
            // remove enable free camera command !TODO
            system.setState("createdIsEnableFreeCameraCommand", false)
        }

        if (!system.devBox.isEnablePhysics &&
            system.getState("createdIsEnablePhysicsCommand")
        ) {
            // remove physics commands !TODO
            system.setState("createdIsEnablePhysicsCommand", false)
        }

        if (!system.devBox.isSetNight &&
            system.getState("createdIsSetNightCommand")
        ) {
            // remove night commands !TODO
            system.setState("createdIsSetNightCommand", false)
        }
        if (!system.devBox.isShadowsEnabled &&
            system.getState("createdIsShadowsEnabledCommand")
        ) {
            system.removeCommand(Commands.UpdateShadowNumber)
            system.removeCommand(Commands.UpdateShadowProperties)
            system.addCommand(Commands.RemoveShadows)

            system.setState("createdIsShadowsEnabledCommand", false)
        }

    }
}
