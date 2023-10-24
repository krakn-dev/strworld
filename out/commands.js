import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
import * as Comps from "./components.js";
export var Commands;
(function (Commands) {
    Commands[Commands["TheFirst"] = 0] = "TheFirst";
    Commands[Commands["PingPong"] = 1] = "PingPong";
    Commands[Commands["CreatePlayer"] = 2] = "CreatePlayer";
    Commands[Commands["MovePlayer"] = 3] = "MovePlayer";
    Commands[Commands["SyncComputedElementPosition"] = 4] = "SyncComputedElementPosition";
})(Commands || (Commands = {}));
//        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Health], ECS.By.Any, null])
export function getInstanceFromEnum(commandEnum) {
    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst();
        case Commands.PingPong:
            return new PingPong();
        case Commands.CreatePlayer:
            return new CreatePlayer();
        case Commands.MovePlayer:
            return new MovePlayer();
        case Commands.SyncComputedElementPosition:
            return new SyncComputedElementPosition();
    }
}
export class TheFirst {
    constructor() {
        this.type = Commands.TheFirst;
    }
    run(system) {
        system.addCommand(Commands.CreatePlayer);
        system.addCommand(Commands.SyncComputedElementPosition);
        system.removeCommand(Commands.TheFirst);
    }
}
export class PingPong {
    constructor() {
        this.type = Commands.PingPong;
    }
    run(_) { }
}
export class CreatePlayer {
    constructor() {
        this.type = Commands.CreatePlayer;
    }
    run(system) {
        for (let x = 0; x < 20; x++) {
            for (let y = 0; y < 20; y++) {
                let player = Utils.newUid();
                system.addComponent(new Comps.Health(10, player));
                system.addComponent(new Comps.Position(new Utils.Vector2(x * 40, y * 40), player));
                system.addComponent(new Comps.ComputedElement(player));
                //                console.log("player created")
            }
        }
        system.addCommand(Commands.MovePlayer);
        system.removeCommand(Commands.CreatePlayer);
    }
}
export class MovePlayer {
    constructor() {
        this.type = Commands.MovePlayer;
    }
    run(system) {
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Position], ECS.By.Any, null]);
        for (let fC of foundComponents[0]) {
            let newPosition = fC.component.position;
            newPosition.x += system.input.movementDirection.x;
            newPosition.y += system.input.movementDirection.y;
            system.setProperty(fC, "position", newPosition);
        }
    }
}
export class SyncComputedElementPosition {
    constructor() {
        this.type = Commands.SyncComputedElementPosition;
    }
    run(system) {
        let foundComponents = system.find([
            ECS.Get.All,
            [
                Comps.Components.ComputedElement,
                Comps.Components.Position
            ],
            ECS.By.Any,
            null
        ]);
        for (let cE of foundComponents[0]) {
            for (let p of foundComponents[1]) {
                if (cE.component.entityUid ==
                    p.component.entityUid) {
                    let position = p.component.position;
                    let computedElement = cE.component;
                    computedElement.properties[Comps.Properties.Top] = position.y;
                    computedElement.properties[Comps.Properties.Left] = position.x;
                    computedElement.changedProperties[Comps.Properties.Left] = true;
                    computedElement.changedProperties[Comps.Properties.Top] = true;
                    system.setProperty(cE, "properties", computedElement.properties);
                    system.setProperty(cE, "changedProperties", computedElement.changedProperties);
                    system.setProperty(cE, "isChanged", true);
                    break;
                }
            }
        }
    }
}
