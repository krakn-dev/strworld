import * as Utils from "./utils.js"
import * as Graphics from "./graphics.js"
import * as Comps from "./components.js"
import * as ECS from "./ecs.js"


let system = new ECS.System()

let deletedComputedElements: number[] = []
let updatedComputedElements: Comps.ComputedElement[] = []
let newComputedElements: Comps.ComputedElement[] = []

function addCommands() {
    system.addCommand(new GetChangedComputedElements())
}

enum Commands {
    RenderEntities,
    SyncNumberOfLocalComputedElements,
}

let oldComputedElements: Comps.ComputedElement[] = []

class GetChangedComputedElements implements ECS.Command {

    query: [ECS.Get, Comps.Components[], ECS.By, number | null] | null
    type: number
    frequency: ECS.Run
    constructor() {
        this.frequency = ECS.Run.EveryFrame
        this.type = Commands.SyncNumberOfLocalComputedElements
        this.query = [ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null]
    }

    run(foundComponents: ECS.Component[][]): void {
        if (!Utils.canRun(this.query![1], foundComponents)) return

        if (oldComputedElements.length == 0) { // initialize
            oldComputedElements = foundComponents[0] as Comps.ComputedElement[]
            return
        }


        let isFound = false
        for (let oldCEI = oldComputedElements.length - 1; oldCEI >= 0; oldCEI--) {
            for (let newCE of foundComponents[0]) {
                if (newCE.ownerUid == oldComputedElements[oldCEI].ownerUid) {
                    isFound = true
                }
            }
            if (!isFound) deletedComputedElements.push(oldComputedElements[oldCEI].ownerUid)
            isFound = false
        }

        for (let [newCEI, newCE] of foundComponents[0].entries()) {
            for (let oldCE of oldComputedElements) {
                if (newCE.ownerUid == oldCE.ownerUid) {
                    for (let pI = 0; pI < oldCE.changedProperties.length; pI++) {
                        if ((newCE as Comps.ComputedElement).changedProperties[pI]) {
                            updatedComputedElements.push(newCE as Comps.ComputedElement);
                            (foundComponents[0][newCEI] as Comps.ComputedElement).changedProperties[pI] = false
                        }
                    }
                }
            }
        }

        isFound = false
        for (let newCE of foundComponents[0]) {
            for (let oldCE of oldComputedElements) {
                if (newCE.ownerUid == oldCE.ownerUid) {
                    isFound = true
                }
            }
            if (!isFound) newComputedElements.push(newCE as Comps.ComputedElement)
            isFound = false
        }
        oldComputedElements = foundComponents[0] as Comps.ComputedElement[]
    }
}


onmessage = (e) => {

    if (e.data.length == 0) {

        postMessage([
            [
                system.getComponents(),
                system.getEntities()
            ],
            {
                new: newComputedElements,
                updated: updatedComputedElements,
                toDelete: deletedComputedElements
            }])

        return
    }

    system.filterUpdate(e.data);
    system.run()
    postMessage([
        [
            system.getComponents(),
            system.getEntities()
        ],
        {
            new: newComputedElements,
            updated: updatedComputedElements,
            toDelete: deletedComputedElements
        }])

    deletedComputedElements = []
    newComputedElements = []
    updatedComputedElements = []
}


// SETUP
system.update([
    (() => { // fill component list with the number of component types
        let r = []
        for (let i = 0; i < Object.keys(Comps.Components).length / 2; i++) {
            r.push([])
        }
        return r
    })(),
    []])

addCommands()

postMessage([
    [
        system.getComponents(),
        system.getEntities()
    ],
    {
        new: newComputedElements,
        updated: updatedComputedElements,
        toDelete: deletedComputedElements
    }])
