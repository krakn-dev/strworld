import * as ECS from "./ecs"
import * as Ser from "./serialization"
import * as Res from "./resources"
import * as Cmds from "./commands"

let currentExecutingCommand = new ECS.CurrentExecutingCommand()
let resources = new Res.Resources(currentExecutingCommand)
let system = new ECS.System(resources, currentExecutingCommand);

onmessage = (data) => {
    let msg = data.data as Ser.Message

    switch (msg.message) {
        case Ser.Messages.Start: {
            system.addCommand(Cmds.Commands.TheFirst)
            setInterval(system.run.bind(system), 100)
        } break;
        case Ser.Messages.Input: {
            let newData = msg.data as Ser.Input
            resources.input.movementDirection = newData.movementDirection
        } break;
        case Ser.Messages.Options: {
            let newData = msg.data as Ser.Options
        } break;
    }
}
