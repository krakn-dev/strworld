import * as ECS from "./ecs_engine.js"
import * as Utils from "./utils.js"
import * as Graphics from "./graphic_engine.js"

ECS.EcsEngine.BindCommand(new ECS.PrintEveryField(), ECS.Frequency.EveryStep, ECS.Order.First, null)

let fox = new ECS.Fox()
let human = new ECS.Human()
ECS.EcsEngine.entities.push(fox)
ECS.EcsEngine.components.push(new ECS.Name("foxo", fox.entityUid))
ECS.EcsEngine.components.push(new ECS.Health(10, fox.entityUid))
let position = new ECS.Position(new Utils.Vector2(1, 1), fox.entityUid)
ECS.EcsEngine.components.push(position)
ECS.EcsEngine.components.push(new ECS.Name("human", human.entityUid))
ECS.EcsEngine.components.push(new ECS.Health(10, human.entityUid))
ECS.EcsEngine.BindCommand(new Graphics.SyncGraphicEntity(position.componentUid), ECS.Frequency.EveryStep, ECS.Order.Last, null)

export class MovePlayer implements ECS.Command {
    get: ECS.Get
    component: ECS.Components | null
    by: ECS.By | null
    byArgs: number | ECS.Entities | null
    commandtype: ECS.Commands

    constructor(newComponentUid: number) {
        this.commandtype = ECS.Commands.MovePlayer
        this.component = ECS.Components.Position
        this.get = ECS.Get.One
        this.by = ECS.By.ComponentUid
        this.byArgs = newComponentUid
    }

    run(args: ECS.Component[]): void {
        (args[0] as ECS.Position).position.x += Input.direction.y;
        (args[0] as ECS.Position).position.y += Input.direction.x;
        Input.direction = new Utils.Vector2(0, 0)
    }
}
ECS.EcsEngine.BindCommand(new MovePlayer(position.componentUid), ECS.Frequency.EveryStep, ECS.Order.First, null)

let ecs = new ECS.EcsEngine();
let graphics = new Graphics.GraphicEngine(new Utils.Vector2(10, 10));
Graphics.GraphicEngine.graphicEntities.push(new Graphics.GraphicFox(position.position, position.componentUid))

class Input {
    static direction = new Utils.Vector2(0, 0)
    static onInput(event: any) {
        switch (event.key) {
            case "j":
                Input.direction.y -= 1
                break;
            case "k":
                Input.direction.y += 1
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
