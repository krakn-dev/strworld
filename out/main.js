import * as Utils from "./utils.js";
import * as Comps from "./components.js";
let onWorkerError = (e) => {
    console.log("ERROR!");
    console.error(e);
};
let wManager;
function initializeWorkers() {
    let w0MsgChannel = new MessageChannel();
    let w1MsgChannel = new MessageChannel();
    let w2MsgChannel = new MessageChannel();
    wManager = new Worker("worker_manager.js", { type: "module" });
    let w0 = new Worker("worker.js", { type: "module" });
    let w1 = new Worker("worker.js", { type: "module" });
    let w2 = new Worker("worker.js", { type: "module" });
    let wUids = new Utils.WorkerUids();
    w0.onerror = onWorkerError;
    w1.onerror = onWorkerError;
    w2.onerror = onWorkerError;
    wManager.onerror = onWorkerError;
    wManager.postMessage(new Utils.Message(Utils.Messages.Start, wUids), [
        w0MsgChannel.port1,
        w1MsgChannel.port1,
        w2MsgChannel.port1
    ]);
    w0.postMessage(wUids.w0Uid, [
        w0MsgChannel.port2,
    ]);
    w1.postMessage(wUids.w1Uid, [
        w1MsgChannel.port2,
    ]);
    w2.postMessage(wUids.w2Uid, [
        w2MsgChannel.port2,
    ]);
    setInterval(sendInput, 20);
    wManager.onmessage = onWManagerMessage;
}
initializeWorkers();
let documentObjects = [];
class DocumentObject {
    constructor(newEntityUid) {
        this.currentTransform = new Utils.Vector2(0, 0);
        this.entityUid = newEntityUid;
        let worldView = document.getElementById("world-view");
        worldView.insertAdjacentHTML("beforeend", `<div id="${newEntityUid}"></div>`);
        this.stateElement = document.getElementById(newEntityUid.toString());
    }
    addClasses(newClasses) {
        for (let nC of newClasses) {
            this.stateElement.classList.add(nC);
        }
    }
    removeClasses(classesToRemove) {
        for (let nC of classesToRemove) {
            this.stateElement.classList.remove(nC);
        }
    }
    setColor(newColor) {
        this.stateElement.style.color = newColor;
    }
    //    setLeft(newLeft: number) {
    //    }
    setTransform(newLeft, newTop) {
        if (newLeft && newTop) {
            this.currentTransform.y = newTop;
            this.currentTransform.x = newLeft;
            this.stateElement.style.transform = `translateY(${newTop}px) translateX(${newLeft}px)`;
        }
        if (newLeft && !newTop) {
            this.currentTransform.x = newLeft;
            this.stateElement.style.transform = `translateY(${this.currentTransform.y}px) translateX(${newLeft}px)`;
        }
        if (!newLeft && newTop) {
            this.currentTransform.y = newTop;
            this.stateElement.style.transform = `translateY(${newTop}px) translateX(${this.currentTransform.x}px)`;
        }
    }
    setZIndex(newZIndex) {
        this.stateElement.style.zIndex = newZIndex.toString();
    }
    setDisplayElement(newDisplayElement) {
        this.stateElement.innerHTML = newDisplayElement;
    }
    dispose() {
        this.stateElement.remove();
    }
}
function onWManagerMessage(data) {
    let start = performance.now();
    let msg = data.data;
    let newData = msg.data;
    switch (msg.message) {
        case Utils.Messages.RenderIt:
            let isFound = false;
            for (let cCE of newData.changedComputedElements) {
                for (let dO of documentObjects) {
                    if (cCE.entityUid == dO.entityUid) {
                        for (let [pCI, pC] of cCE.changedProperties.entries()) {
                            if (!pC)
                                continue;
                            switch (pCI) {
                                case Comps.Properties.Classes:
                                    let classesDiff = pC;
                                    dO.addClasses(classesDiff.added);
                                    dO.removeClasses(classesDiff.deleted);
                                    break;
                                case Comps.Properties.Color:
                                    dO.setColor(cCE.properties[pCI]);
                                    break;
                                case Comps.Properties.DisplayElement:
                                    dO.setDisplayElement(cCE.properties[pCI]);
                                    break;
                                case Comps.Properties.Left:
                                case Comps.Properties.Top:
                                    dO.setTransform(cCE.changedProperties[Comps.Properties.Left] ?
                                        cCE.properties[Comps.Properties.Left] : null, cCE.changedProperties[Comps.Properties.Top] ?
                                        cCE.properties[Comps.Properties.Top] : null);
                                    break;
                                case Comps.Properties.ZIndex:
                                    dO.setZIndex(cCE.properties[pCI]);
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
            for (let nCE of newData.addedComputedElements) {
                let documentObject = new DocumentObject(nCE.entityUid);
                documentObject.addClasses(nCE.properties[Comps.Properties.Classes]);
                documentObject.setColor(nCE.properties[Comps.Properties.Color]);
                documentObject.setDisplayElement(nCE.properties[Comps.Properties.DisplayElement]);
                documentObject.setTransform(nCE.properties[Comps.Properties.Left], nCE.properties[Comps.Properties.Top]);
                documentObject.setZIndex(nCE.properties[Comps.Properties.ZIndex]);
                documentObjects.push(documentObject);
            }
            for (let rCE of newData.removedComputedElements) {
                for (let dOI = documentObjects.length - 1; dOI >= 0; dOI--) {
                    if (rCE.entityUid == documentObjects[dOI].entityUid) {
                        documentObjects[dOI].dispose();
                        documentObjects.splice(dOI, 1);
                    }
                }
            }
            let stop = performance.now();
            if ((stop - start) > 10) {
                console.log(stop - start);
            }
            break;
    }
}
function sendInput() {
    wManager.postMessage(new Utils.Message(Utils.Messages.PlayerInput, new Utils.Input(KeyboardInput.result)));
}
class KeyboardInput {
    static onKeyDown(event) {
        if (event.key == "w" || event.key == "ArrowUp")
            KeyboardInput.up = true;
        if (event.key == "s" || event.key == "ArrowDown")
            KeyboardInput.down = true;
        if (event.key == "a" || event.key == "ArrowLeft")
            KeyboardInput.left = true;
        if (event.key == "d" || event.key == "ArrowRight")
            KeyboardInput.right = true;
        KeyboardInput.setPlayerInput();
    }
    static onKeyUp(event) {
        if (event.key == "w" || event.key == "ArrowUp")
            KeyboardInput.up = false;
        if (event.key == "s" || event.key == "ArrowDown")
            KeyboardInput.down = false;
        if (event.key == "a" || event.key == "ArrowLeft")
            KeyboardInput.left = false;
        if (event.key == "d" || event.key == "ArrowRight")
            KeyboardInput.right = false;
        KeyboardInput.setPlayerInput();
    }
    static setPlayerInput() {
        KeyboardInput.result.x = 0;
        KeyboardInput.result.y = 0;
        if (KeyboardInput.down)
            KeyboardInput.result.y++;
        if (KeyboardInput.up)
            KeyboardInput.result.y--;
        if (KeyboardInput.left)
            KeyboardInput.result.x--;
        if (KeyboardInput.right)
            KeyboardInput.result.x++;
    }
}
KeyboardInput.up = false;
KeyboardInput.down = false;
KeyboardInput.left = false;
KeyboardInput.right = false;
KeyboardInput.result = new Utils.Vector2(0, 0);
document.addEventListener("keyup", KeyboardInput.onKeyUp);
document.addEventListener("keydown", KeyboardInput.onKeyDown);
