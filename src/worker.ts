import * as ECS from "./ecs/ecs"
import * as Ser from "./serialization"
import * as Res from "./ecs/resources"
import * as Comps from "./ecs/components"
import * as Mat from "./math"
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
        systemInterval = setInterval(system.run.bind(system), 20)
    }
    onmessage = (data) => {
        let msg = data.data as Ser.Message
        switch (msg.message) {
            case Ser.Messages.Start: {
                let newData = msg.data as Ser.DOMData
                resources.domState.windowHeight = newData.windowHeight
                resources.domState.windowWidth = newData.windowWidth
                system.addCommand(new Cmds.TheFirst())
                startInterval()
            } break;
            case Ser.Messages.ButtonPress: {
                let newData = msg.data as Ser.ButtonPress
                resources.input.keys.set(newData.changedButton, newData.isButtonDown)
            } break;
            case Ser.Messages.MouseMovement: {
                let newData = msg.data as Mat.Vector2
                resources.input.mouseMovement = newData
            } break;
            case Ser.Messages.RobotComponents: {
                let newData = msg.data as Comps.RobotComponent[]
                resources.newRobot.components = newData
            } break;
            case Ser.Messages.RefreshGraphics: {
                let graphicChanges = new Ser.GraphicChanges()

                //order is important
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.EntityType])
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.Shape])
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.Camera])
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.Light])
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.EntityState])
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.Rotation])
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.ShapeColor])
                graphicChanges.addedComponents.push(...system.proxyFreeComponents[Comps.ComponentTypes.Position])
                for (let eTC of system.proxyFreeComponents[Comps.ComponentTypes.EntityType]) {
                    graphicChanges.addedEntitiesUid.push(eTC.entityUid)
                }
                postMessage(
                    new Ser.Message(
                        Ser.Messages.GraphicChanges,
                        JSON.parse(JSON.stringify(graphicChanges))))
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
