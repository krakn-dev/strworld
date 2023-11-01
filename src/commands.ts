import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Comps from "./components.js"

export enum Commands {
    TheFirst = 0,
    CreatePlayer,
    MovePlayer,
    SyncComputedElementsPosition,
    SendComputedElementsToRender,
    CastShadows,
    WatchDevBox,
}

//        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Health], ECS.By.Any, null])
export function getInstanceFromEnum(commandEnum: Commands): ECS.Command {

    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst()

        case Commands.WatchDevBox:
            return new WatchDevBox()

        case Commands.CreatePlayer:
            return new CreatePlayer()

        case Commands.MovePlayer:
            return new MovePlayer()

        case Commands.SyncComputedElementsPosition:
            return new SyncComputedElementsPosition()

        case Commands.SendComputedElementsToRender:
            return new SendComputedElementsToRender()

        case Commands.CastShadows:
            return new CastShadows()
    }
}

export class TheFirst implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.TheFirst
    }

    run(system: ECS.System) {
        system.addCommand(Commands.CreatePlayer)
        system.addCommand(Commands.SyncComputedElementsPosition)
        system.addCommand(Commands.SendComputedElementsToRender)
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
                system.addComponent(new Comps.Health(10, player))
                let position = new Comps.Position(new Utils.Vector2(x * 70, y * 70), player)
                system.addComponent(position)
                let computedElement = new Comps.ComputedElement(Comps.ElementTypes.Entity, player)
                computedElement.properties[Comps.Properties.Left] = position.position.x
                computedElement.properties[Comps.Properties.Top] = position.position.y
                computedElement.properties[Comps.Properties.ZIndex] = y
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


        system.setProperty<Comps.Position>(
            fC,
            "position",
            newPosition
        )
        system.setProperty<Comps.Position>(
            fC,
            "isChanged",
            true
        )
    }
}

export class SyncComputedElementsPosition implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.SyncComputedElementsPosition
    }

    run(system: ECS.System) {

        let foundComponents =
            system.find(
                [
                    ECS.Get.All,
                    [
                        Comps.Components.ComputedElement,
                        Comps.Components.Position
                    ],
                    ECS.By.Any,
                    null
                ])
        for (let cE of foundComponents[0]) {
            for (let p of foundComponents[1]) {

                if (!(p.component as Comps.Position).isChanged) break;

                if (cE.component.entityUid ==
                    p.component.entityUid) {

                    let position = (p.component as Comps.Position).position
                    let computedElement = cE.component as Comps.ComputedElement

                    computedElement.properties[Comps.Properties.Top] = position.y
                    computedElement.properties[Comps.Properties.Left] = position.x

                    computedElement.changedProperties[Comps.Properties.Left] = true
                    computedElement.changedProperties[Comps.Properties.Top] = true

                    system.setProperty<Comps.ComputedElement>(cE, "properties", computedElement.properties)
                    system.setProperty<Comps.ComputedElement>(cE, "changedProperties", computedElement.changedProperties)
                    system.setProperty<Comps.ComputedElement>(cE, "isChanged", true)

                    system.setProperty<Comps.Position>(p, "isChanged", false)
                    break;
                }
            }
        }
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
            system.setState(this.type, "createdIsSetNightCommand", false)
        }
        if (system.devBox.isShadowsEnabled &&
            !system.getState("createdIsShadowsEnabledCommand")
        ) {
            // create shadow commands !TODO
            system.setState(this.type, "createdIsShadowsEnabledCommand", false)
        }

    }
}

export class CastShadows implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CastShadows
    }

    run(system: ECS.System) {
        let foundComponents = system.find(
            [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null])

        if (foundComponents[0].length == 0) return

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

        if (system.getState("lastComputedElements") == null) {
            system.setState(this.type, "lastComputedElements", foundComponents[0])
            return
        }

        let graphicDiff = new Utils.GraphicDiff()

        for (let fC of foundComponents[0]) {
            let computedElement = fC.component as Comps.ComputedElement
            if (computedElement.isNew) {
                graphicDiff.addedComputedElements.push(fC)
                system.setProperty<Comps.ComputedElement>(fC, "isNew", false)
            }
            if (computedElement.isChanged) {
                graphicDiff.changedComputedElements.push(fC)
                system.setProperty<Comps.ComputedElement>(fC, "isChanged", false)
                system.setProperty<Comps.ComputedElement>(
                    fC,
                    "properties",
                    [new Comps.ClassesDiff(), false, false, false, false, false]
                )
            }
        }
        if (graphicDiff.addedComputedElements.length == 0 &&
            graphicDiff.removedComputedElements.length == 0 &&
            graphicDiff.changedComputedElements.length == 0
        ) {
            return
        }

        //        let isFound = false
        //        let lastComputedElements = system.getState("lastComputedElements")
        //        for (let lCE of lastComputedElements) {
        //            for (let fC of foundComponents[0]) {
        //                if (fC.component.componentUid == lCE.component.componentUid) {
        //                    isFound = true
        //                }
        //            }
        //            if (!isFound) graphicDiff.removedComputedElements.push(lCE)
        //            isFound = false
        //        }
        //let start = performance.now()
        //let stop = performance.now();
        //console.log(stop - start)

        postMessage(new Utils.Message(Utils.Messages.RenderIt, graphicDiff))

        system.setState(this.type, "lastComputedElements", foundComponents[0])
    }
}
