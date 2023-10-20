var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as ECS from "./ecs.js";
import { delay } from "./utils.js";
let system = new ECS.System();
function main() {
    system.addCommand(new CreateHumanAndGrass());
    system.run();
}
var Commands;
(function (Commands) {
    Commands[Commands["CreateHumanAndGrass"] = 0] = "CreateHumanAndGrass";
})(Commands || (Commands = {}));
class CreateHumanAndGrass {
    constructor() {
        this.type = Commands.CreateHumanAndGrass;
        this.query = null;
    }
    run(_) {
        let human = new ECS.Human();
        system.addEntity(human);
        system.addComponent(new ECS.Health(10, human.entityUid), ECS.Components.Health);
        let grass = new ECS.Grass();
        system.addEntity(grass);
        system.addComponent(new ECS.Health(1, grass.entityUid), ECS.Components.Health);
    }
}
/////////////////////// SETUP
let firstUpdate = false;
onmessage = (e) => {
    system.update(e.data);
    firstUpdate = true;
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    while (!firstUpdate) {
        let { promise, cancel } = delay(1);
        yield promise;
    }
    main();
}))();
