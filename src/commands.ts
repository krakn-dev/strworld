import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"
import * as Comps from "./components.js"

export enum Commands {
    ShowHealth = 0,
    CreateHealth
}

export class CreateHealth implements ECS.Command {
    readonly query: [ECS.Get, Comps.Components[], ECS.By, null | number | Comps.Entities] | null
    readonly type: Commands
    constructor() {
        this.query = null
        this.type = Commands.CreateHealth
    }

    run(_: ECS.ComponentAndIndex[][], system: ECS.System) {
        console.log("moooo")
        let entityUid = 1
        system.addComponent(new Comps.Health(10, entityUid))
        system.removeCommand(Commands.CreateHealth)
    }
}


export class ShowHealth implements ECS.Command {
    readonly query: [ECS.Get, Comps.Components[], ECS.By, null | number | Comps.Entities] | null
    readonly type: Commands
    constructor() {
        this.query = [ECS.Get.All, [Comps.Components.Health], ECS.By.Any, null]
        this.type = Commands.ShowHealth
    }

    run(foundComponents: ECS.ComponentAndIndex[][], system: ECS.System) {

        if (system.getState("solved") == undefined) {
            console.log("not found, but i am solving this right now")
            system.addCommand(Commands.CreateHealth)
            system.setState("solved", true)
            return
        }

        if (foundComponents[0][0] == undefined) {
            console.log("hold on..")
            return
        }

        if (foundComponents[0][0] != undefined) {
            system.setProperty(foundComponents[0][0], Utils.property<Comps.Health>("health"), 15)
        }
        console.log(foundComponents[0])
    }
}
