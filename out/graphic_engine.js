var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as ECS from "./ecs_engine.js";
import * as Utils from "./utils.js";
let flower = '<span class="icon-flower"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>';
class AnimationManager {
    static play(currentAnimationNode) {
        let can = currentAnimationNode;
        switch (can.length) {
            case 1:
                return this.animationTree[can[0]][0]; // select idle list's first element
            case 2:
                can.push(0);
                return this.animationTree[can[0]][can[1]][can[2]];
            case 3:
                can[2] += 1;
                return this.animationTree[can[0]][can[1]][can[2]];
            case 0:
                console.log("nothing to play");
                throw "";
            default:
                throw "no node avaible at such position";
        }
    }
}
AnimationManager.animationTree = [
    [
        "",
        [
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
        ],
        [
            "",
            "",
            "",
            [""],
            ["", "", "", ""] // reloading
        ]
    ],
    [
        "a",
        ["b"], [], []
    ],
    [
        ",", [], [], [], [], [], [],
    ],
    [
        ",", [], [], [], [], [], [],
    ],
];
export class SyncGraphicEntity {
    constructor() {
        this.commandtype = ECS.Commands.SyncGraphicEntity;
        this.component = [ECS.Components.Position, ECS.Components.LookingDirection, ECS.Components.EntityState];
        this.get = ECS.Get.AllOfEach;
        this.by = ECS.By.Everything;
        this.byArgs = null;
    }
    run(args) {
        for (var a of args) {
            for (var e of GraphicEngine.graphicEntities) {
                if (a.ownerUid == e.entityUid) {
                    switch (a.componentType) {
                        case ECS.Components.LookingDirection:
                            let direction = a;
                            e.isEntityLookingRight = direction.isLookingRight;
                            break;
                        case ECS.Components.Position:
                            let position = a;
                            e.entityPosition = position.position;
                            break;
                        case ECS.Components.EntityState:
                            let state = a;
                            e.entityState = state.currentState;
                            break;
                    }
                }
            }
        }
    }
}
export class Str {
    constructor(newStr) {
        this.str = newStr;
    }
}
export class Bool {
    constructor(newBool) {
        this.bool = newBool;
    }
}
export class GraphicEntity {
    constructor(newAnimations, newEntityPosition, newEntityUid, newIsEntityLookingRight, newZ) {
        this.finishedPlaying = new Bool(false);
        this.entityUid = newEntityUid;
        this.z = newZ;
        this.animations = newAnimations;
        this.currentPlaying = null;
        this.entityState = ECS.EntityStates.Idle;
        this.displayElement = new Str("?");
        this.entityPosition = newEntityPosition;
        this.isEntityLookingRight = newIsEntityLookingRight;
        this.documentEntity = new DocumentEntity(this.entityUid, this.displayElement, this.z);
        if (!this.isEntityLookingRight)
            this.documentEntity.lookLeft();
        for (var a of newAnimations) {
            a.displayElement = this.displayElement;
            a.finished = this.finishedPlaying;
        }
    }
    doTasks() {
        this.syncEntityStateWithAnimation();
        this.deleteCurrentPlayingAnimation();
        this.syncDocument();
    }
    deleteCurrentPlayingAnimation() {
        if (this.finishedPlaying.bool) {
            this.currentPlaying = null;
        }
    }
    syncDocument() {
        this.documentEntity.setPosition(this.entityPosition);
        this.documentEntity.setDisplayElement(this.displayElement);
        if (this.isEntityLookingRight) {
            this.documentEntity.lookRight();
        }
        else
            this.documentEntity.lookLeft();
    }
    syncEntityStateWithAnimation() {
        var _a, _b;
        for (var a of this.animations) {
            if (a.runOnEntityState == this.entityState) {
                if (a.runOnEntityState == ((_a = this.currentPlaying) === null || _a === void 0 ? void 0 : _a.runOnEntityState)) {
                    return;
                }
                if ((_b = this.currentPlaying) === null || _b === void 0 ? void 0 : _b.cancel)
                    this.currentPlaying.cancel();
                this.currentPlaying = a;
                this.finishedPlaying.bool = false;
                a.run();
            }
        }
    }
}
export class PlantIdle {
    constructor() {
        this.cancel = null;
        this.runOnEntityState = ECS.EntityStates.Idle;
        this.currentAnimationNode = [];
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentAnimationNode = [2];
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            this.finished.bool = true;
        });
    }
}
export class StickmanIdle {
    constructor() {
        this.cancel = null;
        this.runOnEntityState = ECS.EntityStates.Idle;
        this.currentAnimationNode = [];
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentAnimationNode = [0];
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            this.finished.bool = true;
        });
    }
}
export class StickmanRun {
    constructor() {
        this.cancel = null;
        this.runOnEntityState = ECS.EntityStates.Run;
        this.currentAnimationNode = [];
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("played running");
            let currentAnimationNode = [0, 1];
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            if (this.finished.bool)
                return;
            let { promise, cancel } = Utils.delay(80);
            this.cancel = cancel;
            yield promise;
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            if (this.finished.bool)
                return;
            ({ promise, cancel } = Utils.delay(80));
            this.cancel = cancel;
            yield promise;
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            if (this.finished.bool)
                return;
            ({ promise, cancel } = Utils.delay(80));
            this.cancel = cancel;
            yield promise;
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            if (this.finished.bool)
                return;
            ({ promise, cancel } = Utils.delay(80));
            this.cancel = cancel;
            yield promise;
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            if (this.finished.bool)
                return;
            ({ promise, cancel } = Utils.delay(80));
            this.cancel = cancel;
            yield promise;
            this.displayElement.str =
                AnimationManager.play(currentAnimationNode);
            this.finished.bool = true;
        });
    }
}
export class DocumentEntity {
    constructor(entityUid, newDisplayElement, z) {
        if (z < 0 || z > 2) {
            console.log("z is too high or too low");
            throw "";
        }
        let zElement = document.getElementById("z-" + z);
        zElement.insertAdjacentHTML("beforeend", `<div class="rel" id="${entityUid}"><div class="state">${newDisplayElement.str}</div></div>`);
        this.documentEntityReference = document.getElementById(entityUid.toString());
        this.stateElement = this.documentEntityReference.firstElementChild;
        this._doNotDisturb = false;
        this.isLookingRight = true;
    }
    lookRight() {
        if (this.isLookingRight) {
            return;
        }
        this.isLookingRight = true;
        this.stateElement.classList.remove("look-left");
        this.stateElement.classList.add("look-right");
    }
    lookLeft() {
        if (!this.isLookingRight) {
            return;
        }
        this.isLookingRight = false;
        this.stateElement.classList.remove("look-right");
        this.stateElement.classList.add("look-left");
    }
    toggleDoNotDisturb() {
        this._doNotDisturb = !this._doNotDisturb;
        if (this._doNotDisturb)
            this.stateElement.classList.add("do-not-disturb");
        if (!this._doNotDisturb)
            this.stateElement.classList.remove("do-not-disturb");
    }
    get doNotDisturb() {
        return this._doNotDisturb;
    }
    dispose() {
        this.documentEntityReference.remove();
    }
    setDisplayElement(newDisplayElement) {
        this.stateElement.innerHTML = newDisplayElement.str;
    }
    setPosition(newPosition) {
        this.stateElement.style.left = `${newPosition.x * 0.4}vmin`;
        this.stateElement.style.top = `${newPosition.y * 0.4}vmin`;
        this.stateElement.style.transform = `translateZ(${newPosition.y * 0.2}vmin)`;
        //        this.stateElement.style.scale = `${1 + (newPosition.y / 50) * 0.15}`
    }
}
export class GraphicEngine {
    constructor(newViewSize) {
        this.viewSize = newViewSize;
    }
    render() {
        for (var e of GraphicEngine.graphicEntities) {
            //            if (e.entityPosition.x > 9 || e.entityPosition.y > 9 ||
            //                e.entityPosition.x < 0 || e.entityPosition.y < 0
            //            ) {
            //                continue
            //            }
            e.doTasks();
        }
    }
}
GraphicEngine.graphicEntities = [];
var Colors;
(function (Colors) {
    Colors["Green"] = "#95ff85";
    Colors["Red"] = "#e66570";
    Colors["Black"] = "#302829";
})(Colors || (Colors = {}));
