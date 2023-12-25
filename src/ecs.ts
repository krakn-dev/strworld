import * as Comps from "./components"
import * as Utils from "./utils"
import * as Cmds from "./commands"
import * as Res from "./resources"

export interface Component {
    entityUid: number
    componentUid: number
    type: Comps.Components
}

export enum Get {
    One,
    All
}

export enum By {
    EntityId,
    EntityType,
    ComponentId,
    Any,
}

export interface Command {
    type: Cmds.Commands
    run(system: System, resources: Res.Resources): void
}

class CommandChanges {
    removedCommands: Cmds.Commands[]
    addedCommands: Cmds.Commands[]
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
    command: Cmds.Commands | null
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

    removeCommand(command: Cmds.Commands) {
        this.commandChangesBuffer.removedCommands.push(command)
    }

    addComponent(component: Component) {
        this.components[component.type].push(
            this.createProxy(component)
        )
        this
            .resources
            .componentChanges
            .addedComponentsBuffer[component.type]
            .push(component)
    }

    removeComponent(component: Component) {
        for (let [cI, c] of this.components[component.type].entries()) {
            if (c.componentUid == component.componentUid) {
                this
                    .resources
                    .componentChanges
                    .removedComponentsBuffer[component.type]
                    .push(component)

                this.components.splice(cI, 1)
            }
        }
    }

    private accessedComponent: Component | null = null
    private createProxy<T extends Component>(obj: T): T {
        let outer = this
        let handler = {
            set(obj: { [key: string]: any }, prop: string, value: any) {
                if ("componentUid" in obj) {
                    outer.accessedComponent = obj as Component
                }

                let isAlreadyChanged = false
                for (
                    let cC of outer
                        .resources
                        .componentChanges
                        .changedComponentsBuffer[outer.accessedComponent!.type]
                ) {
                    if (cC.componentUid == outer.accessedComponent!.componentUid) {
                        isAlreadyChanged = true
                    }
                }
                if (!isAlreadyChanged) {
                    outer
                        .resources
                        .componentChanges
                        .changedComponentsBuffer[outer.accessedComponent!.type]
                        .push(outer.accessedComponent!)
                }
                obj[prop] = value;
                return true;
            },
            get(obj: { [key: string]: any }, prop: string) {
                if ("componentUid" in obj) {
                    outer.accessedComponent = obj as Component
                }

                if (typeof obj[prop] == "object") {
                    return outer.createProxy(obj[prop])
                }
                return obj[prop];
            },
        };

        return new Proxy<T>(obj, handler);
    }
    addCommand(command: Cmds.Commands) {
        this.commandChangesBuffer.addedCommands.push(command)
    }

    find(query: [Get, Comps.Components[], By, Comps.EntityTypes | number | null]): Component[][] {
        // Comment on production !TODO
        if (query[1].length == 0) {
            console.log("no components expecified")
            return []
        }
        if (query[2] == By.EntityType && (query[3] as Comps.EntityTypes) == undefined ||
            query[2] == By.ComponentId && typeof query[3] != "number" ||
            query[2] == By.EntityId && typeof query[3] != "number") {
            console.log('argument does not match "By" enum')
            return []
        }

        if (query[0] == Get.All && query[2] == By.ComponentId) {
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
                if (query[2] == By.ComponentId) {
                    for (let c of this.components[qc]) {
                        if (query[3] == c.componentUid) {
                            collected[qci].push(c)
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
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
                if (query[2] == By.EntityId) {
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

                //                else if (query[2] == By.EntityType) {
                //                    for (let e of this.components[Comps.Components.EntityType]) {
                //                        if (query[3] == e.entityType) {
                //                            for (let c of this.components[qc]) {
                //                                if (e.entityUid == c.ownerUid) {
                //                                    collected[qci].push(c)
                //                                }
                //                            }
                //                            break;
                //                        }
                //                    }
                //                    continue;
                //                }

            }
        }
        return collected
    }

    private updateCommands() {
        for (let aC of this.commandChangesBuffer.addedCommands) {
            let isFound = false
            for (let c of this.commands) {
                if (aC == c.type) {
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
                if (aC < c.type) {
                    isInserted = true
                    this.commands.splice(cI, 0, command)
                }
            }
            if (!isInserted) {
                this.commands.push(command)
            }
        }
        for (let rC of this.commandChangesBuffer.removedCommands) {
            let isFound = false
            for (let cI = this.commands.length - 1; cI >= 0; cI--) {
                if (rC == this.commands[cI].type) {
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
            this.currentExecutingCommand.command = c.type
            c.run(this, this.resources)
        }

        this.updateCommands()
        this.commandChangesBuffer.clearChanges()
        this.resources.componentChanges.cycleChanges()
    }
}
