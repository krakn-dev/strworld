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
    index: number
    constructor(
        newComponent: Component,
        newIndex: number
    ) {
        this.component = newComponent
        this.index = newIndex
    }
}

export interface Command {
    type: Cmds.Commands
    run(system: System): void
}



export class System {
    private commands: Command[]
    private components: Component[][]
    private state: Map<string, [Cmds.Commands, any]>
    private diffs?: Utils.Diffs | null
    workerId: number
    workers: Utils.WorkerInfo[]
    input: Utils.Input

    constructor(newWorkerId: number, newWorkers: Utils.WorkerInfo[]) {
        this.workerId = newWorkerId
        this.workers = newWorkers
        this.diffs = new Utils.Diffs([], [], [], [], [])
        this.commands = []
        this.components = []
        for (let _ = 0; _ < Comps.NUMBER_OF_COMPONENTS; _++) {
            this.components.push([])
        }
        this.state = new Map()
        this.input = new Utils.Input(new Utils.Vector2(0, 0))
    }


    setState(command: Cmds.Commands, key: string, value: any) {
        this.state.set(key, [command, value])
    }

    getState(key: string): any {
        let value = this.state.get(key)
        if (value == undefined)
            return null
        else
            return value[1]
    }

    removeComponent(component: ComponentAndIndex) {
        this.diffs!.removedComponents.push(
            new Utils.RemovedComponent(
                component.component.type,
                component.index,
                component.component.componentUid
            )
        )
    }
    removeCommand(command: Cmds.Commands) {
        let isFound = false
        for (let w of this.workers) {
            for (let wC of w.commands) {
                if (wC == command) {
                    this.diffs!.removedCommands.push(
                        new Utils.CommandChange(
                            w.workerId,
                            command
                        )
                    )
                    isFound = true
                }
            }
        }
        for (let wC of this.commands) {
            if (wC.type == command) {
                this.diffs!.removedCommands.push(
                    new Utils.CommandChange(
                        this.workerId,
                        command
                    )
                )
                isFound = true
            }
        }
        if (!isFound) {
            console.log("command to delete wasn't found")
        }
    }
    addComponent(newComponent: Component) {
        this.diffs!.addedComponents.push(newComponent)
    }
    addCommand(command: Cmds.Commands) {
        for (let w of this.workers) {
            for (let wC of w.commands) {
                if (wC == command) {
                    console.log("command already in list")
                    return;
                }
            }
        }
        for (let wC of this.commands) {
            if (wC.type == command) {
                console.log("command already in list")
                return;
            }
        }
        let workerWithLessCommands = [
            this.workers[0].workerId, // workerId
            this.workers[0].commands.length // numberOfCommands
        ];

        for (let w of this.workers) {
            if (w.commands.length < workerWithLessCommands[1]) {
                workerWithLessCommands[0] = w.workerId
                workerWithLessCommands[1] = w.commands.length
            }
        }
        if (this.commands.length < workerWithLessCommands[1]) {
            workerWithLessCommands[0] = this.workerId
            workerWithLessCommands[1] = this.commands.length
        }
        this.diffs!.addedCommands.push(
            new Utils.CommandChange(
                workerWithLessCommands[0],
                command)
        )
    }

    setProperty<TObj>(component: ComponentAndIndex, property: keyof TObj, value: any) {
        if (component == undefined) {
            console.log("no component at such index")
            return
        }

        this.diffs!.changedProperties.push(
            new Utils.PropertyChange(
                component.component.type,
                component.index,
                property as string,
                value,
                component.component.componentUid
            )
        )
    }

