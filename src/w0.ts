import * as ECS from "./ecs.js"
import * as Cmds from "./commands.js"
import * as Comps from "./components.js"
import * as Utils from "./utils.js"

let workers: Utils.WorkerInfo[] = []
let graphicDiff = new Utils.GraphicDiff()
let components: ECS.Component[][] = []

for (let _ = 0; _ < Comps.NUMBER_OF_COMPONENTS; _++) {
    components.push([])
}

let input: Utils.Input

async function onWorkerMessage(data: any) {
    let msg = (data.data as Utils.Message)
    switch (msg.message) {
        case Utils.Messages.Done:
            let newData = msg.data as Utils.DiffsOut
            // add commands
            let isFound = false
            for (let nC of newData.addedCommands) {
                for (let w of workers) {
                    for (let c of w.commands) {
                        if (nC == c) {
                            isFound = true
                            console.log("command already in list")
                            break;
                        }
                    }
                    if (isFound) break
                }
                if (isFound) {
                    isFound = false
                    continue
                }
                // if was not found -> add it
                //                           index, numberOfCommands
                let workerWithLessCommands = [0, workers[0].commands.length];
                for (let [wI, w] of workers.entries()) {
                    if (w.commands.length < workerWithLessCommands[1]) {
                        workerWithLessCommands[0] = wI
                        workerWithLessCommands[1] = w.commands.length
                    }
                }
                workers[workerWithLessCommands[0]].commands.push(nC)
                workers[workerWithLessCommands[0]].messagePort.postMessage(
                    new Utils.Message(Utils.Messages.AddedCommand, nC)
                )
            }

            // sync local components
            for (let c of newData.addedComponents) {
                // update graphic diff
                components[c.type].push(c)
                if (c.type == Comps.Components.ComputedElement) {
                    graphicDiff.
                        addedComputedElements.
                        push(new ECS.ComponentAndIndex(c, components.length - 1))
                }
            }

            // change local properties
            for (let pC of newData.changedProperties) {

                // detect if index is incorrect or was removed
                if (components[pC.componentType].length - 1 < pC.componentIndex ||
                    components[pC.componentType][pC.componentIndex].componentUid != pC.componentUid) {

                    console.log("$ component probably was deleted or changed position")
                    console.log("$ trying to fix...")
                    let fixed = false
                    for (let [cI, c] of components[pC.componentType].entries()) {
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
                if (components[pC.componentType][pC.componentIndex].type == Comps.Components.ComputedElement) {
                    graphicDiff.changedComputedElements.push(
                        new ECS.ComponentAndIndex(
                            components[pC.componentType][pC.componentIndex],
                            pC.componentIndex)
                    );
                }

                (components[pC.componentType][pC.componentIndex] as Utils.IIndexable)[pC.property] = pC.value
            }

            // delete local components
            if (newData.removedComponents.length != 0) {
                let deleteOrder: Utils.RemovedComponent[] = [newData.removedComponents[0]]
                for (let rC of newData.removedComponents!) {
                    for (let [dOI, dO] of deleteOrder.entries()) {
                        if (rC.index > dO.index) {
                            deleteOrder.splice(dOI, 0, rC)
                        }
                    }
                }

                for (let dO of deleteOrder) {
                    // update graphic diff
                    if (components[dO.type][dO.index].type == Comps.Components.ComputedElement) {
                        graphicDiff.removedComputedElements.push(new ECS.ComponentAndIndex(components[dO.type][dO.index], dO.index))
                    }
                    // remove in order
                    components[dO.type].splice(dO.index, 1)
                }
            }

            // remove worker commands
            isFound = false
            for (let rC of newData.removedCommands) {
                for (let w of workers) {
                    for (let [cI, c] of w.commands.entries()) {
                        if (rC == c) {
                            w.messagePort.postMessage(new Utils.Message(Utils.Messages.RemovedCommand, rC))
                            w.commands.splice(cI, 1)
                            break;
                        }
                    }
                    if (isFound) {
                        isFound = false
                        break
                    }
                }
            }
            let workerInput = new Utils.WorkerInput(
                newData.changedProperties,
                newData.removedComponents,
                newData.addedComponents,
                input
            )
            for (let w of workers) {
                w.messagePort.postMessage(
                    new Utils.Message(Utils.Messages.Update, workerInput)
                )
            }
            break;
    }
}

// Main
onmessage = async (data: any) => {
    let msg = (data.data) as Utils.Message
    switch (msg.message) {
        case Utils.Messages.Start:
            await Utils.delay(1000) // wait for all workers to initialize

            workers.push(new Utils.WorkerInfo(data.ports[0], 1))
            workers.push(new Utils.WorkerInfo(data.ports[1], 2))
            workers.push(new Utils.WorkerInfo(data.ports[2], 3))

            for (let w of workers) {
                w.messagePort.onmessage = onWorkerMessage
            }

            setInterval(sendComputedElementsToRender, 5)

            workers[0].commands.push(Cmds.Commands.TheFirst)
            workers[0].messagePort.postMessage(new Utils.Message(Utils.Messages.AddedCommand, Cmds.Commands.TheFirst))
            break;

        case Utils.Messages.PlayerInput:
            let newInput = (msg.data) as Utils.Input
            input = newInput
            break;
    }
}

function sendComputedElementsToRender() {
    if (graphicDiff.addedComputedElements.length == 0 &&
        graphicDiff.removedComputedElements.length == 0 &&
        graphicDiff.changedComputedElements.length == 0
    ) {
        return
    }

    postMessage(new Utils.Message(
        Utils.Messages.RenderIt, graphicDiff))
    // set everything to not changed
    for (let cAI of graphicDiff.changedComputedElements) {
        let cE = (components[Comps.Components.ComputedElement][cAI.index] as Comps.ComputedElement)
        cE.isChanged = false
        for (let [pCI, pC] of cE.changedProperties.entries()) {
            if (pCI == 0) {
                let classesDiff = (pC as Comps.ClassesDiff)
                classesDiff.added = []
                classesDiff.deleted = []
                continue;
            }
            pC = false
        }
    }

    graphicDiff = new Utils.GraphicDiff()
}
