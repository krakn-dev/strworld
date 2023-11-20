import * as ECS from "./ecs.js";
import * as Utils from "./utils.js";
import * as Comps from "./components.js";
import * as Anims from "./animations.js";
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
})(Commands || (Commands = {}));
export function getInstanceFromEnum(commandEnum) {
    switch (commandEnum) {
        case Commands.TheFirst:
            return new TheFirst();
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
export class CreatePlayer {
    constructor() {
        this.type = Commands.CreatePlayer;
    }
    run(system) {
        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                let player = Utils.newUid();
                let position = new Comps.Position(x * 70, y * 70, player);
                let entityState = new Comps.EntityState(new Map([[Comps.EntityStates.Idle, null]]), player);
                let computedElement = new Comps.ComputedElement(Comps.ElementTypes.Entity, player);
                computedElement.translateX = x * 70;
                computedElement.translateY = y * 70;
                computedElement.zIndex = y;
                system.addComponent(new Comps.Health(10, player));
                system.addComponent(new Comps.Animation([new Anims.PlayerIdle(), new Anims.PlayerRunning()], player));
                system.addComponent(position);
                system.addComponent(entityState);
                system.addComponent(computedElement);
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
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Position], ECS.By.Any, null]);
        if (foundComponents[0].length == 0) {
            return;
        }
        if (system.input.movementDirection.x == 0 &&
            system.input.movementDirection.y == 0) {
            let foundEntStateAndAnimation = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                    Comps.Components.Animation
                ],
                ECS.By.EntityId,
                foundComponents[0][0].component.entityUid
            ]);
            if (foundEntStateAndAnimation[0].length == 0) {
                console.log("entityState not found");
                return;
            }
            if (foundEntStateAndAnimation[1].length == 0) {
                console.log("animation not found");
                return;
            }
            let entityState = foundEntStateAndAnimation[0][0].component;
            let animation = foundEntStateAndAnimation[1][0].component;
            // cannot change state if
            if (!entityState.states.has(Comps.EntityStates.Run))
                return;
        }
        let fC = foundComponents[0][0];
        let positionComponent = fC.component;
        let newPosition = new Utils.Vector2(positionComponent.x, positionComponent.y);
        newPosition.x += system.input.movementDirection.x * delta * velocity;
        newPosition.y += system.input.movementDirection.y * delta * velocity;
        let foundEntityState = system.find([ECS.Get.One, [Comps.Components.EntityState], ECS.By.EntityId, fC.component.entityUid]);
        if (foundEntityState[0].length == 0) {
            console.log("entityState not found");
            return;
        }
        system.addElementToMapProperty(foundEntityState[0][0], "states", new Utils.MapEntry(Comps.EntityStates.Run, null));
        if (newPosition.x != positionComponent.x) {
            system.setProperty(fC, "x", newPosition.x);
        }
        if (newPosition.y != positionComponent.y) {
            system.setProperty(fC, "y", newPosition.y);
        }
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
            let computedElement = cC.component;
            if (!computedElement.isChanged)
                continue;
            graphicDiff.changedComputedElements.push(cC);
            // set properties to not changed
            system.setProperty(cC, "isChanged", false);
            system.setProperty(cC, "classesDiff", new Comps.ClassesDiff());
            system.setProperty(cC, "isTranslateXChanged", false);
            system.setProperty(cC, "isTranslateYChanged", false);
            system.setProperty(cC, "isZIndexChanged", false);
            system.setProperty(cC, "isColorChanged", false);
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
            let animation = cC.component;
            for (let fC of foundComponents[0]) {
                let computedElement = fC.component;
                if (computedElement.entityUid ==
                    animation.entityUid &&
                    computedElement.elementType ==
                        Comps.ElementTypes.Entity) {
                    system.setProperty(fC, "isChanged", true);
                    system.setProperty(fC, "displayElement", animation.currentDisplayElement);
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
            let timer = new Comps.Timer(currentStateAnimation.frameTimes[currentStateAnimation.frameTimes.length - 1], Comps.TimerTypes.Animation, entityState.entityUid);
            system.addComponent(timer);
            system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0]);
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
        for (let cC of system.componentDiffs.addedComponents) {
            if (cC.component.type != Comps.Components.Animation)
                continue;
            let foundComponents = system.find([
                ECS.Get.All,
                [
                    Comps.Components.EntityState,
                ],
                ECS.By.EntityId,
                cC.component.entityUid
            ]);
            if (foundComponents[0].length == 0) {
                console.log("entityState component missing");
                continue;
            }
            let entityState = foundComponents[0][0].component;
            let animationChangedComponent = cC.component;
            let currentStateAnimation = null;
            for (let a of animationChangedComponent.animations) {
                if (entityState.states.has(a.executeOn)) {
                    currentStateAnimation = a;
                }
            }
            if (currentStateAnimation == null)
                continue;
            let timer = new Comps.Timer(currentStateAnimation.frameTimes[currentStateAnimation.frameTimes.length - 1], Comps.TimerTypes.Animation, entityState.entityUid);
            system.addComponent(timer);
            system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0]);
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
            }
        }
    }
}
export class PlayAnimations {
    constructor() {
        this.type = Commands.PlayAnimations;
    }
    run(system) {
        // on change entity state
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
            let animation = foundComponents[0][0].component;
            let entityState = cC.component;
            let currentStateAnimation = null;
            for (let a of animation.animations) {
                if (entityState.states.has(a.executeOn)) {
                    currentStateAnimation = a;
                }
            }
            if (currentStateAnimation == null)
                continue;
            system.setProperty(timer, "originalTime", currentStateAnimation.frameTimes[currentStateAnimation.frameTimes.length - 1]);
            system.setProperty(timer, "isRestart", true);
            system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0]);
        }
        // play next frame
        let foundComponents = system.find([ECS.Get.All, [Comps.Components.Timer], ECS.By.Any, null]);
        if (foundComponents[0].length == 0)
            console.log("no timers");
        for (let fC of foundComponents[0]) {
            let timer = fC.component;
            if (timer.timerType != Comps.TimerTypes.Animation)
                continue;
            let foundComponents = system.find([ECS.Get.One,
                [Comps.Components.Animation, Comps.Components.EntityState],
                ECS.By.EntityId,
                timer.entityUid]);
            if (foundComponents[0].length == 0) {
                console.log("animation component missing");
                break;
            }
            if (foundComponents[1].length == 0) {
                console.log("entityState component missing");
                break;
            }
            let animation = foundComponents[0][0].component;
            let entityState = foundComponents[1][0].component;
            let currentStateAnimation = null;
            for (let a of animation.animations) {
                if (entityState.states.has(a.executeOn)) {
                    currentStateAnimation = a;
                }
            }
            if (currentStateAnimation == null)
                continue;
            if (timer.isFinished) {
                system.setProperty(fC, "isRestart", true);
                system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[0]);
                continue;
            }
            let elapsedTime = timer.originalTime - timer.timeLeft;
            let currentFrameIndex = null;
            for (let [fTI, fT] of currentStateAnimation.frameTimes.entries()) {
                if (fTI == currentStateAnimation.frameTimes.length - 1)
                    break;
                if (fT > elapsedTime) {
                    currentFrameIndex = fTI - 1;
                    break;
                }
            }
            if (currentFrameIndex == null || currentFrameIndex == -1) {
                //                console.log("this is impossible.. or is it?", currentFrameIndex)
                break;
            }
            // if already is in this frame
            if (currentStateAnimation.frames[currentFrameIndex] ==
                animation.currentDisplayElement)
                continue;
            system.setProperty(foundComponents[0][0], "currentDisplayElement", currentStateAnimation.frames[currentFrameIndex]);
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
                console.log("restart");
                system.setProperty(fC, "isFinished", false);
                system.setProperty(fC, "timeLeft", timer.originalTime);
                system.setProperty(fC, "isRestart", false);
            }
            if (timer.isFinished)
                continue;
            let newTimeLeft = timer.timeLeft - delta;
            system.setProperty(fC, "timeLeft", newTimeLeft);
            if (newTimeLeft <= 0) {
                console.log("finished");
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
