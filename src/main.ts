import * as Utils from "./utils.js"
import * as Comps from "./components.js"

let onWorkerError = (e: any) => {
    console.log("ERROR!")
    console.error(e)
}

let w0: Worker;


function initializeWorkers() {
    let w1MsgChannel = new MessageChannel();
    let w2MsgChannel = new MessageChannel();
    let w3MsgChannel = new MessageChannel();

    w0 = new Worker("w0.js", { type: "module" });
    let w1 = new Worker("worker.js", { type: "module" });
    let w2 = new Worker("worker.js", { type: "module" });
    let w3 = new Worker("worker.js", { type: "module" });

    w1.onerror = onWorkerError
    w2.onerror = onWorkerError
    w3.onerror = onWorkerError
    w0.onerror = onWorkerError

    w0.postMessage(
        new Utils.Message(Utils.Messages.Start),
        [
            w1MsgChannel.port1,
            w2MsgChannel.port1,
            w3MsgChannel.port1
        ])

    w1.postMessage(
        1,
        [
            w1MsgChannel.port2,
        ])

    w2.postMessage(
        2,
        [
            w2MsgChannel.port2,
        ])

    w3.postMessage(
        3,
        [
            w3MsgChannel.port2,
        ])

    setInterval(sendInput, 20)

    w0.onmessage = onW0Message
}
initializeWorkers()

let documentObjects: DocumentObject[] = []

class DocumentObject {
    private stateElement: HTMLElement
    private currentTransform: Utils.Vector2
    entityUid: number


    constructor(newEntityUid: number) {
        this.currentTransform = new Utils.Vector2(0, 0)
        this.entityUid = newEntityUid;
        let worldView = document.getElementById("world-view")
        worldView!.insertAdjacentHTML("beforeend", `<div id="${newEntityUid}"></div>`);

        this.stateElement = document.getElementById(newEntityUid.toString())!
    }

    addClasses(newClasses: string[]) {
        for (let nC of newClasses) {
            this.stateElement.classList.add(nC)
        }
    }
    removeClasses(classesToRemove: string[]) {
        for (let nC of classesToRemove) {
            this.stateElement.classList.remove(nC)
        }
    }
    setColor(newColor: string) {
        this.stateElement.style.color = newColor
    }
    //    setLeft(newLeft: number) {
    //    }
    setTransform(newLeft: number | null, newTop: number | null) {
        if (newLeft && newTop) {
            this.currentTransform.y = newTop
            this.currentTransform.x = newLeft
            this.stateElement.style.transform = `translateY(${newTop}px) translateX(${newLeft}px)`
        }
        if (newLeft && !newTop) {
            this.currentTransform.x = newLeft
            this.stateElement.style.transform = `translateY(${this.currentTransform.y}px) translateX(${newLeft}px)`
        }
        if (!newLeft && newTop) {
            this.currentTransform.y = newTop
            this.stateElement.style.transform = `translateY(${newTop}px) translateX(${this.currentTransform.x}px)`
        }
    }
    setZIndex(newZIndex: number) {
        this.stateElement.style.zIndex = newZIndex.toString()
    }
    setDisplayElement(newDisplayElement: string) {
        this.stateElement.innerHTML = newDisplayElement
    }
    dispose() {
        this.stateElement.remove()
    }
}

