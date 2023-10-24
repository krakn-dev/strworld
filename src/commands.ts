import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Comps from "./components.js"

export enum Commands {
    TheFirst = 0,
    PingPong,
    CreatePlayer,
    MovePlayer,
    SyncComputedElementPosition
}

//        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Health], ECS.By.Any, null])
export function getInstanceFromEnum(commandEnum: Commands): ECS.Command {
    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst()
        case Commands.PingPong:
            return new PingPong()
        case Commands.CreatePlayer:
            return new CreatePlayer()
        case Commands.MovePlayer:
            return new MovePlayer()
        case Commands.SyncComputedElementPosition:
            return new SyncComputedElementPosition()
    }
}

export class TheFirst implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.TheFirst
    }

    run(system: ECS.System) {
        system.addCommand(Commands.CreatePlayer)
        system.addCommand(Commands.SyncComputedElementPosition)
        system.removeCommand(Commands.TheFirst)
    }
}

export class PingPong implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.PingPong
    }

    run(_: ECS.System) {}
}

export class CreatePlayer implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.CreatePlayer
    }

    run(system: ECS.System) {
        for (let x = 0; x < 20; x++) {
            for (let y = 0; y < 20; y++) {
                let player = Utils.newUid()
                system.addComponent(new Comps.Health(10, player))
                system.addComponent(new Comps.Position(new Utils.Vector2(x * 40, y * 40), player))
                system.addComponent(new Comps.ComputedElement(player))

                //                console.log("player created")
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
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Position], ECS.By.Any, null])

        for (let fC of foundComponents[0]) {

            let newPosition = (fC.component as Comps.Position).position
            newPosition.x += system.input.movementDirection.x
            newPosition.y += system.input.movementDirection.y
            system.setProperty<Comps.Position>(
                fC,
                "position",
                newPosition
            )
        }
    }
}

export class SyncComputedElementPosition implements ECS.Command {
    readonly type: Commands
    constructor() {
        this.type = Commands.SyncComputedElementPosition
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

                    break;
                }
            }

        }
    }
}
