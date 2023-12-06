import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
import * as Comps from "./components.js";
import * as Anims from "./animations.js";
// todo transform, reset timer
export var Commands;
(function (Commands) {
    Commands[Commands["TheFirst"] = 0] = "TheFirst";
    Commands[Commands["CreatePlayer"] = 1] = "CreatePlayer";
    Commands[Commands["MovePlayer"] = 2] = "MovePlayer";
    Commands[Commands["SetEntityElementsPositionAndDisplayElement"] = 3] = "SetEntityElementsPositionAndDisplayElement";
    Commands[Commands["SendComputedElementsToRender"] = 4] = "SendComputedElementsToRender";
    Commands[Commands["CreateShadows"] = 5] = "CreateShadows";
    Commands[Commands["WatchDevBox"] = 6] = "WatchDevBox";
    Commands[Commands["RemoveShadows"] = 7] = "RemoveShadows";
    Commands[Commands["PlayAnimations"] = 8] = "PlayAnimations";
    Commands[Commands["UpdateShadowNumber"] = 9] = "UpdateShadowNumber";
    Commands[Commands["UpdateShadowProperties"] = 10] = "UpdateShadowProperties";
    Commands[Commands["TickTimer"] = 11] = "TickTimer";
    Commands[Commands["UpdateAnimationTimerNumber"] = 12] = "UpdateAnimationTimerNumber";
    Commands[Commands["CreateAnimationTimers"] = 13] = "CreateAnimationTimers";
    Commands[Commands["MoveCameraWithPlayer"] = 14] = "MoveCameraWithPlayer";
    Commands[Commands["CreateDog"] = 15] = "CreateDog";
    Commands[Commands["MoveDog"] = 16] = "MoveDog";
})(Commands || (Commands = {}));
export function getInstanceFromEnum(commandEnum) {
    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst();
        case Commands.MoveCameraWithPlayer:
            return new MoveCameraWithPlayer();
        case Commands.MoveDog:
            return new MoveDog();
        case Commands.CreateDog:
            return new CreateDog();
        case Commands.UpdateAnimationTimerNumber:
            return new UpdateAnimationTimerNumber();
        case Commands.TickTimer:
            return new TickTimer();
        case Commands.CreateAnimationTimers:
            return new CreateAnimationTimers();
        case Commands.UpdateShadowProperties:
            return new UpdateShadowProperties();
        case Commands.PlayAnimations:
            return new PlayAnimations();
        case Commands.UpdateShadowNumber:
            return new UpdateShadowNumber();
        case Commands.RemoveShadows:
            return new RemoveShadows();
        case Commands.WatchDevBox:
            return new WatchDevBox();
        case Commands.CreatePlayer:
            return new CreatePlayer();
        case Commands.MovePlayer:
            return new MovePlayer();
        case Commands.SetEntityElementsPositionAndDisplayElement:
            return new SetEntityElementsPositionAndDisplayElement();
        case Commands.SendComputedElementsToRender:
            return new SendComputedElementsToRender();
        case Commands.CreateShadows:
            return new CreateShadows();
    }
}
// the first
export class TheFirst {
    constructor() {
        this.type = Commands.TheFirst;
    }
    run(system) {
        // how to ensure they are created in a good order
        //
        // first ensure that commands
        // that depend of some components are created first
        //
        system.addCommand(Commands.CreatePlayer);
        system.addCommand(Commands.CreateDog);
        system.addCommand(Commands.SetEntityElementsPositionAndDisplayElement);
        system.addCommand(Commands.SendComputedElementsToRender);
        system.addCommand(Commands.PlayAnimations);
        system.addCommand(Commands.UpdateAnimationTimerNumber);
        system.addCommand(Commands.TickTimer);
        //        system.addCommand(Commands.CreateAnimationTimers)
        system.addCommand(Commands.WatchDevBox);
        system.removeCommand(Commands.TheFirst);
    }
}
// player
export class CreateDog {
    constructor() {
        this.type = Commands.CreateDog;
    }
    run(system) {
        let dog = Utils.newUid();
        let positionComponent = new Comps.Position(-90, -1, dog);
        let entityStateComponent = new Comps.EntityState(new Map([[Comps.EntityStates.Idle, null]]), dog);
        let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Dog, dog);
        let healthComponent = new Comps.Health(10, dog);
        let animationComponent = new Comps.Animation([new Anims.PlayerIdle(), new Anims.PlayerRunning()], dog);
        let computedElement = new Comps.ComputedElement(Comps.ElementTypes.Entity, dog);
        computedElement.translateX = positionComponent.x;
        computedElement.translateY = positionComponent.y;
        computedElement.zIndex = positionComponent.y;
        system.addComponent(healthComponent);
        system.addComponent(animationComponent);
        system.addComponent(positionComponent);
        system.addComponent(entityStateComponent);
        system.addComponent(computedElement);
        system.addComponent(entityTypeComponent);
        system.addCommand(Commands.MoveDog);
        system.removeCommand(Commands.CreateDog);
    }
}
export class MoveDog {
    constructor() {
        this.targetPositionKey = "targetPosition";
        this.type = Commands.MoveDog;
    }
    run(system) {
        let delta = system.delta();
        if (delta == null)
            return;
        // get dog and player uid
        let foundEntityTypeComponents = system.find([ECS.Get.All, [Comps.Components.EntityType], ECS.By.Any, null]);
        if (foundEntityTypeComponents[0].length == 0) {
            console.log("no entity types found");
            return;
        }
        let dogUid = null;
        let playerUid = null;
        for (let fC of foundEntityTypeComponents[0]) {
            let entityTypeComponent = fC.component;
            if (entityTypeComponent.entityType == Comps.EntityTypes.Dog) {
                dogUid = entityTypeComponent.entityUid;
            }
            if (entityTypeComponent.entityType == Comps.EntityTypes.Player) {
                playerUid = entityTypeComponent.entityUid;
            }
        }
        if (dogUid == null || playerUid == null) {
            return;
        }
        let foundPlayerPositionComponents = system.find([ECS.Get.One, [Comps.Components.Position], ECS.By.EntityId, playerUid]);
        if (foundPlayerPositionComponents[0].length == 0) {
            console.log("no player position found");
            return;
        }
        let foundDogPositionComponents = system.find([ECS.Get.One, [Comps.Components.Position], ECS.By.EntityId, dogUid]);
        if (foundDogPositionComponents[0].length == 0) {
            console.log("no dog position found");
            return;
        }
        let playerPositionComponent = foundPlayerPositionComponents[0][0].component;
        let dogPositionComponent = foundDogPositionComponents[0][0].component;
        let isDogInPlayerRadius = false;
        let playerRadius = 100;
        if (Math.abs(playerPositionComponent.x - dogPositionComponent.x) < playerRadius &&
            Math.abs(playerPositionComponent.y - dogPositionComponent.y) < playerRadius) {
            isDogInPlayerRadius = true;
        }
        if (isDogInPlayerRadius) {
            system.setState(this.targetPositionKey, null);
        }
        // follow player
        if (!isDogInPlayerRadius) {
            console.log("isnt radius");
            let xTargetPosition = playerPositionComponent.x;
            let yTargetPosition = playerPositionComponent.y;
            system.setState(this.targetPositionKey, [xTargetPosition, yTargetPosition]);
        }
        if (isDogInPlayerRadius) {
            let foundEntityState = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                ],
                ECS.By.EntityId,
                dogUid
            ]);
            if (foundEntityState[0].length == 0) {
                console.log("dog entityState not found");
                return;
            }
            let entityStateComponent = foundEntityState[0][0].component;
            // cannot change state to idle if wasnt runnning
            if (entityStateComponent.states.has(Comps.EntityStates.Run)) {
                system.removeElementFromMapProperty(foundEntityState[0][0], "states", Comps.EntityStates.Run);
                if (entityStateComponent.states.has(Comps.EntityStates.Idle))
                    return;
                system.addElementToMapProperty(foundEntityState[0][0], "states", new Utils.MapEntry(Comps.EntityStates.Idle, null));
            }
            return;
        }
        // random movement
        //if (isDogInPlayerRadius && system.getState(this.targetPositionKey) == null) {
        //    if (Utils.randomNumber(100) != 10) {
        //        return
        //    }
        //    let xTargetPosition = Utils.randomNumber(playerRadius) - playerPositionComponent.x
        //    let yTargetPosition = Utils.randomNumber(playerRadius) - playerPositionComponent.y
        //    system.setState(this.targetPositionKey, [xTargetPosition, yTargetPosition])
        //}
        // move to desired target position
        let targetPosition = system.getState(this.targetPositionKey);
        if (targetPosition == null)
            return;
        let dogSpeed = 1;
        let targetPositionVector = new Utils.Vector2(targetPosition[0], targetPosition[1]);
        let direction = new Utils.Vector2(0, 0);
        if (targetPositionVector.y - dogPositionComponent.y > 5)
            direction.y += 1;
        if (targetPositionVector.x - dogPositionComponent.x > 5)
            direction.x += 1;
        if (targetPositionVector.y - dogPositionComponent.y < 5)
            direction.y -= 1;
        if (targetPositionVector.x - dogPositionComponent.x < 5)
            direction.x -= 1;
        // check if arrived at target position
        let resultDogPosition = new Utils.Vector2(direction.x * dogSpeed + dogPositionComponent.x, direction.y * dogSpeed + dogPositionComponent.y);
        if (Math.abs(targetPositionVector.x - resultDogPosition.x) < 1 &&
            Math.abs(targetPositionVector.y - resultDogPosition.y) < 1) {
            resultDogPosition.x = targetPositionVector.x;
            resultDogPosition.y = targetPositionVector.y;
            system.setState(this.targetPositionKey, null);
        }
        if (resultDogPosition.x != dogPositionComponent.x) {
            system.setProperty(foundDogPositionComponents[0][0], "x", resultDogPosition.x);
        }
        if (resultDogPosition.y != dogPositionComponent.y) {
            system.setProperty(foundDogPositionComponents[0][0], "y", resultDogPosition.y);
        }
        let foundEntityState = system.find([
            ECS.Get.All,
            [
                Comps.Components.EntityState,
            ],
            ECS.By.EntityId,
            dogUid
        ]);
        if (foundEntityState[0].length == 0) {
            console.log("dog entityState not found");
            return;
        }
        let entityStateComponent = foundEntityState[0][0].component;
        if (!entityStateComponent.states.has(Comps.EntityStates.Run)) {
            system.addElementToMapProperty(foundEntityState[0][0], "states", new Utils.MapEntry(Comps.EntityStates.Run, null));
        }
        if (entityStateComponent.states.has(Comps.EntityStates.Idle)) {
            system.removeElementFromMapProperty(foundEntityState[0][0], "states", Comps.EntityStates.Idle);
        }
    }
}
export class CreatePlayer {
    constructor() {
        this.type = Commands.CreatePlayer;
    }
    run(system) {
        for (let x = 0; x < 1; x++) {
            for (let y = 0; y < 1; y++) {
                let player = Utils.newUid();
                let positionComponent = new Comps.Position(x * 70, y * 70, player);
                let entityStateComponent = new Comps.EntityState(new Map([[Comps.EntityStates.Idle, null]]), player);
                let entityTypeComponent = new Comps.EntityType(Comps.EntityTypes.Player, player);
                let healthComponent = new Comps.Health(10, player);
                let animationComponent = new Comps.Animation([new Anims.PlayerIdle(), new Anims.PlayerRunning()], player);
                let computedElement = new Comps.ComputedElement(Comps.ElementTypes.Entity, player);
                computedElement.translateX = positionComponent.x;
                computedElement.translateY = positionComponent.y;
                computedElement.zIndex = y;
                system.addComponent(healthComponent);
                system.addComponent(animationComponent);
                system.addComponent(positionComponent);
                system.addComponent(entityStateComponent);
                system.addComponent(computedElement);
                system.addComponent(entityTypeComponent);
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
        let delta = system.delta();
        if (delta == null)
            return;
        let velocity = 0.3;
        // get playerUid
        let foundEntityTypeComponents = system.find([ECS.Get.All, [Comps.Components.EntityType], ECS.By.Any, null]);
        if (foundEntityTypeComponents[0].length == 0) {
            console.log("no entity types found");
            return;
        }
        let playerUid = null;
        for (let fC of foundEntityTypeComponents[0]) {
            let entityTypeComponent = fC.component;
            if (entityTypeComponent.entityType == Comps.EntityTypes.Player) {
                playerUid = entityTypeComponent.entityUid;
            }
        }
        if (playerUid == null)
            return;
        // if was found, move it
        if (system.input.movementDirection.x == 0 &&
            system.input.movementDirection.y == 0) {
            let foundEntityState = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                ],
                ECS.By.EntityId,
                foundEntityTypeComponents[0][0].component.entityUid
            ]);
            if (foundEntityState[0].length == 0) {
                console.log("entityState not found");
                return;
            }
            for (let fC of foundEntityState[0]) {
                if (fC.component.entityUid == playerUid) {
                    let entityStateComponent = fC.component;
                    // cannot change state to idle if wasnt runnning
                    if (entityStateComponent.states.has(Comps.EntityStates.Run)) {
                        system.removeElementFromMapProperty(fC, "states", Comps.EntityStates.Run);
                        if (entityStateComponent.states.has(Comps.EntityStates.Idle))
                            return;
                        system.addElementToMapProperty(fC, "states", new Utils.MapEntry(Comps.EntityStates.Idle, null));
                    }
                    return;
                }
            }
        }
        let foundPositionComponents = system.find([ECS.Get.One, [Comps.Components.Position], ECS.By.EntityId, playerUid]);
        if (foundPositionComponents[0].length == 0) {
            console.log("no player position found found");
            return;
        }
        let positionComponent = foundPositionComponents[0][0].component;
        let newPosition = new Utils.Vector2(positionComponent.x, positionComponent.y);
        newPosition.x += system.input.movementDirection.x * delta * velocity;
        newPosition.y += system.input.movementDirection.y * delta * velocity;
        let foundEntityState = system.find([ECS.Get.One, [Comps.Components.EntityState], ECS.By.EntityId, playerUid]);
        if (foundEntityState[0].length == 0) {
            console.log("player entityState not found");
            return;
        }
        let entityStateComponent = foundEntityState[0][0].component;
        if (!entityStateComponent.states.has(Comps.EntityStates.Run)) {
            system.addElementToMapProperty(foundEntityState[0][0], "states", new Utils.MapEntry(Comps.EntityStates.Run, null));
        }
        if (entityStateComponent.states.has(Comps.EntityStates.Idle)) {
            system.removeElementFromMapProperty(foundEntityState[0][0], "states", Comps.EntityStates.Idle);
        }
        if (newPosition.x != positionComponent.x) {
            system.setProperty(foundPositionComponents[0][0], "x", newPosition.x);
        }
        if (newPosition.y != positionComponent.y) {
            system.setProperty(foundPositionComponents[0][0], "y", newPosition.y);
        }
    }
}
// Camera
export class MoveCameraWithPlayer {
    constructor() {
        this.type = Commands.MoveCameraWithPlayer;
    }
    run(system) {
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null]);
        let playerPosition = new Utils.Vector2(0, 0);
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Position)
                continue;
            let positionComponent = cC.component;
            let foundComponents = system.find([ECS.Get.All, [Comps.Components.EntityType], ECS.By.Any, null]);
            let entityTypeComponent = foundComponents[0][0].component;
            if (entityTypeComponent.entityType == Comps.EntityTypes.Player) {
            }
        }
        //        for (let fC of foundComponents[0]) {
        //            let computedElementComponent = fC.component as Comps.ComputedElement
        //
        //            if (computedElementComponent.entityUid ==
        //                positionComponent.entityUid
        //            ) {
        //                system.setProperty<Comps.ComputedElement, "translateY">(
        //                    fC, "translateY", positionComponent.y - 10)
        //                system.setProperty<Comps.ComputedElement, "isTranslateYChanged">(
        //                    fC, "isTranslateYChanged", true)
        //
        //                system.setProperty<Comps.ComputedElement, "translateX">(
        //                    fC, "translateX", positionComponent.x - 10)
        //                system.setProperty<Comps.ComputedElement, "isTranslateXChanged">(
        //                    fC, "isTranslateXChanged", true)
        //
        //                system.setProperty<Comps.ComputedElement, "isChanged">(
        //                    fC, "isChanged", true)
        //                break;
        //            }
        //        }
    }
}
// shadows elements
export class UpdateShadowProperties {
    constructor() {
        this.type = Commands.UpdateShadowProperties;
    }
    run(system) {
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null]);
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Position)
                continue;
            let position = cC.component;
            for (let fC of foundComponents[0]) {
                let computedElement = fC.component;
                if (computedElement.entityUid ==
                    position.entityUid &&
                    computedElement.elementType ==
                        Comps.ElementTypes.Shadow) {
                    system.setProperty(fC, "translateY", position.y - 10);
                    system.setProperty(fC, "isTranslateYChanged", true);
                    system.setProperty(fC, "translateX", position.x - 10);
                    system.setProperty(fC, "isTranslateXChanged", true);
                    system.setProperty(fC, "isChanged", true);
                    break;
                }
            }
        }
    }
}
export class RemoveShadows {
    constructor() {
        this.type = Commands.RemoveShadows;
    }
    run(system) {
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null]);
        for (let fC of foundComponents[0]) {
            let computedElement = fC.component;
            if (computedElement.elementType == Comps.ElementTypes.Shadow) {
                system.removeComponent(fC);
            }
        }
        system.removeCommand(this.type);
    }
}
export class UpdateShadowNumber {
    constructor() {
        this.type = Commands.UpdateShadowNumber;
    }
    run(system) {
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null]);
        if (foundComponents[0].length == 0)
            return;
        // check for added entities
        for (let aC of system.componentDiffs.addedComponents) {
            if (aC.component.type != Comps.Components.ComputedElement)
                continue;
            if (aC.component.elementType != Comps.ElementTypes.Entity)
                continue;
            let computedElement = aC.component;
            let shadowElement = new Comps.ComputedElement(Comps.ElementTypes.Shadow, computedElement.entityUid);
            shadowElement.color = "#aaa";
            shadowElement.translateX =
                computedElement.translateX - 10;
            shadowElement.translateY =
                computedElement.translateY - 10;
            shadowElement.zIndex = -1;
            system.addComponent(shadowElement);
        }
        // check for removed entities
        for (let rC of system.componentDiffs.removedComponents) {
            if (rC.component.type != Comps.Components.ComputedElement)
                continue;
            if (rC.component.elementType != Comps.ElementTypes.Entity)
                continue;
            for (let fC of foundComponents[0]) {
                if (fC.component.entityUid != rC.component.entityUid)
                    continue;
                if (fC.component.elementType != Comps.ElementTypes.Shadow)
                    continue;
                system.removeComponent(fC);
                break;
            }
        }
    }
}
export class CreateShadows {
    constructor() {
        this.type = Commands.CreateShadows;
    }
    run(system) {
        // first time run
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null]);
        for (let fC of foundComponents[0]) {
            let computedElement = fC.component;
            if (computedElement.elementType == Comps.ElementTypes.Entity) {
                let shadowElement = new Comps.ComputedElement(Comps.ElementTypes.Shadow, computedElement.entityUid);
                shadowElement.color = "#666";
                shadowElement.translateX =
                    computedElement.translateX - 10;
                shadowElement.translateY =
                    computedElement.translateY - 10;
                shadowElement.zIndex = -1;
                system.addComponent(shadowElement);
            }
        }
        system.addCommand(Commands.UpdateShadowNumber);
        system.addCommand(Commands.UpdateShadowProperties);
        system.removeCommand(this.type);
    }
}
// computed Elements
export class SendComputedElementsToRender {
    constructor() {
        this.type = Commands.SendComputedElementsToRender;
    }
    run(system) {
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.ComputedElement], ECS.By.Any, null]);
        if (foundComponents[0].length == 0)
            return;
        let graphicDiff = new Utils.GraphicDiff();
        // for changed
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.ComputedElement)
                continue;
            let computedElementComponent = cC.component;
            if (!computedElementComponent.isChanged)
                continue;
            graphicDiff.changedComputedElements.push(cC);
            // set properties to not changed
            system.setProperty(cC, "isChanged", false);
            if (computedElementComponent.addedClasses.size != 0)
                system.removeElementFromMapProperty(cC, "addedClasses", null, true);
            if (computedElementComponent.removedClasses.size != 0)
                system.removeElementFromMapProperty(cC, "removedClasses", null, true);
            if (computedElementComponent.isTranslateXChanged)
                system.setProperty(cC, "isTranslateXChanged", false);
            if (computedElementComponent.isTranslateYChanged)
                system.setProperty(cC, "isTranslateYChanged", false);
            if (computedElementComponent.isZIndexChanged)
                system.setProperty(cC, "isZIndexChanged", false);
            if (computedElementComponent.isColorChanged)
                system.setProperty(cC, "isColorChanged", false);
            if (computedElementComponent.isDisplayElementChanged)
                system.setProperty(cC, "isDisplayElementChanged", false);
        }
        // check for new
        for (let aC of system.componentDiffs.addedComponents) {
            if (aC.component.type == Comps.Components.ComputedElement) {
                graphicDiff.addedComputedElements.push(aC);
            }
        }
        // check for removed
        for (let rC of system.componentDiffs.removedComponents) {
            if (rC.component.type == Comps.Components.ComputedElement) {
                graphicDiff.removedComputedElements.push(rC);
            }
        }
        if (graphicDiff.addedComputedElements.length == 0 &&
            graphicDiff.removedComputedElements.length == 0 &&
            graphicDiff.changedComputedElements.length == 0) {
            return;
        }
        postMessage(new Utils.Message(Utils.Messages.RenderIt, graphicDiff));
    }
}
// entity elements
export class SetEntityElementsPositionAndDisplayElement {
    constructor() {
        this.type = Commands.SetEntityElementsPositionAndDisplayElement;
    }
    run(system) {
        let foundComponents = system.find([
            ECS.Get.All,
            [
                Comps.Components.ComputedElement,
            ],
            ECS.By.Any,
            null
        ]);
        // position
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Position)
                continue;
            let position = cC.component;
            for (let fC of foundComponents[0]) {
                let computedElement = fC.component;
                if (computedElement.entityUid ==
                    position.entityUid &&
                    computedElement.elementType ==
                        Comps.ElementTypes.Entity) {
                    system.setProperty(fC, "isChanged", true);
                    system.setProperty(fC, "translateY", position.y);
                    system.setProperty(fC, "isTranslateYChanged", true);
                    system.setProperty(fC, "translateX", position.x);
                    system.setProperty(fC, "isTranslateXChanged", true);
                    break;
                }
            }
        }
        // displayElement
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.Animation)
                continue;
            let animationComponent = cC.component;
            for (let fC of foundComponents[0]) {
                let computedElementComponent = fC.component;
                if (computedElementComponent.entityUid ==
                    animationComponent.entityUid &&
                    computedElementComponent.elementType ==
                        Comps.ElementTypes.Entity) {
                    system.setProperty(fC, "isChanged", true);
                    system.setProperty(fC, "displayElement", animationComponent.currentDisplayElement);
                    system.setProperty(fC, "isDisplayElementChanged", true);
                    break;
                }
            }
        }
    }
}
// animation
export class CreateAnimationTimers {
    constructor() {
        this.type = Commands.CreateAnimationTimers;
    }
    run(system) {
        let foundComponents = system.find([
            ECS.Get.All,
            [
                Comps.Components.Animation,
            ],
            ECS.By.Any,
            null
        ]);
        if (foundComponents[0].length == 0)
            console.log("there are not animation components");
        for (let fC of foundComponents[0]) {
            let foundComponents = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                ],
                ECS.By.EntityId,
                fC.component.entityUid
            ]);
            if (foundComponents[0].length == 0) {
                console.log("entityState component missing");
                continue;
            }
            let entityState = foundComponents[0][0].component;
            let animation = fC.component;
            let currentStateAnimation = null;
            for (let a of animation.animations) {
                if (entityState.states.has(a.executeOn)) {
                    currentStateAnimation = a;
                }
            }
            if (currentStateAnimation == null)
                continue;
            let timer = new Comps.Timer(currentStateAnimation.frames[currentStateAnimation.frames.length - 1].frameTime, Comps.TimerTypes.Animation, entityState.entityUid);
            system.addComponent(timer);
            system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0].frameDisplay);
        }
        system.removeCommand(this.type);
    }
}
export class UpdateAnimationTimerNumber {
    constructor() {
        this.type = Commands.UpdateAnimationTimerNumber;
    }
    run(system) {
        // on new graphic entity
        for (let aC of system.componentDiffs.addedComponents) {
            // get added animation components
            if (aC.component.type != Comps.Components.Animation)
                continue;
            // get entityState Components
            let foundComponents = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                ],
                ECS.By.EntityId,
                aC.component.entityUid
            ]);
            if (foundComponents[0].length == 0) {
                console.log("entityState component missing");
                continue;
            }
            let entityStateComponent = foundComponents[0][0].component;
            let animationAddedComponent = aC.component;
            let currentStateAnimation = null;
            let isFirstTime = true;
            for (let a of animationAddedComponent.animations) {
                if (entityStateComponent.states.has(a.executeOn)) {
                    if (isFirstTime) {
                        currentStateAnimation = a;
                        isFirstTime = false;
                        continue;
                    }
                    if (a.priority > currentStateAnimation.priority) {
                        currentStateAnimation = a;
                    }
                }
            }
            if (currentStateAnimation == null)
                continue;
            let timer = new Comps.Timer(currentStateAnimation.frames[currentStateAnimation.frames.length - 1].frameTime, Comps.TimerTypes.Animation, entityStateComponent.entityUid);
            system.addComponent(timer);
            system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0].frameDisplay);
            console.log("added timer");
        }
        // on graphic entity removed
        for (let cC of system.componentDiffs.removedComponents) {
            if (cC.component.type != Comps.Components.Animation)
                continue;
            let foundComponents = system.find([
                ECS.Get.All,
                [
                    Comps.Components.Timer,
                ],
                ECS.By.EntityId,
                cC.component.entityUid
            ]);
            if (foundComponents[0].length == 0) {
                console.log("timer component missing");
                continue;
            }
            let timer = foundComponents[0][0].component;
            if (timer.timerType == Comps.TimerTypes.Animation) {
                system.removeComponent(foundComponents[0][0]);
                console.log("removed timer");
            }
        }
    }
}
export class PlayAnimations {
    constructor() {
        this.type = Commands.PlayAnimations;
    }
    run(system) {
        let updatedTimersUid = [];
        // change animation for entity state change
        for (let cC of system.componentDiffs.changedComponents) {
            if (cC.component.type != Comps.Components.EntityState)
                continue;
            let foundComponents = system.find([
                ECS.Get.All,
                [Comps.Components.Animation, Comps.Components.Timer],
                ECS.By.EntityId,
                cC.component.entityUid
            ]);
            if (foundComponents[0].length == 0) {
                console.log("animation component missing");
                break;
            }
            let timer = null;
            for (let t of foundComponents[1]) {
                if (t.component.timerType == Comps.TimerTypes.Animation) {
                    timer = t;
                }
            }
            if (timer == null)
                continue;
            let animationComponent = foundComponents[0][0].component;
            let entityStateComponent = cC.component;
            let currentStateAnimation = null;
            let isFirstTime = true;
            for (let a of animationComponent.animations) {
                if (entityStateComponent.states.has(a.executeOn)) {
                    if (isFirstTime) {
                        currentStateAnimation = a;
                        isFirstTime = false;
                        continue;
                    }
                    if (a.priority > currentStateAnimation.priority) {
                        currentStateAnimation = a;
                    }
                }
            }
            if (currentStateAnimation == null)
                continue;
            updatedTimersUid.push(timer.component.componentUid);
            system.setProperty(timer, "originalTime", currentStateAnimation.frames[currentStateAnimation.frames.length - 1].frameTime);
            system.setProperty(timer, "isRestart", true);
            //            system.setProperty<Comps.Animation, "currentDisplayElement">(
            //                foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0]!)
        }
        // play next frame
        // get animation timers
        let foundTimers = system.find([ECS.Get.All, [Comps.Components.Timer], ECS.By.Any, null]);
        if (foundTimers[0].length == 0) {
            console.log("no timers");
            return;
        }
        for (let fC of foundTimers[0]) {
            // check if is an updated timer
            let isFound = false;
            for (let uT of updatedTimersUid) {
                if (fC.component.componentUid == uT) {
                    isFound = true;
                    break;
                }
            }
            if (isFound)
                continue;
            // check that are animation timers
            let timerComponent = fC.component;
            if (timerComponent.timerType != Comps.TimerTypes.Animation)
                continue;
            // if timer is finised restart it 
            if (timerComponent.isFinished) {
                system.setProperty(fC, "isRestart", true);
                continue;
            }
            // get animations and entity states
            let foundComponents = system.find([ECS.Get.One,
                [Comps.Components.Animation, Comps.Components.EntityState],
                ECS.By.EntityId,
                timerComponent.entityUid]);
            if (foundComponents[0].length == 0) {
                console.log("animation component missing");
                break;
            }
            if (foundComponents[1].length == 0) {
                console.log("entityState component missing");
                break;
            }
            let animationComponent = foundComponents[0][0].component;
            let entityStateComponent = foundComponents[1][0].component;
            // get playing animation based on EntityState
            let currentStateAnimation = null;
            let isFirstTime = true;
            for (let a of animationComponent.animations) {
                if (entityStateComponent.states.has(a.executeOn)) {
                    if (isFirstTime) {
                        currentStateAnimation = a;
                        isFirstTime = false;
                        continue;
                    }
                    if (a.priority > currentStateAnimation.priority) {
                        currentStateAnimation = a;
                    }
                }
            }
            if (currentStateAnimation == null)
                continue;
            // get current animation frame
            let elapsedTime = timerComponent.originalTime - timerComponent.timeLeft;
            let currentFrameIndex = 0;
            for (let [fI, f] of currentStateAnimation.frames.entries()) {
                if (f.frameTime > elapsedTime && fI != 0) {
                    currentFrameIndex = fI - 1;
                    break;
                }
                if (f.isEndFrame)
                    currentFrameIndex = fI - 1;
            }
            if (currentStateAnimation.frames[currentFrameIndex].frameDisplay ==
                animationComponent.currentDisplayElement)
                continue;
            // // if already is in this frame
            //            if (currentStateAnimation.frames[currentFrameIndex] ==
            //                animation.currentDisplayElement)
            //                continue
            //            console.log(elapsedTime,
            //                currentFrameIndex
            //                //                currentStateAnimation
            //                //                    .frames[currentFrameIndex]!
            //                //                    .charCodeAt(0)
            //                //                    .toString()
            //                //                    .split("")
            //                //                    .map((e, i) => { if (i > 2) return e })
            //                //                    .join("")
            //            )
            //currentFrameIndex
            //                currentStateAnimation
            //                    .frames[currentFrameIndex]!
            //                    .charCodeAt(0)
            //                    .toString()
            //                    .split("")
            //                    .map((e, i) => { if (i > 2) return e })
            //                    .join("")
            system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[currentFrameIndex].frameDisplay);
        }
    }
}
// timer
export class TickTimer {
    constructor() {
        this.type = Commands.TickTimer;
    }
    run(system) {
        let delta = system.delta();
        if (delta == null)
            return;
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Timer], ECS.By.Any, null]);
        for (let fC of foundComponents[0]) {
            let timer = fC.component;
            if (timer.isRestart) {
                system.setProperty(fC, "timeLeft", timer.originalTime);
                system.setProperty(fC, "isFinished", false);
                system.setProperty(fC, "isRestart", false);
                continue;
            }
            if (timer.isFinished)
                continue;
            let newTimeLeft = timer.timeLeft - delta;
            system.setProperty(fC, "timeLeft", newTimeLeft);
            if (newTimeLeft <= 0) {
                system.setProperty(fC, "isFinished", true);
            }
        }
    }
}
// devbox
export class WatchDevBox {
    constructor() {
        this.type = Commands.WatchDevBox;
    }
    run(system) {
        // run first time
        if (system.getState("isSetCommandsAreNotCreated") == null) {
            system.setState("isSetCommandsAreNotCreated", true);
            system.setState("createdIsEnableFreeCameraCommand", false);
            system.setState("createdIsEnablePhysicsCommand", false);
            system.setState("createdIsSetNightCommand", false);
            system.setState("createdIsShadowsEnabledCommand", false);
            return;
        }
        // Add commands
        if (system.devBox.isEnableFreeCamera &&
            !system.getState("createdIsEnableFreeCameraCommand")) {
            // create enable free camera command !TODO
            system.setState("createdIsEnableFreeCameraCommand", true);
        }
        if (system.devBox.isEnablePhysics &&
            !system.getState("createdIsEnablePhysicsCommand")) {
            // create physics commands !TODO
            system.setState("createdIsEnablePhysicsCommand", true);
        }
        if (system.devBox.isSetNight &&
            !system.getState("createdIsSetNightCommand")) {
            // create night commands !TODO
            system.setState("createdIsSetNightCommand", true);
        }
        if (system.devBox.isShadowsEnabled &&
            !system.getState("createdIsShadowsEnabledCommand")) {
            system.addCommand(Commands.CreateShadows);
            system.setState("createdIsShadowsEnabledCommand", true);
        }
        // Remove commands
        if (!system.devBox.isEnableFreeCamera &&
            system.getState("createdIsEnableFreeCameraCommand")) {
            // remove enable free camera command !TODO
            system.setState("createdIsEnableFreeCameraCommand", false);
        }
        if (!system.devBox.isEnablePhysics &&
            system.getState("createdIsEnablePhysicsCommand")) {
            // remove physics commands !TODO
            system.setState("createdIsEnablePhysicsCommand", false);
        }
        if (!system.devBox.isSetNight &&
            system.getState("createdIsSetNightCommand")) {
            // remove night commands !TODO
            system.setState("createdIsSetNightCommand", false);
        }
        if (!system.devBox.isShadowsEnabled &&
            system.getState("createdIsShadowsEnabledCommand")) {
            system.removeCommand(Commands.UpdateShadowNumber);
            system.removeCommand(Commands.UpdateShadowProperties);
            system.addCommand(Commands.RemoveShadows);
            system.setState("createdIsShadowsEnabledCommand", false);
        }
    }
}
