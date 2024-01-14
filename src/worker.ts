import * as ECS from "./ecs/ecs"
import * as Ser from "./serialization"
import * as Res from "./ecs/resources"
import * as Cmds from "./ecs/commands"

let currentExecutingCommand = new ECS.CurrentExecutingCommand()
let resources = new Res.Resources(currentExecutingCommand)
let system = new ECS.System(resources, currentExecutingCommand);

onmessage = (data) => {
    let msg = data.data as Ser.Message

    switch (msg.message) {
        case Ser.Messages.Start: {
            let newData = msg.data as Ser.DOMData
            resources.domState.windowHeight = newData.windowHeight
            resources.domState.windowWidth = newData.windowWidth

            system.addCommand(Cmds.CommandTypes.TheFirst)
            //setInterval(system.run.bind(system), 15)
            setInterval(system.run.bind(system), 15)
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
