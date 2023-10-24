import * as Utils from "./utils.js";
import * as Graphics from "./graphics.js";
import * as Comps from "./components.js";
const LOOP_DURATION = 1;
let componentsAndEntities;
let documentEntities = [];
// post message manually
function mainLoop() {
    console.log(componentsAndEntities);
    brainWorker.postMessage([false, componentsAndEntities]);
    brainWorker.postMessage([true, Input.input]);
    graphicsWorker.postMessage(componentsAndEntities);
    setInterval(mainLoop, LOOP_DURATION);
}
function addDocumentEntities(newComputedElements) {
    for (let nCE of newComputedElements) {
        documentEntities.push(new Graphics.DocumentEntity(nCE.ownerUid));
    }
}
function deleteDocumentEntities(computedElementsOwnerUid) {
    for (let [dEI, dE] of documentEntities.entries()) {
        if (dE.entityUid == computedElementsOwnerUid) {
            documentEntities[dEI].dispose();
            documentEntities.splice(dEI, 1);
        }
    }
}
function updateDocumentEntities(updatedComputedElements) {
    for (let uCE of updatedComputedElements) {
        for (let dE of documentEntities) {
            if (uCE.ownerUid == dE.entityUid) {
                for (let [i, pC] of uCE.changedProperties.entries()) {
                    if (pC) {
                        switch (i) {
                            case Comps.Properties.Classes:
                                dE.setClasses(uCE.classes);
                                break;
                            case Comps.Properties.Color:
                                dE.setColor(uCE.color);
                                break;
                            case Comps.Properties.DisplayElement:
                                dE.setDisplayElement(uCE.displayElement);
                                break;
                            case Comps.Properties.Left:
                                dE.setLeft(uCE.left);
                                break;
                            case Comps.Properties.Top:
                                dE.setTop(uCE.top);
                                break;
                            case Comps.Properties.ZIndex:
                                dE.setZIndex(uCE.zIndex);
                                break;
                        }
                    }
                }
            }
        }
    }
}
const managerWorker = new Worker("manager-worker.js", { type: 'module' });
managerWorker.onerror = (e) => console.log(e);
managerWorker.onmessage = (e) => {
    componentsAndEntities = e.data[0];
    addDocumentEntities(e.data[1].new);
    deleteDocumentEntities(e.data[1].toDelete);
    updateDocumentEntities(e.data[1].updated);
};
managerWorker.postMessage([]);
const worldWorker = new Worker("world-worker.js", { type: 'module' });
worldWorker.onerror = (e) => console.log(e);
worldWorker.onmessage = (e) => managerWorker.postMessage(e.data);
const brainWorker = new Worker("brain-worker.js", { type: 'module' });
brainWorker.onerror = (e) => console.log(e);
brainWorker.onmessage = (e) => managerWorker.postMessage(e.data);
const graphicsWorker = new Worker("graphics-worker.js", { type: 'module' });
graphicsWorker.onerror = (e) => console.log(e);
graphicsWorker.onmessage = (e) => managerWorker.postMessage(e.data);
class Input {
    static onKeyDown(event) {
        if (event.key == "w" || event.key == "ArrowUp")
            Input.up = true;
        if (event.key == "s" || event.key == "ArrowDown")
            Input.down = true;
        if (event.key == "a" || event.key == "ArrowLeft")
            Input.left = true;
        if (event.key == "d" || event.key == "ArrowRight")
            Input.right = true;
        Input.setPlayerInput();
    }
    static onKeyUp(event) {
        if (event.key == "w" || event.key == "ArrowUp")
            Input.up = false;
        if (event.key == "s" || event.key == "ArrowDown")
            Input.down = false;
        if (event.key == "a" || event.key == "ArrowLeft")
            Input.left = false;
        if (event.key == "d" || event.key == "ArrowRight")
            Input.right = false;
        Input.setPlayerInput();
    }
    static setPlayerInput() {
        Input.input.x = 0;
        Input.input.y = 0;
        if (Input.down)
            Input.input.y--;
        if (Input.up)
            Input.input.y++;
        if (Input.left)
            Input.input.x--;
        if (Input.right)
            Input.input.x++;
    }
}
Input.up = false;
Input.down = false;
Input.left = false;
Input.right = false;
Input.input = new Utils.Vector2(0, 0);
document.addEventListener("keyup", Input.onKeyUp);
document.addEventListener("keydown", Input.onKeyDown);
mainLoop();
