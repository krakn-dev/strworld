import * as ECS from "./ecs/ecs"
import * as Ser from "./serialization"
import * as Res from "./ecs/resources"
import * as Comps from "./ecs/components"
import * as Cmds from "./ecs/commands"
import { start } from "./physx/physx"

initialize()
async function initialize() {
    await start()

    let currentExecutingCommand = new ECS.CurrentExecutingCommand()
    let resources = new Res.Resources(currentExecutingCommand)
    let system = new ECS.System(resources, currentExecutingCommand);

    let systemInterval: any | undefined = undefined
    function startInterval() {
        if (systemInterval != undefined) return
        systemInterval = setInterval(system.run.bind(system), 15)
    }
    onmessage = (data) => {
        let msg = data.data as Ser.Message
        switch (msg.message) {
            case Ser.Messages.Start: {
                let newData = msg.data as Ser.DOMData
                resources.domState.windowHeight = newData.windowHeight
                resources.domState.windowWidth = newData.windowWidth
                system.addCommand(Cmds.CommandTypes.TheFirst)
                startInterval()
            } break;
            case Ser.Messages.Input: {
                let newData = msg.data as Ser.Input
                resources.input.keys.set(newData.changedKey, newData.isKeyDown)
            } break;
            case Ser.Messages.RobotComponents: {
                let newData = msg.data as Comps.RobotComponent[]
                resources.newRobot.components = newData
            } break;
            case Ser.Messages.RefreshGraphics: {
                let graphicChanges = new Ser.GraphicChanges()
                let foundComponents = system.find([
                    ECS.Get.All,
                    [
                        Comps.ComponentTypes.EntityType,
                        Comps.ComponentTypes.Shape,
                        Comps.ComponentTypes.Camera,
                        Comps.ComponentTypes.Light,
                        Comps.ComponentTypes.EntityState,
                        Comps.ComponentTypes.Rotation,
                        Comps.ComponentTypes.ShapeColor,
                        Comps.ComponentTypes.Position,
                    ],
                    ECS.By.Any,
                    null
                ])
                //order is important
                graphicChanges.addedComponents.push(...foundComponents[0])
                graphicChanges.addedComponents.push(...foundComponents[1])
                graphicChanges.addedComponents.push(...foundComponents[2])
                graphicChanges.addedComponents.push(...foundComponents[3])
                graphicChanges.addedComponents.push(...foundComponents[4])
                graphicChanges.addedComponents.push(...foundComponents[5])
                graphicChanges.addedComponents.push(...foundComponents[6])
                graphicChanges.addedComponents.push(...foundComponents[7])
                for (let eTC of foundComponents[0]) {
                    graphicChanges.addedEntitiesUid.push(eTC.entityUid)
                }
                postMessage(new Ser.Message(Ser.Messages.GraphicChanges, JSON.parse(JSON.stringify(graphicChanges))))
            } break;
            case Ser.Messages.Stop: {
                clearInterval(systemInterval)
            } break;
            case Ser.Messages.Continue: {
                startInterval()
            } break;
            case Ser.Messages.UpdateAvailableComponents: {
                let newData = msg.data as Ser.AvailableRobotComponents
                resources.availableRobotComponents.quantity = newData.quantity
                resources.availableRobotComponents.robotComponentTypes = newData.robotComponentTypes
            } break;
            case Ser.Messages.GetAvailableRobotComponents: {
                postMessage(
                    new Ser.Message(
                        Ser.Messages.AvailableRobotComponents,
                        new Ser.AvailableRobotComponents(
                            resources.availableRobotComponents.robotComponentTypes,
                            resources.availableRobotComponents.quantity)))
            } break;
            case Ser.Messages.Options: {
                let newData = msg.data as Ser.Options
            } break;
        }
    }
    postMessage(new Ser.Message(Ser.Messages.Start))
}
