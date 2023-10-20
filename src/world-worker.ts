import * as ECS from "./ecs.js"
import * as Ents from "./entities.js"
import * as Utils from "./utils.js"
import * as Comps from "./components.js"


let system = new ECS.System()

function addCommands() {
    system.addCommand(new CreateHumanAndGrass())
}

enum Commands {
    CreateHumanAndGrass,
}


class CreateHumanAndGrass implements ECS.Command {
    query: [ECS.Get, Comps.Components[], ECS.By, number | null] | null
    type: number
    frequency: ECS.Run
    constructor() {
        this.frequency = ECS.Run.Once
        this.type = Commands.CreateHumanAndGrass
        this.query = null
    }

    counter = 0
    run(_: ECS.Component[][]): void {
        console.log("run")
        for (let x = 0; x <= 20; x++) {
            for (let y = 0; y <= 20; y++) {
                let human = new Ents.Human()
                system.addEntity(human)
                system.addComponent(new Comps.Health(10, human.entityUid))
                system.addComponent(new Comps.EntityState(Comps.EntityStates.Idle, human.entityUid))
                system.addComponent(new Comps.Position(new Utils.Vector2(x * 50, y * 50), human.entityUid))
                system.addComponent(new Comps.ComputedElement(human.entityUid))
                system.addComponent(new Comps.LookingDirection(true, human.entityUid))
                system.addComponent(new Comps.Name("finn", human.entityUid))
            }
        }


        //        let grass = new Ents.Grass()
        //        system.addEntity(grass)
        //        system.addComponent(new Comps.Health(1, grass.entityUid), Comps.Components.Health)
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
    postMessage([system.getComponents(), system.getEntities()])
}
