import * as ECS from "./ecs.js"
import * as Comps from "./components.js"
import * as Utils from "./utils.js"
import * as Graphics from "./graphics.js"
import * as Anim from "./animations.js"

let entityAnimations: Graphics.EntityAnimation[] = []

let system = new ECS.System()


function addCommands() {
    system.addCommand(new UpdateEntityAnimations())
    system.addCommand(new PlayAnimations())
    system.addCommand(new UpdateComputedElements())
}

enum Commands {
    PlayAnimations,
    UpdateComputedElements,
    UpdateEntityAnimations,
}


class UpdateEntityAnimations implements ECS.Command {
    query: [ECS.Get, Comps.Components[], ECS.By, number | null] | null
    type: number
    frequency: ECS.Run
    constructor() {
        this.type = Commands.UpdateEntityAnimations
        this.frequency = ECS.Run.EveryFrame
        this.query = null
    }

    run(_: ECS.Component[][]): void {
        //        console.log(entityAnimations)
        if (system.getEntities().length == 0) {
            console.log("there are no entities to run this command")
            return
        }

        let isFound = false
        for (let e of system.getEntities()) {
            for (let eA of entityAnimations) {
                if (e.entityUid == eA.entityUid) {
                    isFound = true
                    break;
                }
            }
            if (!isFound) {
                let entityAnimation = new Graphics.EntityAnimation(
                    [new Anim.StickmanIdle(), new Anim.StickmanRun()], e.entityUid)
                entityAnimations.push(entityAnimation)
            }
            isFound = false
        }
        isFound = false

        for (let eAI = entityAnimations.length - 1; eAI >= 0; eAI--) {
            for (let e of system.getEntities()) {
                if (entityAnimations[eAI].entityUid == e.entityUid) {
                    isFound = true
                    break;
                }
            }
            if (!isFound) {
                entityAnimations.splice(eAI, 1)
            }
            isFound = false
        }
    }
}


class UpdateComputedElements implements ECS.Command {
    query: [ECS.Get, Comps.Components[], ECS.By, number | null] | null
    type: number
    frequency: ECS.Run
    constructor() {
        this.type = Commands.UpdateComputedElements
        this.frequency = ECS.Run.EveryFrame
        this.query = [ECS.Get.All, [
            Comps.Components.ComputedElement,
            Comps.Components.Position,
            Comps.Components.LookingDirection
        ], ECS.By.Any, null]
    }

    run(foundComponents: ECS.Component[][]): void {
        if (!Utils.canRun(this.query![1], foundComponents)) return

        for (let computEl of foundComponents[0]) {
            for (let eA of entityAnimations) {
                if (computEl.ownerUid == eA.entityUid && eA.isChanged) {
                    (computEl as Comps.ComputedElement).displayElement = eA.displayElement
                }
            }
            for (let p of foundComponents[1]) {
                if (computEl.ownerUid == p.ownerUid) {
                    let positionVector = (p as Comps.Position).position;
                    (computEl as Comps.ComputedElement).left = positionVector.x;
                    (computEl as Comps.ComputedElement).top = positionVector.y;
                }
            }
            for (let lD of foundComponents[2]) {
                if (computEl.ownerUid == lD.ownerUid) {
                    let isLookingRight = (lD as Comps.LookingDirection).isLookingRight
                    if (isLookingRight) {
                        (computEl as Comps.ComputedElement).classes = ["state", "look-right"]
                    }
                    else {
                        (computEl as Comps.ComputedElement).classes = ["state", "look-left"]
                    }
                }
            }
        }
    }
}
class PlayAnimations implements ECS.Command {
    query: [ECS.Get, Comps.Components[], ECS.By, number | null] | null
    type: number
    frequency: ECS.Run
    constructor() {
        this.type = Commands.PlayAnimations
        this.frequency = ECS.Run.EveryFrame
        this.query = [ECS.Get.All, [Comps.Components.EntityState], ECS.By.Any, null]
    }

    run(foundComponents: ECS.Component[][]): void {
        if (!Utils.canRun(this.query![1], foundComponents)) return
        if (entityAnimations.length == 0) {
            console.log("there are no animations to play")
            return
        }

        for (let eS of foundComponents[0]) {
            for (let eA of entityAnimations) {
                if (eA.entityUid == eS.ownerUid) {
                    eA.play((eS as Comps.EntityState).currentState)
                }
            }
        }
    }
}


// SETUP
let isAddedCommmads = false
onmessage = (e) => {
    if (!isAddedCommmads) {
        addCommands()
        isAddedCommmads = true
    }
    system.update(e.data)
    system.run()
}
