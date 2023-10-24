import * as Comps from "./components.js"
import * as Utils from "./utils.js"
import * as Cmds from "./commands.js"

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

export enum Run {
    EveryFrame,
    Once
}


export class ComponentAndIndex {
    component: Component
    index: [number, number]
    constructor(newComponent: Component, newIndex: [number, number]) {
        this.component = newComponent
        this.index = newIndex
    }
}

export interface Command {
    query: [Get, Comps.Components[], By, null | number | Comps.Entities] | null
    type: Cmds.Commands
    run(foundComponents: ComponentAndIndex[][], system: System): void
}


export class PropertyChange {
    index: number[]
    property: string
    value: any

    constructor(
        newIndex: number[],
        newProperty: string,
        newValue: any,
    ) {
        this.index = newIndex
        this.property = newProperty
        this.value = newValue
    }
}


export class System {
    private commands: Command[]
    private components: Component[][]

    private state: Map<string, any>


    private commandsToRemove: Cmds.Commands[]
    private commandsToAdd: Cmds.Commands[]

    private componentsToRemove: [number, number][]
    private componentsToAdd: Component[]
    private propertiesToChange: PropertyChange[]

    workerManager!: MessagePort

    constructor() {
        this.commands = []
        this.components = []
        this.state = new Map()
        this.commandsToRemove = []
        this.commandsToAdd = []
        this.componentsToRemove = []
        this.propertiesToChange = []
        this.componentsToAdd = []
    }

    setState(key: string, value: any) {
        let changes: string[] = this.state.get(Utils.CHANGES_KEY)
        changes.push(key)
        this.state.set(Utils.CHANGES_KEY, changes)
        this.state.set(key, value)
    }

    getState(key: string): any {
        return this.state.get(key)
    }

    removeComponent(component: ComponentAndIndex) {
        this.componentsToRemove.push(component.index)
    }
    addComponent(newComponent: Component) {
        this.componentsToAdd.push(newComponent)
    }

    setProperty(component: ComponentAndIndex, property: string, value: any) {
        this.propertiesToChange.push(new PropertyChange(component.index, property, value))
    }

    addCommand(command: Cmds.Commands) {
        this.commandsToAdd.push(command)
    }
    removeCommand(command: Cmds.Commands) {
        this.commandsToRemove.push(command)
    }
    update(
        newComponents: Component[][],
        newCommands: Cmds.Commands[],
        newState: Map<string, any>
    ) {
        this.components = newComponents
        this.commands = []
        for (let cT of newCommands) {
            switch (cT) {
                case Cmds.Commands.ShowHealth:
                    this.commands.push(new Cmds.ShowHealth())
                    break;
                case Cmds.Commands.CreateHealth:
                    this.commands.push(new Cmds.CreateHealth())
                    break;
            }
        }
        this.state = newState
    }

    private find(query: [Get, Comps.Components[], By, null | number | Comps.Entities]): ComponentAndIndex[][] {
        // Comment on production !TODO
        if (query[1].length == 0) {
            console.log("no components expecified")
            return []
        }
        if (query[2] == By.EntityType && (query[3] as Comps.Entities) == undefined ||
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

        let collected: ComponentAndIndex[][] = []
        for (let i = 0; i < query[1].length; i++) {
            collected.push([])
        }


        for (let [qci, qc] of query[1].entries()) {
            if (query[0] == Get.One) {
                if (query[2] == By.ComponentId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.componentUid) {
                            collected[qci].push(new ComponentAndIndex(c, [qci, cI]))
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(new ComponentAndIndex(c, [qci, cI]))
                            break;
                        }
                    }
                    continue;
                }
            }
            else if (query[0] == Get.All) {
                if (query[2] == By.EntityId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(new ComponentAndIndex(c, [qci, cI]))
                        }
                    }
                    continue;
                }
                else if (query[2] == By.Any) {
                    for (let [cI, c] of this.components[qci].entries()) {
                        collected[qci].push(new ComponentAndIndex(c, [qci, cI]))
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

    counter = 0
    run() {
        for (let c of this.commands) {
            if (this.counter == 1000) {
                console.log("command run this many times", this.counter)

            }
            this.counter++

            let foundComponents: ComponentAndIndex[][] = []
            if (c.query != null) foundComponents = this.find(c.query)
            c.run(foundComponents, this)
        }

        this.workerManager.postMessage(
            new Utils.Message(
                Utils.Messages.Done,
                new Utils.WorkerOutput(
                    this.propertiesToChange,
                    this.componentsToRemove,
                    this.componentsToAdd,
                    this.state,
                    this.commandsToRemove,
                    this.commandsToAdd
                )
            )
        )
        this.commandsToAdd = []
        this.commandsToRemove = []

        this.componentsToAdd = []
        this.componentsToRemove = []
        this.propertiesToChange = []
    }
}