function onW0Message(data: any) {

    let start = performance.now()

    let msg = (data.data as Utils.Message)
    let newData = msg.data as Utils.GraphicDiff

    switch (msg.message) {
        case Utils.Messages.RenderIt:
            let isFound = false
            for (let cAI of newData.changedComputedElements) {
                let cCE = cAI.component as Comps.ComputedElement
                for (let dO of documentObjects) {
                    if (cCE.entityUid == dO.entityUid) {
                        for (let [pCI, pC] of cCE.changedProperties.entries()) {
                            if (!pC) continue

                            switch (pCI) {
                                case Comps.Properties.Classes:
                                    let classesDiff = pC as Comps.ClassesDiff
                                    dO.addClasses(classesDiff.added)
                                    dO.removeClasses(classesDiff.deleted)
                                    break;

                                case Comps.Properties.Color:
                                    dO.setColor(cCE.properties[pCI])
                                    break;

                                case Comps.Properties.DisplayElement:
                                    dO.setDisplayElement(cCE.properties[pCI])
                                    break;

                                case Comps.Properties.Left: case Comps.Properties.Top:
                                    dO.setTransform(
                                        cCE.changedProperties[Comps.Properties.Left] ?
                                            cCE.properties[Comps.Properties.Left] as number : null,
                                        cCE.changedProperties[Comps.Properties.Top] ?
                                            cCE.properties[Comps.Properties.Top] as number : null)
                                    break;

                                case Comps.Properties.ZIndex:
                                    dO.setZIndex(cCE.properties[pCI] as number)
                                    break;
                            }
                        }

                        //                       isFound = true
                        break;
                    }
                    //                    if (isFound) break;
                    //                    isFound = false
                }
            }

            for (let cAI of newData.addedComputedElements) {
                let nCE = cAI.component as Comps.ComputedElement
                let documentObject = new DocumentObject(nCE.entityUid)
                documentObject.addClasses(nCE.properties[Comps.Properties.Classes])
                documentObject.setColor(nCE.properties[Comps.Properties.Color])
                documentObject.setDisplayElement(nCE.properties[Comps.Properties.DisplayElement])
                documentObject.setTransform(nCE.properties[Comps.Properties.Left], nCE.properties[Comps.Properties.Top])
                documentObject.setZIndex(nCE.properties[Comps.Properties.ZIndex])

                documentObjects.push(documentObject)
            }
            for (let cAI of newData.removedComputedElements) {
                let rCE = cAI.component as Comps.ComputedElement
                for (let dOI = documentObjects.length - 1; dOI >= 0; dOI--) {
                    if (rCE.entityUid == documentObjects[dOI].entityUid) {
                        documentObjects[dOI].dispose()
                        documentObjects.splice(dOI, 1)
                    }
                }
            }
            break;


    }
}





function sendInput() {
    w0.postMessage(new Utils.Message(Utils.Messages.PlayerInput, new Utils.Input(KeyboardInput.result)))
}


class KeyboardInput {
    static up = false
    static down = false
    static left = false
    static right = false

    static result = new Utils.Vector2(0, 0)

    static onKeyDown(event: any) {
        if (event.key == "w" || event.key == "ArrowUp")
            KeyboardInput.up = true

        if (event.key == "s" || event.key == "ArrowDown")
            KeyboardInput.down = true

        if (event.key == "a" || event.key == "ArrowLeft")
            KeyboardInput.left = true

        if (event.key == "d" || event.key == "ArrowRight")
            KeyboardInput.right = true

        KeyboardInput.setPlayerInput()
    }
    static onKeyUp(event: any) {

        if (event.key == "w" || event.key == "ArrowUp")
            KeyboardInput.up = false

        if (event.key == "s" || event.key == "ArrowDown")
            KeyboardInput.down = false

        if (event.key == "a" || event.key == "ArrowLeft")
            KeyboardInput.left = false

        if (event.key == "d" || event.key == "ArrowRight")
            KeyboardInput.right = false

        KeyboardInput.setPlayerInput()
    }

    static setPlayerInput() {
        KeyboardInput.result.x = 0
        KeyboardInput.result.y = 0

        if (KeyboardInput.down)
            KeyboardInput.result.y++

        if (KeyboardInput.up)
            KeyboardInput.result.y--

        if (KeyboardInput.left)
            KeyboardInput.result.x--

        if (KeyboardInput.right)
            KeyboardInput.result.x++
    }
}

document.addEventListener(
    "keyup",
    KeyboardInput.onKeyUp,
);
document.addEventListener(
    "keydown",
    KeyboardInput.onKeyDown,
);
