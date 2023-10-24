import * as ECS from "./ecs_engine.js";
import * as Utils from "./utils.js";
import * as Graphics from "./graphic_engine.js";
ECS.EcsEngine.BindCommand(new Graphics.SyncGraphicEntity(), ECS.Frequency.EveryStep, ECS.Order.First, null);
let human = new ECS.Human();
ECS.EcsEngine.entities.push(human);
let lookingDirection = new ECS.LookingDirection(human.entityUid);
ECS.EcsEngine.components.push(lookingDirection);
ECS.EcsEngine.components.push(new ECS.Health(10, human.entityUid));
ECS.EcsEngine.components.push(new ECS.EntityState(ECS.EntityStates.Idle, human.entityUid));
let position = new ECS.Position(new Utils.Vector2(0, 0), human.entityUid);
ECS.EcsEngine.components.push(position);
let graphicEntity = new Graphics.GraphicEntity([new Graphics.StickmanRun(), new Graphics.StickmanIdle()], position.position, human.entityUid, lookingDirection.isLookingRight, 2);
Graphics.GraphicEngine.graphicEntities.push(graphicEntity);
export class SpawnGrass {
    constructor() {
        this.get = ECS.Get.None;
        this.commandtype = ECS.Commands.SpawnGrass;
        this.component = null;
        this.by = null;
        this.byArgs = null;
    }
    run(_) {
        for (var yI = 0; yI < 20; yI++) {
            for (var xI = 0; xI < 20; xI++) {
                let shouldSpawn = Utils.randomNumber(2);
                if (shouldSpawn == 1) {
                    continue;
                }
                let grass = new ECS.Grass();
                ECS.EcsEngine.entities.push(grass);
                ECS.EcsEngine.components.push(new ECS.Health(1, grass.entityUid));
                let position = new ECS.Position(new Utils.Vector2(xI * 10, yI * 10), grass.entityUid);
                ECS.EcsEngine.components.push(position);
                ECS.EcsEngine.components.push(new ECS.EntityState(ECS.EntityStates.Idle, grass.entityUid));
                let graphicEntity = new Graphics.GraphicEntity([new Graphics.PlantIdle()], position.position, grass.entityUid, true, 0);
                Graphics.GraphicEngine.graphicEntities.push(graphicEntity);
            }
        }
    }
}
ECS.EcsEngine.BindCommand(new SpawnGrass(), ECS.Frequency.Startup, ECS.Order.First, null);
export class SyncWeaponsWithOwners {
    constructor() {
        this.get = ECS.Get.All;
        this.commandtype = ECS.Commands.SyncWeaponsWithOwners;
        this.component = [ECS.Components.LookingDirection, ECS.Components.Position, ECS.Components.EntityState];
        this.by = ECS.By.Everything;
        this.byArgs = null;
    }
    run(args) {
        for (var comp of args) {
            for (var ge of Graphics.GraphicEngine.graphicEntities) {
                if (comp.ownerUid == ge.entityUid) {
                    switch (comp.componentType) {
                        case ECS.Components.LookingDirection:
                            ge.isEntityLookingRight = comp.isLookingRight;
                            break;
                        case ECS.Components.Position:
                            ge.entityPosition = comp.position;
                            break;
                        case ECS.Components.EntityState:
                            ge.entityState = comp.currentState;
                            break;
                    }
                }
            }
        }
    }
}
export class MovePlayer {
    constructor(newEntityUid) {
        this.commandtype = ECS.Commands.MovePlayer;
        this.component = [ECS.Components.Position, ECS.Components.LookingDirection, ECS.Components.EntityState];
        this.get = ECS.Get.OneOfEach;
        this.by = ECS.By.EntityUid;
        this.byArgs = newEntityUid;
    }
    run(args) {
        if (!(Input.up || Input.down) && !(Input.left || Input.right)) {
            for (var a of args) {
                if (a.componentType == ECS.Components.EntityState) {
                    a.currentState = ECS.EntityStates.Idle;
                    break;
                }
            }
            return;
        }
        let wentRight = null;
        if (Input.left)
            wentRight = false;
        if (Input.right)
            wentRight = true;
        for (var a of args) {
            switch (a.componentType) {
                case ECS.Components.Position:
                    if (Input.up)
                        a.position.y -= 1;
                    if (Input.down)
                        a.position.y += 1;
                    if (Input.right)
                        a.position.x += 1;
                    if (Input.left)
                        a.position.x -= 1;
                    break;
                case ECS.Components.LookingDirection:
                    if (wentRight != null)
                        a.isLookingRight = wentRight;
                    break;
                case ECS.Components.EntityState:
                    a.currentState = ECS.EntityStates.Run;
                    break;
            }
        }
    }
}
ECS.EcsEngine.BindCommand(new MovePlayer(human.entityUid), ECS.Frequency.EveryStep, ECS.Order.First, null);
let ecs = new ECS.EcsEngine();
let graphics = new Graphics.GraphicEngine(new Utils.Vector2(10, 10));
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
    }
}
Input.up = false;
Input.down = false;
Input.left = false;
Input.right = false;
document.addEventListener("keyup", Input.onKeyUp);
document.addEventListener("keydown", Input.onKeyDown);
function run() {
    ecs.step();
    graphics.render();
}
run();
window.setInterval(run, 20);
