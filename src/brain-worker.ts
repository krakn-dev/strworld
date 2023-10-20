import * as ECS from "./ecs.js"
import * as Comps from "./components.js"
import * as Utils from "./utils.js"
import * as Ents from "./entities.js"



let system = new ECS.System()
let input = new Utils.Vector2(0, 1)

function addCommands() {
    system.addCommand(new MovePlayer())
}

enum Commands {
    MovePlayer,
}


export class MovePlayer implements ECS.Command {

    query: [ECS.Get, Comps.Components[], ECS.By, number | null] | null
    type: number
    frequency: ECS.Run
    constructor() {
        this.frequency = ECS.Run.EveryFrame
        this.type = Commands.MovePlayer
        this.query = [ECS.Get.All,
        [
            Comps.Components.Position,
            Comps.Components.EntityState,
            Comps.Components.LookingDirection
        ],
        ECS.By.EntityType, Ents.Entities.Human]
    }
    // post message manually
    run(foundComponents: ECS.Component[][]): void {
        //console.log(foundComponents)
        if (!Utils.canRun(this.query![1], foundComponents))
            return

        if (input.x == 0 && input.y == 0) {
            (foundComponents[1][0] as Comps.EntityState).currentState = Comps.EntityStates.Idle
            return
        }


        let wentRight: boolean | null = null;

        if (input.x == -1)
            wentRight = false
        if (input.x == 1)
            wentRight = true;

        if (input.y == 1)
            (foundComponents[0][0] as Comps.Position).position.y -= 1;

        if (input.y == -1)
            (foundComponents[0][0] as Comps.Position).position.y += 1;

        if (input.x == 1)
            (foundComponents[0][0] as Comps.Position).position.x += 1;

        if (input.x == -1)
            (foundComponents[0][0] as Comps.Position).position.x -= 1;

        if (wentRight != null)
            (foundComponents[2][0] as Comps.LookingDirection).isLookingRight = wentRight;



        (foundComponents[1][0] as Comps.EntityState).currentState = Comps.EntityStates.Run
    }
}




// SETUP
let isAddedCommmads = false
onmessage = (e) => {
    if (!isAddedCommmads) {
        addCommands()
        isAddedCommmads = true
    }
    if (e.data[0]) {
        Object.setPrototypeOf(e.data[1], Utils.Vector2.prototype)
        input.assign(e.data[1])
    }
    else {
        system.update(e.data[1])
        system.run()
        postMessage([system.getComponents(), system.getEntities()])
    }
}
