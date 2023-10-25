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
    let start = performance.now();
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
    let stop = performance.now();
    console.log(stop - start);
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
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                let player = Utils.newUid();
                system.addComponent(new Comps.Health(10, player));
                let position = new Comps.Position(new Utils.Vector2(x * 60, y * 60), player);
                system.addComponent(position);
                let computedElement = new Comps.ComputedElement(player);
                computedElement.properties[Comps.Properties.Left] = position.position.x;
                computedElement.properties[Comps.Properties.Top] = position.position.y;
                computedElement.properties[Comps.Properties.ZIndex] = x;
                system.addComponent(computedElement);
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
        if (system.input.movementDirection.x == 0 &&
            system.input.movementDirection.y == 0) {
            return;
        }
        let fC = foundComponents[0][0];
        let newPosition = fC.component.position;
        newPosition.x += system.input.movementDirection.x;
        newPosition.y += system.input.movementDirection.y;
        system.setProperty(fC, "position", newPosition);
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
                if (!p.component.isChanged)
                    break;
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
                    system.setProperty(p, "isChanged", false);
                    break;
                }
            }
        }
    }
}
