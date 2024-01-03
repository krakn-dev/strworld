import * as Ser from "./serialization"
import * as Graph from "./graphics"
import "./ui"
import * as Input from "./input"

let world = new Graph.World()
let graphicChangesHandler = new Graph.GraphicChangesHandler()
world.setup()

let keyboardInput = new Input.KeyboardInput()
let worker = new Worker(
    new URL('worker', import.meta.url),
    { type: "module" });

worker.postMessage(
    new Ser.Message(
        Ser.Messages.Start,
        new Ser.DOMData(window.innerWidth, window.innerHeight)
    ));

worker.onmessage = onWorkerMessage
setInterval(sendInputToWorker, 30)

world.renderLoop()

function sendInputToWorker() {
    worker.postMessage(
        new Ser.Message(
            Ser.Messages.Input,
            new Ser.Input(
                keyboardInput.movementDirection
            )
        )
    )
}

function onWorkerMessage(data: any) {
    let msg = (data.data as Ser.Message)
    switch (msg.message) {
        case Ser.Messages.GraphicChanges: {
            let newData = msg.data as Ser.GraphicChanges
            graphicChangesHandler.run(world, newData)
        } break;
    }
}


//    let msg = (data.data as Ser.Message)
//    let newData = msg.data as Ser.GraphicChanges
//
//    switch (msg.message) {
//        case Ser.Messages.GraphicChanges:
//            for (let cAI of newData.changedGraphicProperties) {
//                let cCE = cAI as Comps.GraphicProperties
//                for (let dO of documentObjects) {
//                    if (cCE.componentUid != dO.componentUid) continue
//
//                    if (cCE.isColorChanged)
//                        dO.setColor(cCE.color)
//
//                    if (cCE.isDisplayElementChanged)
//                        dO.setDisplayElement(cCE.displayElement)
//
//                    if (cCE.isTranslateXChanged)
//                        dO.setTranslateX(cCE.translateX)
//
//                    if (cCE.isTranslateYChanged)
//                        dO.setTranslateY(cCE.translateY)
//
//                    if (cCE.isZIndexChanged)
//                        dO.setZIndex(cCE.zIndex)
//
//                    if (cCE.addedClasses.size != 0)
//                        dO.addClasses(Array.from(cCE.addedClasses.values()))
//
//                    if (cCE.removedClasses.size != 0)
//                        dO.removeClasses(Array.from(cCE.removedClasses.values()))
//
//                    break;
//                }
//            }
//
//            for (let cAI of newData.addedGraphicProperties) {
//                let nCE = cAI as Comps.GraphicProperties
//                let documentObject = new DocumentObject(nCE.componentUid)
//                documentObject.addClasses(Array.from(nCE.classes.values()))
//                documentObject.setColor(nCE.color)
//                documentObject.setDisplayElement(nCE.displayElement)
//                documentObject.setTranslateX(nCE.translateX)
//                documentObject.setTranslateY(nCE.translateY)
//                documentObject.setZIndex(nCE.zIndex)
//
//                documentObjects.push(documentObject)
//            }
//            for (let cAI of newData.removedComputedElements) {
//                let rCE = cAI.component as Comps.GraphicProperties
//
//                for (let dOI = documentObjects.length - 1; dOI >= 0; dOI--) {
//                    if (rCE.componentUid == documentObjects[dOI].componentUid) {
//                        documentObjects[dOI].dispose()
//                        documentObjects.splice(dOI, 1)
//                    }
//                }
//            }
//            break;
//
//
//    }
//}


// disable right click
document.addEventListener('contextmenu', event => {
    event.preventDefault();
});
