import * as Utils from "./utils.js"
import * as ECS from "./ecs.js"
import * as Cmds from "./commands.js"
import * as Comps from "./components.js"

onerror = () => { console.log("helpme <- manager") }

let w0: MessagePort | null = null
let w1: MessagePort | null = null
let w2: MessagePort | null = null;

let commands: ECS.Command[] = [new Cmds.ShowHealth()]
let components: ECS.Component[][] = []
let state: Map<string, any> = new Map()

for (let _ = 0; _ < Utils.NUMBER_OF_COMPONENTS; _++) {
    components.push([])
}


let numberOfMessages = 0
function onWorkerMessage(data: any) {
    // sync state changes
    let msg = (data.data as Utils.Message)
    let newData = msg.data as Utils.WorkerOutput

    switch (msg.message) {
        case Utils.Messages.Done:
            for (let newKey of newData.state!.get(Utils.CHANGES_KEY) as string[]) {
                let newValue = newData.state!.get(newKey)
                state.set(newKey, newValue)
            }
            state.set(Utils.CHANGES_KEY, [])

            console.log("remove", newData.commandsToRemove)
            // add commands
            let isFound = false
            for (let nC of newData.commandsToAdd!) {
                for (let c of commands) {
                    if (nC == c.type) {
                        isFound = true
                        console.log("command already in list")
                        break;
                    }
                }
                if (isFound) continue

                switch (nC) {
                    case Cmds.Commands.ShowHealth:
                        commands.push(new Cmds.ShowHealth())
                        break;
                    case Cmds.Commands.CreateHealth:
                        commands.push(new Cmds.CreateHealth())
                        break;
                }
            }

            // add components
            for (let c of newData.componentsToAdd!) {
                components[c.type].push(c)
            }
            // delete components
            for (let cI of newData.componentsToRemove!) {
                components[cI[0]].splice(cI[1], 1)
            }
            // change properties
            for (let pC of newData.propertiesToChange!) {
                (components[pC.index[0]][pC.index[1]] as Utils.IIndexable)[pC.property] = pC.value
            }

            // remove commands
            for (let nC of newData.commandsToRemove!) {
                for (let [cI, c] of commands.entries()) {
                    if (nC == c.type) {
                        commands.splice(cI, 1)
                    }
                }
            }

            // check if is last worker
            numberOfMessages++
            if (numberOfMessages == 1) {
                numberOfMessages = 0
                step()
            }
            break;

        case Utils.Messages.AyeAyeCaptain:
            numberOfMessages++
            if (numberOfMessages == 3) {
                numberOfMessages = 0
                step()
            }
            break;
    }
}

async function step() {
    let commandTypes = commands.map(a => a.type)
    let splitCommandTypes = Utils.divideList(commandTypes, 3)

    await Utils.delay(1000)

    let inputData = new Utils.WorkerInput(
        state,
        components,
        splitCommandTypes[0])

    let newMsg = new Utils.Message(
        Utils.Messages.Work,
        inputData
    )

    if (splitCommandTypes[0] != null && splitCommandTypes[0].length != 0) {
        w0!.postMessage(newMsg)
    }

    if (splitCommandTypes[1] != null && splitCommandTypes[1].length != 0) {
        inputData.commands = splitCommandTypes[1]
        w1!.postMessage(newMsg)
    }

    if (splitCommandTypes[2] != null && splitCommandTypes[2].length != 0) {
        w2!.postMessage(newMsg)
        inputData.commands = splitCommandTypes[2]
    }
}

// Main
onmessage = async (data: any) => {
    let msg = (data.data.message) as Utils.Messages
    switch (msg) {
        case Utils.Messages.Start:
            await Utils.delay(1000) // wait for all workers to initialize

            w0 = data.ports[0]
            w1 = data.ports[1]
            w2 = data.ports[2]

            w0!.onmessage = onWorkerMessage
            w1!.onmessage = onWorkerMessage
            w2!.onmessage = onWorkerMessage

            state.set(Utils.CHANGES_KEY, [])

            //
            let areYouReady = new Utils.Message(Utils.Messages.AreYouReadyKids)
            w0!.postMessage(areYouReady)
            w1!.postMessage(areYouReady)
            w2!.postMessage(areYouReady)
            break;
    }
}
