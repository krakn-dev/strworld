import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"


let wManager: MessagePort | null = null
let system = new ECS.System()


function onManagerMessage(data: any) {
    let msg = (data.data) as Utils.Message
    switch (msg.message) {
        case Utils.Messages.AreYouReadyKids:
            wManager!.postMessage(new Utils.Message(Utils.Messages.AyeAyeCaptain, system.workerUid))
            break;
        case Utils.Messages.Work:
            let start = performance.now()
            let newData = msg.data as Utils.WorkerInput
            system.update(newData.components, newData.commands, newData.state, newData.input)
            system.run()
            let stop = performance.now()
            if ((stop - start) > 10)
                console.log(stop - start)
            break;
        case Utils.Messages.WakeUp:
            console.log("wokenup")
            wManager!.postMessage(new Utils.Message(Utils.Messages.BdsabasdmbswhaWhat, system.workerUid))
            break;
    }
}

onmessage = (data) => {
    wManager = data.ports[0]
    wManager.onmessage = onManagerMessage
    system.workerManager = wManager
    system.workerUid = data.data
}
