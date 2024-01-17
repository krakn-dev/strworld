import * as Comps from "./components"
import * as Utils from "../utils"
import * as Cmds from "./commands"
import * as Res from "./resources"

export interface Component {
    entityUid: number
    componentUid: number
    componentType: Comps.ComponentTypes
}

export enum Get {
    One,
    All
}

export enum By {
    EntityUid,
    EntityType,
    componentUid,
    Any,
}

export interface Command {
    commandType: Cmds.CommandTypes
    run(system: System, resources: Res.Resources): void
}

export class EntityComponents {
    components: Component[]
    entityUid: number

    constructor(newEntityUid: number) {
        this.components = []
        this.entityUid = newEntityUid
    }
}

class CommandChanges {
    removedCommands: Cmds.CommandTypes[]
    addedCommands: Cmds.CommandTypes[]
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
    private commands: Command[]
    private commandChangesBuffer: CommandChanges
    private components: Component[][]
    private resources: Res.Resources
    private currentExecutingCommand: CurrentExecutingCommand

    constructor(newResources: Res.Resources, newCurrentExecutingCommand: CurrentExecutingCommand) {
        this.resources = newResources
        this.currentExecutingCommand = newCurrentExecutingCommand

        this.commandChangesBuffer = new CommandChanges()
        this.commands = []

        this.components = []
        for (let _ = 0; _ < Comps.NUMBER_OF_COMPONENTS; _++) {
            this.components.push([])
        }
    }

    removeCommand(command: Cmds.CommandTypes) {
        this.commandChangesBuffer.removedCommands.push(command)
    }
    addCommand(command: Cmds.CommandTypes) {
        this.commandChangesBuffer.addedCommands.push(command)
    }
    addComponent(component: Component) {
        this.components[component.componentType].push(
            this.createProxy(component)
        )
        this
            .resources
            .componentChanges
            .addedComponentsBuffer[component.componentType]
            .push(component)
    }
    removeComponent(component: Component) {
        for (let [cI, c] of this.components[component.componentType].entries()) {
            if (c.componentUid == component.componentUid) {
                this
                    .resources
                    .componentChanges
                    .removedComponentsBuffer[component.componentType]
                    .push(component)

                this.components.splice(cI, 1)
            }
        }
    }

    // checks for changes in component properties
    // not nested ones
    private createProxy<T extends Component>(obj: T): T {
        let outer = this
        let handler = {
            set(obj: { [key: string]: any }, prop: string, value: any) {
                let component = obj as Component

                let isAlreadyChanged = false
                for (
                    let cC of outer.resources.componentChanges.changedComponentsBuffer[component.componentType]
                ) {
                    if (cC.componentUid == component.componentUid) {
                        isAlreadyChanged = true
                    }
                }
                if (!isAlreadyChanged) {
                    outer.resources.componentChanges.changedComponentsBuffer[component.componentType].push(component)
                }
                obj[prop] = value;
                return true;
            },
            get(obj: { [key: string]: any }, prop: string) {
                return obj[prop];
            },
        };

        return new Proxy<T>(obj, handler);
    }

    find(query: [Get, Comps.ComponentTypes[], By, Comps.EntityTypes | number | null]): Component[][] {
        // Comment on production !TODO
        if (query[1].length == 0) {
            console.log("no components expecified")
            return []
        }
        if (query[2] == By.EntityType && (query[3] as Comps.EntityTypes) == undefined ||
            query[2] == By.componentUid && typeof query[3] != "number" ||
            query[2] == By.EntityUid && typeof query[3] != "number") {
            console.log('argument does not match "By" enum')
            return []
        }

        if (query[0] == Get.All && query[2] == By.componentUid) {
            console.log('cannot get all by component id')
            return []
        }

        if (query[0] == Get.One && query[2] == By.EntityType) {
            console.log("query Get.One By.EntityType is not supported yet")
            return []
        }

        if (query[0] == Get.One && query[2] == By.Any) {
            console.log("query Get.One By.Any is not supported yet")
            return []
        }
        // Comment on production !TODO

        let collected: Component[][] = []
        for (let i = 0; i < query[1].length; i++) {
            collected.push([])
        }


        for (let [qci, qc] of query[1].entries()) {
            if (query[0] == Get.One) {
                if (query[2] == By.componentUid) {
                    for (let c of this.components[qc]) {
                        if (query[3] == c.componentUid) {
                            collected[qci].push(c)
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityUid) {
                    for (let c of this.components[qc]) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(c)
                            break;
                        }
                    }
                    continue;
                }
            }
            else if (query[0] == Get.All) {
                if (query[2] == By.EntityUid) {
                    for (let c of this.components[qc]) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(c)
                        }
                    }
                    continue;
                }
                else if (query[2] == By.Any) {
                    for (let c of this.components[qc]) {
                        collected[qci].push(c)
                    }
                    continue;
                }

                else if (query[2] == By.EntityType) {
                    for (let e of this.components[Comps.ComponentTypes.EntityType]) {
                        let entityTypeComponent = e as Comps.EntityType
                        if (query[3] == entityTypeComponent.entityType) {
                            for (let c of this.components[qc]) {
                                if (e.entityUid == c.entityUid) {
                                    collected[qci].push(c)
                                }
                            }
                            break;
                        }
                    }
                    continue;
                }

            }
        }
        return collected
    }

    private updateCommands() {
        for (let aC of this.commandChangesBuffer.addedCommands) {
            let isFound = false
            for (let c of this.commands) {
                if (aC == c.commandType) {
                    console.log("$ command already exists")
                    isFound = true
                }
            }
            if (isFound) {
                continue
            }

            let command = Cmds.getInstanceFromEnum(aC)
            let isInserted = false
            for (let [cI, c] of this.commands.entries()) {
                if (aC < c.commandType) {
                    isInserted = true
                    this.commands.splice(cI, 0, command)
                    break
                }
            }
            if (!isInserted) {
                this.commands.push(command)
            }
        }
        for (let rC of this.commandChangesBuffer.removedCommands) {
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
        //    console.log("commands", this.commands)
        //console.log("components", this.components)
        for (let c of this.commands) {
            this.currentExecutingCommand.command = c.commandType
            c.run(this, this.resources)
        }

        this.updateCommands()
        this.commandChangesBuffer.clearChanges()
        this.resources.componentChanges.cycleChanges()
    }
}
