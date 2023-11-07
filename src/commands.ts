import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Comps from "./components.js"
import * as Anims from "./animations.js"


export enum Commands {
    TheFirst = 0,
    CreatePlayer = 1,
    MovePlayer = 2,
    SetEntityElementsPosition = 3,
    SendComputedElementsToRender = 4,
    CreateShadows = 5,
    WatchDevBox = 6,
    RemoveShadows = 7,
    PlayAnimations = 8,
    UpdateShadowNumber = 9,
    UpdateShadowProperties = 10,
}

export function getInstanceFromEnum(commandEnum: Commands): ECS.Command {

    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst()

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

        case Commands.SetEntityElementsPosition:
            return new SetEntityElementsPosition()

        case Commands.SendComputedElementsToRender:
            return new SendComputedElementsToRender()

        case Commands.CreateShadows:
            return new CreateShadows()
    }
}

export class TheFirst implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.TheFirst
    }

    run(system: ECS.System) {
        system.addCommand(Commands.CreatePlayer)
        system.addCommand(Commands.SetEntityElementsPosition)
        system.addCommand(Commands.SendComputedElementsToRender)
        system.addCommand(Commands.WatchDevBox)

        system.removeCommand(Commands.TheFirst)
    }
}
export class CreatePlayer implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CreatePlayer
    }

    run(system: ECS.System) {
        if (system.getState("once") != null) {
            return
        }
        system.setState(this.type, "once", true)
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                let player = Utils.newUid()
                let position = new Comps.Position(new Utils.Vector2(x * 70, y * 70), player)
                let animation = new Comps.Animation([
                    new Anims.PlayerIdle(),
                    new Anims.PlayerRunning()],
                    player)
                let entityState = new Comps.EntityState(Comps.EntityStates.Idle, player)

                let computedElement = new Comps.ComputedElement(Comps.ElementTypes.Entity, player)
                computedElement.properties[Comps.Properties.Left] = position.position.x
                computedElement.properties[Comps.Properties.Top] = position.position.y
                computedElement.properties[Comps.Properties.ZIndex] = y

                system.addComponent(new Comps.Health(10, player))
                system.addComponent(position)
                system.addComponent(animation)
                system.addComponent(entityState)
                system.addComponent(computedElement)
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
        if (system.getState("delta") == undefined) {
            system.setState(this.type, "delta", performance.now())
            return
        }

        let velocity = 0.3

        let delta = (performance.now() - system.getState("delta"))
        system.setState(this.type, "delta", performance.now())


        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Position], ECS.By.Any, null])
        if (system.input.movementDirection.x == 0 &&
            system.input.movementDirection.y == 0
        ) {
            return
        }
        if (foundComponents[0].length == 0) {
            return
        }

        let fC = foundComponents[0][0]

        let newPosition = (fC.component as Comps.Position).position
        newPosition.x += system.input.movementDirection.x * delta * velocity
        newPosition.y += system.input.movementDirection.y * delta * velocity

        system.setProperty<Comps.Position, "position">(
            fC,
            "position",
            newPosition
        )
    }
}
export class SetEntityElementsPosition implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.SetEntityElementsPosition
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
                    computedElement.properties[Comps.Properties.Top] = position.position.y
                    computedElement.properties[Comps.Properties.Left] = position.position.x

                    computedElement.changedProperties[Comps.Properties.Left] = true
                    computedElement.changedProperties[Comps.Properties.Top] = true

                    system.setProperty<Comps.ComputedElement, "isChanged">(
                        fC, "isChanged", true)
                    system.setProperty<Comps.ComputedElement, "properties">(
                        fC, "properties", computedElement.properties)
                    system.setProperty<Comps.ComputedElement, "changedProperties">(
                        fC, "changedProperties", computedElement.changedProperties)
                    break;
                }
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
    }
}
export class WatchDevBox implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.WatchDevBox
    }

    run(system: ECS.System) {
        // run first time
        if (system.getState("isSetCommandsAreNotCreated") == null) {
            system.setState(this.type, "isSetCommandsAreNotCreated", true)

            system.setState(this.type, "createdIsEnableFreeCameraCommand", false)
            system.setState(this.type, "createdIsEnablePhysicsCommand", false)
            system.setState(this.type, "createdIsSetNightCommand", false)
            system.setState(this.type, "createdIsShadowsEnabledCommand", false)
            return;
        }

        // Add commands
        if (system.devBox.isEnableFreeCamera &&
            !system.getState("createdIsEnableFreeCameraCommand")
        ) {
            // create enable free camera command !TODO
            system.setState(this.type, "createdIsEnableFreeCameraCommand", true)
        }

        if (system.devBox.isEnablePhysics &&
            !system.getState("createdIsEnablePhysicsCommand")
        ) {
            // create physics commands !TODO
            system.setState(this.type, "createdIsEnablePhysicsCommand", true)
        }

        if (system.devBox.isSetNight &&
            !system.getState("createdIsSetNightCommand")
        ) {
            // create night commands !TODO
            system.setState(this.type, "createdIsSetNightCommand", true)
        }
        if (system.devBox.isShadowsEnabled &&
            !system.getState("createdIsShadowsEnabledCommand")
        ) {
            system.addCommand(Commands.CreateShadows)
            system.setState(this.type, "createdIsShadowsEnabledCommand", true)
        }

        // Remove commands
        if (!system.devBox.isEnableFreeCamera &&
            system.getState("createdIsEnableFreeCameraCommand")
        ) {
            // remove enable free camera command !TODO
            system.setState(this.type, "createdIsEnableFreeCameraCommand", false)
        }

        if (!system.devBox.isEnablePhysics &&
            system.getState("createdIsEnablePhysicsCommand")
        ) {
            // remove physics commands !TODO
            system.setState(this.type, "createdIsEnablePhysicsCommand", false)
        }

        if (!system.devBox.isSetNight &&
            system.getState("createdIsSetNightCommand")
        ) {
            // remove night commands !TODO
            system.setState(this.type, "createdIsSetNightCommand", false)
        }
        if (!system.devBox.isShadowsEnabled &&
            system.getState("createdIsShadowsEnabledCommand")
        ) {
            system.removeCommand(Commands.UpdateShadowNumber)
            system.removeCommand(Commands.UpdateShadowProperties)
            system.addCommand(Commands.RemoveShadows)

            system.setState(this.type, "createdIsShadowsEnabledCommand", false)
        }

    }
}
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
                    computedElement.properties[Comps.Properties.Top] = position.position.y - 10
                    computedElement.properties[Comps.Properties.Left] = position.position.x - 10

                    computedElement.changedProperties[Comps.Properties.Left] = true
                    computedElement.changedProperties[Comps.Properties.Top] = true

                    system.setProperty<Comps.ComputedElement, "isChanged">(
                        fC, "isChanged", true)
                    system.setProperty<Comps.ComputedElement, "properties">(
                        fC, "properties", computedElement.properties)
                    system.setProperty<Comps.ComputedElement, "changedProperties">(
                        fC, "changedProperties", computedElement.changedProperties)
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

            shadowElement.properties[Comps.Properties.Color] = "#aaa"

            shadowElement.properties[Comps.Properties.Left] =
                computedElement.properties[Comps.Properties.Left] - 10

            shadowElement.properties[Comps.Properties.Top] =
                computedElement.properties[Comps.Properties.Top] - 10

            shadowElement.properties[Comps.Properties.ZIndex] = -1

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
                shadowElement.properties[Comps.Properties.Color] = "#666"

                shadowElement.properties[Comps.Properties.Left] =
                    computedElement.properties[Comps.Properties.Left] - 10

                shadowElement.properties[Comps.Properties.Top] =
                    computedElement.properties[Comps.Properties.Top] - 10

                shadowElement.properties[Comps.Properties.ZIndex] = -1

                system.addComponent(shadowElement)

            }
        }
        system.addCommand(Commands.UpdateShadowNumber)
        system.addCommand(Commands.UpdateShadowProperties)

        system.removeCommand(this.type)
    }
}
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
            let computedElement = cC.component as Comps.ComputedElement

            if (!computedElement.isChanged) continue

            graphicDiff.changedComputedElements.push(cC)

            // set properties to not changed
            system.setProperty<Comps.ComputedElement, "isChanged">(
                cC,
                "isChanged",
                false
            )
            system.setProperty<Comps.ComputedElement, "changedProperties">(
                cC,
                "changedProperties",
                [new Comps.ClassesDiff(), false, false, false, false, false]
            )
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