    update(newData: Utils.Diffs) {

        // add commands
        for (let aWC of newData.addedCommands) {
            for (let w of this.workers) {
                if (w.workerId == aWC.workerReceiver) {
                    w.commands.push(aWC.commandType)
                }
            }
            if (aWC.workerReceiver == this.workerId) {
                this.commands.push(
                    Cmds.getInstanceFromEnum(aWC.commandType)
                )
            }
        }

        // remove commands
        for (let rWC of newData.removedCommands) {
            for (let w of this.workers) {
                for (let [wCI, wC] of w.commands.entries()) {
                    if (rWC.commandType == wC) {
                        w.commands.splice(wCI, 1)
                        break;
                    }
                }
            }
            for (let [wCI, wC] of this.commands.entries()) {
                if (wC.type == rWC.commandType) {
                    this.commands.splice(wCI, 1)

                    for (const [k, v] of this.state.entries()) {
                        if (v[0] == rWC.commandType) this.state.delete(k)
                    }
                }
            }
        }

        // add components
        for (let c of newData.addedComponents) {
            this.components[c.type].push(c)
        }

        // change properties
        for (let pC of newData.changedProperties) {

            // detect if index is incorrect or was removed
            if (this.components[pC.componentType].length - 1 < pC.componentIndex ||
                this.components[pC.componentType][pC.componentIndex].componentUid != pC.componentUid) {

                console.log("$ component probably was deleted or changed position")
                console.log("$ trying to fix...")
                let fixed = false
                for (let [cI, c] of this.components[pC.componentType].entries()) {
                    if (c.componentUid == pC.componentUid) {
                        fixed = true
                        pC.componentIndex = cI
                    }
                }
                if (!fixed) {
                    console.log("$ component was deleted")
                    return
                }
                else {
                    console.log("$ component was found")
                }
            }
            (this.components[pC.componentType][pC.componentIndex] as Utils.IIndexable)[pC.property] = pC.value
        }

        // delete components
        if (newData.removedComponents.length != 0) {

            // detect if index is incorrect or was removed
            for (let rC of newData.removedComponents) {
                if (this.components[rC.componentType].length - 1 < rC.componentIndex ||
                    this.components[rC.componentType][rC.componentIndex].componentUid != rC.componentUid
                ) {
                    console.log("$ component probably was deleted or changed position")
                    console.log("$ trying to fix...")
                    let fixed = false
                    for (let [cI, c] of this.components[rC.componentType].entries()) {
                        if (c.componentUid == rC.componentUid) {
                            fixed = true
                            rC.componentIndex = cI
                        }
                    }
                    if (!fixed) {
                        console.log("$ component was deleted")
                        return
                    }
                    else {
                        console.log("$ component was found")
                    }
                }
            }

            let deleteOrder: Utils.RemovedComponent[] = [newData.removedComponents[0]]
            for (let rC of newData.removedComponents!) {
                for (let [dOI, dO] of deleteOrder.entries()) {
                    if (rC.componentIndex > dO.componentIndex) {
                        deleteOrder.splice(dOI, 0, rC)
                    }
                }
            }
            // remove in order
            for (let dO of deleteOrder) {
                this.components[dO.componentType].splice(dO.componentIndex, 1)
            }
        }
    }

    find(query: [Get, Comps.Components[], By, null | number | Comps.EntityTypes]): ComponentAndIndex[][] {
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

        let collected: ComponentAndIndex[][] = []
        for (let i = 0; i < query[1].length; i++) {
            collected.push([])
        }


        for (let [qci, qc] of query[1].entries()) {
            if (query[0] == Get.One) {
                if (query[2] == By.ComponentId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.componentUid) {
                            collected[qci].push(new ComponentAndIndex(c, cI))
                            break;
                        }
                    }
                    continue;
                }
                else if (query[2] == By.EntityId) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        if (query[3] == c.entityUid) {
                            collected[qci].push(new ComponentAndIndex(c, cI))
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
                            collected[qci].push(new ComponentAndIndex(c, cI))
                        }
                    }
                    continue;
                }
                else if (query[2] == By.Any) {
                    for (let [cI, c] of this.components[qc].entries()) {
                        collected[qci].push(new ComponentAndIndex(c, cI))
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

    run() {
        if (this.commands.length == 0) {
            return
        }

        for (let c of this.commands) {
            c.run(this)
        }

        if (this.diffs!.addedCommands.length == 0 &&
            this.diffs!.addedComponents.length == 0 &&
            this.diffs!.changedProperties.length == 0 &&
            this.diffs!.removedCommands.length == 0 &&
            this.diffs!.removedComponents.length == 0
        ) {
            return
        }

        for (let w of this.workers) {
            w.messagePort.postMessage(
                new Utils.Message(Utils.Messages.Update, this.diffs)
            )
        }
        this.update(this.diffs!)
        delete this.diffs
        this.diffs = new Utils.Diffs([], [], [], [], [])
    }
}

//        for (let cAI of this.components[Comps.Components.ComputedElement]) {
//            let computedElement = cAI as Comps.ComputedElement
//            computedElement.isChanged = false
//            for (let [pCI, pC] of computedElement.changedProperties.entries()) {
//                if (pCI == 0) {
//                    let classesDiff = (pC as Comps.ClassesDiff)
//                    classesDiff.added = []
//                    classesDiff.deleted = []
//                    continue;
//                }
//                pC = false
//            }
//        }
