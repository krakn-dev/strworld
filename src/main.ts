import * as ECS from "./ecs_engine.js"
import * as Utils from "./utils.js"
import * as Graphics from "./graphic_engine.js"

ECS.EcsEngine.BindCommand(new Graphics.SyncGraphicEntity(), ECS.Frequency.EveryStep, ECS.Order.First, null)

let fox = new ECS.Fox()
ECS.EcsEngine.entities.push(fox)
ECS.EcsEngine.components.push(new ECS.Name("foxo", fox.entityUid))
ECS.EcsEngine.components.push(new ECS.SpriteDirection(fox.entityUid))
ECS.EcsEngine.components.push(new ECS.Health(10, fox.entityUid))
let position = new ECS.Position(new Utils.Vector2(4, 6), fox.entityUid)
ECS.EcsEngine.components.push(position)




export class SpawnGrass implements ECS.Command {
    get: ECS.Get
    component: ECS.Components[] | null
    by: ECS.By | null
    byArgs: number | ECS.Entities | null
    commandtype: ECS.Commands

    constructor() {
        this.get = ECS.Get.None
        this.commandtype = ECS.Commands.SpawnGrass
        this.component = null
        this.by = null
        this.byArgs = null
    }
    run(_: ECS.Component[]): void {
        for (var yI = 0; yI < 10; yI++) {
            for (var xI = 0; xI < 10; xI++) {
                let grass = new ECS.Grass()
                ECS.EcsEngine.entities.push(grass)
                ECS.EcsEngine.components.push(new ECS.Health(1, grass.entityUid))
                ECS.EcsEngine.components.push(new ECS.Position(new Utils.Vector2(xI, yI), grass.entityUid))
                Graphics.GraphicEngine.graphicEntities.push(new Graphics.GraphicGrass(grass.entityUid))
            }
        }
    }
}

ECS.EcsEngine.BindCommand(new SpawnGrass(), ECS.Frequency.Startup, ECS.Order.First, null)





export class MovePlayer implements ECS.Command {
    get: ECS.Get
    component: ECS.Components[] | null
    by: ECS.By | null
    byArgs: number | ECS.Entities | null
    commandtype: ECS.Commands

    constructor(newEntityUid: number) {
        this.commandtype = ECS.Commands.MovePlayer
        this.component = [ECS.Components.Position, ECS.Components.SpriteDirection]
        this.get = ECS.Get.OneOfEach
        this.by = ECS.By.EntityUid
        this.byArgs = newEntityUid
    }
    run(args: ECS.Component[]): void {
        let wentRight = true

        if (Input.direction.x == 1)
            wentRight = true;
        if (Input.direction.x == -1)
            wentRight = false
        for (var a of args) {
            switch (a.componentType) {
                case ECS.Components.Position:
                    (a as ECS.Position).position.x += Input.direction.x;
                    (a as ECS.Position).position.y += Input.direction.y;
                    Input.direction = new Utils.Vector2(0, 0)

                    break;
                case ECS.Components.SpriteDirection:
                    (a as ECS.SpriteDirection).isLookingRight = wentRight
                    break;
            }

        }
    }
}
ECS.EcsEngine.BindCommand(new MovePlayer(fox.entityUid), ECS.Frequency.EveryStep, ECS.Order.First, null)

let ecs = new ECS.EcsEngine();
let graphics = new Graphics.GraphicEngine(new Utils.Vector2(10, 10));
Graphics.GraphicEngine.graphicEntities.push(new Graphics.GraphicFox(position.position, fox.entityUid))

class Input {
    static direction = new Utils.Vector2(0, 0)
    static onInput(event: any) {
        switch (event.key) {
            case "j":
                Input.direction.y += 1
                break;
            case "k":
                Input.direction.y -= 1
                break;
            case "h":
                Input.direction.x -= 1
                break;
            case "l":
                Input.direction.x += 1
                break;
        }
    }
}
document.addEventListener(
    "keydown",
    Input.onInput,
);














function run(): void {
    ecs.step()
    graphics.render()
}
run()

window.setInterval(run, 100)
