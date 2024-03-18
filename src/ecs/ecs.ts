import * as Comps from "./components"
import * as Utils from "../utils"
import * as Cmds from "./commands"
import * as Res from "./resources"

export interface Component {
    entityUid: number
    componentUid: number
    componentType: Comps.ComponentTypes
}
export interface Command {
    commandType: Cmds.CommandTypes
    run(system: System, resources: Res.Resources): void
}
class CommandChanges {
    removedCommands: Cmds.CommandTypes[]
    addedCommands: Command[]
    constructor() {
        this.removedCommands = []
        this.addedCommands = []
    }
    clearChanges() {
        this.removedCommands = []
        this.addedCommands = []
    }
}
export class CurrentExecutingCommand {
    command: Cmds.CommandTypes | null
    constructor() {
        this.command = null
    }
}
export class System {
    components: Component[][]
    proxyFreeComponents: Component[][]
    entities: Map<number, (Component | undefined)[]>

    private commands: Command[]
    private commandChangesBuffer: CommandChanges
    private resources: Res.Resources
    private currentExecutingCommand: CurrentExecutingCommand

    constructor(newResources: Res.Resources, newCurrentExecutingCommand: CurrentExecutingCommand) {
        this.resources = newResources
        this.currentExecutingCommand = newCurrentExecutingCommand
        this.changedComponents = new Map()
        this.entities = new Map()

        this.commandChangesBuffer = new CommandChanges()
        this.commands = []

        this.components = []
        this.proxyFreeComponents = []
        for (let _ = 0; _ < Comps.NUMBER_OF_COMPONENTS; _++) {
            this.components.push([])
            this.proxyFreeComponents.push([])
        }
    }
    removeCommand(command: Cmds.CommandTypes) {
        this.commandChangesBuffer.removedCommands.push(command)
    }
    addCommand(command: Command) {
        this.commandChangesBuffer.addedCommands.push(command)
    }

    createEntity(): number {
        let entityUid = Utils.newUid()

        let components: Component | undefined[] = []
        for (let _ = 0; _ < Comps.NUMBER_OF_COMPONENTS; _++) {
            this.components.push([])
        }
        // add entity to entities map
        this.entities.set(entityUid, components)

        return entityUid
    }
    removeEntity(entityUid: number) {
        let entityComponents = this.entities.get(entityUid)!
        for (let cT = 0; cT < this.components.length; cT++) {
            for (let cI = this.components[cT].length - 1; cI >= 0; cI--) {
                let component = this.components[cT][cI];
                if (component.entityUid != entityUid) continue;

                // add component to proxy free removed components buffer
                this
                    .resources
                    .componentChanges
                    .proxyFreeRemovedComponentsBuffer[component.componentType]
                    .push(this.proxyFreeComponents[cT][cI]);

                // remove component from entity-component
                entityComponents[component.componentType] = undefined

                // remove component from component lists
                this.components[cT].splice(cI, 1);
                this.proxyFreeComponents[cT].splice(cI, 1);
                break;
            }
        }
        // remove entity-component
        this.entities.delete(entityUid)
    }
    addComponent(component: Component) {
        let proxyComponent = this.createProxy(component)

        // push component to component lists
        this.components[component.componentType].push(proxyComponent)
        this.proxyFreeComponents[component.componentType].push(component)

        // push component to added components lists
        this
            .resources
            .componentChanges
            .addedComponentsBuffer[component.componentType]
            .push(proxyComponent)
        this
            .resources
            .componentChanges
            .proxyFreeAddedComponentsBuffer[component.componentType]
            .push(component)

        // add component to entity-component
        this.entities.get(component.entityUid)![component.componentType] = proxyComponent
    }
    removeComponent(component: Component) {
        for (let [cI, c] of this.components[component.componentType].entries()) {
            if (c.componentUid == component.componentUid) {
                // add component to proxy free removed components buffer
                this
                    .resources
                    .componentChanges
                    .proxyFreeRemovedComponentsBuffer[component.componentType]
                    .push(this.proxyFreeComponents[component.componentType][cI])

                // remove component from entity-component
                let entityComponents = this.entities.get(component.entityUid)!
                entityComponents[component.componentType] = undefined

                // remove component from component lists
                this.components[component.componentType].splice(cI, 1)
                this.proxyFreeComponents[component.componentType].splice(cI, 1)

                return;
            }
        }
    }

    // checks for changes in component properties
    // not nested properties
    private lastChangedComponent: Component | undefined
    private changedComponents: Map<number, undefined>
    private createProxy<T extends Component>(obj: T): T {
        let outer = this
        let handler = {
            set(obj: { [key: string]: any }, prop: string, value: any) {
                let component = obj as Component

                // check if component is already in changed list
                let isAlreadyChanged = false
                if (
                    outer.lastChangedComponent != undefined &&
                    outer.lastChangedComponent.componentUid == component.componentUid
                ) {
                    isAlreadyChanged = true
                } else {
                    let isChanged = outer.changedComponents.has(component.componentUid)
                    if (isChanged) isAlreadyChanged = true
                }

                // add to change components hashmap 
                if (!isAlreadyChanged) {
                    outer.resources.componentChanges.changedComponentsBuffer[component.componentType].push(outer.createProxy(component))
                    outer.resources.componentChanges.proxyFreeChangedComponentsBuffer[component.componentType].push(component)
                    outer.changedComponents.set(component.componentUid, undefined)
                }

                outer.lastChangedComponent = component

                obj[prop] = value;
                return true;
            },
        };

        return new Proxy<T>(obj, handler);
    }
    private updateCommands() {
        for (let aC of this.commandChangesBuffer.addedCommands) {

            // check if command is already inserted
            let isFound = false
            for (let c of this.commands) {
                if (aC.commandType == c.commandType) {
                    console.log("$ command already exists")
                    isFound = true
                }
            }
            if (isFound) {
                continue
            }

            // insert in CommandTypes order
            let isInserted = false
            for (let [cI, c] of this.commands.entries()) {
                if (aC.commandType < c.commandType) {
                    isInserted = true
                    this.commands.splice(cI, 0, aC)
                    break
                }
            }
            if (!isInserted) {
                this.commands.push(aC)
            }
        }
        for (let rC of this.commandChangesBuffer.removedCommands) {

            // loop over and remove command
            let isFound = false
            for (let cI = this.commands.length - 1; cI >= 0; cI--) {
                if (rC == this.commands[cI].commandType) {
                    isFound = true

                    this.commands.splice(cI, 1)
                    this.resources.commandState.removeCommandStates(rC)
                }
            }
            if (!isFound) {
                console.log("$ command was not found")
            }
        }
    }
    run() {
        for (let c of this.commands) {
            this.currentExecutingCommand.command = c.commandType
            c.run(this, this.resources)
        }
        this.updateCommands()
        this.commandChangesBuffer.clearChanges()
        this.resources.componentChanges.cycleChanges()
        this.changedComponents.clear()
    }
}
