import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
import * as Comps from "./components.js";
export var Commands;
(function (Commands) {
    Commands[Commands["ShowHealth"] = 0] = "ShowHealth";
    Commands[Commands["CreateHealth"] = 1] = "CreateHealth";
})(Commands || (Commands = {}));
export class CreateHealth {
    constructor() {
        this.query = null;
        this.type = Commands.CreateHealth;
    }
    run(_, system) {
        console.log("moooo");
        let entityUid = 1;
        system.addComponent(new Comps.Health(10, entityUid));
        system.removeCommand(Commands.CreateHealth);
    }
}
export class ShowHealth {
    constructor() {
        this.query = [ECS.Get.All, [Comps.Components.Health], ECS.By.Any, null];
        this.type = Commands.ShowHealth;
    }
    run(foundComponents, system) {
        if (system.getState("solved") == undefined) {
            console.log("not found, but i am solving this right now");
            system.addCommand(Commands.CreateHealth);
            system.setState("solved", true);
            return;
        }
        if (foundComponents[0][0] == undefined) {
            console.log("hold on..");
            return;
        }
        if (foundComponents[0][0] != undefined) {
            system.setProperty(foundComponents[0][0], Utils.property("health"), 15);
        }
        console.log(foundComponents[0]);
    }
}
