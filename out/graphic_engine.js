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
let flower = '<span class="icon-flower"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>';
export class SyncGraphicEntity {
    constructor() {
        this.commandtype = ECS.Commands.SyncGraphicEntity;
        this.component = [ECS.Components.Position, ECS.Components.SpriteDirection];
        this.get = ECS.Get.AllOfEach;
        this.by = ECS.By.Everything;
        this.byArgs = null;
    }
    run(args) {
        for (var a of args) {
            for (var e of GraphicEngine.graphicEntities) {
                if (a.ownerUid == e.ecsEntityUid) {
                    switch (a.componentType) {
                        case ECS.Components.SpriteDirection:
                            let direction = a;
                            e.isLookingRight = direction.isLookingRight;
                            break;
                        case ECS.Components.Position:
                            let position = a;
                            e.position = position.position;
                            break;
                        case ECS.Components.EntityState:
                            let state = a;
                            e.currentEntityState = state.currentState;
                            break;
                    }
                }
            }
        }
    }
}
export class GraphicFox {
    constructor(newPosition, newEcsEntityUid) {
        this.isLookingRight = true;
        this.isRunningAnimation = false;
        this.stateBuffer = null;
        this.position = newPosition;
        this.ecsEntityUid = newEcsEntityUid;
        this.depth = 2;
        this.displayState = "";
        //this.displayState = "#"
        this.currentEntityState = ECS.EntityStates.Idle;
        this.behavior = new FoxBehavior(this.displayState, this.isRunningAnimation, this.isLookingRight);
    }
}
export class GraphicGrass {
    constructor(newEcsEntityUid) {
        this.isRunningAnimation = false;
        this.stateBuffer = null;
        this.position = null;
        this.ecsEntityUid = newEcsEntityUid;
        this.depth = 0;
        this.displayState = "";
        this.currentEntityState = ECS.EntityStates.Idle;
        this.behavior = new GrassBehavior(this.displayState, this.isRunningAnimation);
    }
}
export class GrassBehavior {
    constructor(newEntityDisplay, newIsRunningAnimation) {
        this.isRunningAnimation = newIsRunningAnimation;
        this.entityDisplay = newEntityDisplay;
    }
    onIdle() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunningAnimation = true;
            //        if (this.isLookingRight) {
            //            this.entityDisplay = ""
            //        }
            //        else {
            //            this.entityDisplay = "L"
            //        }
            this.isRunningAnimation = false;
        });
    }
    onDead() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunningAnimation = true;
            this.entityDisplay = "";
            this.isRunningAnimation = false;
        });
    }
    onWindLeft() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunningAnimation = true;
            this.entityDisplay = "R";
            this.isRunningAnimation = false;
        });
    }
    onWindRight() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunningAnimation = true;
            this.entityDisplay = "R";
            this.isRunningAnimation = false;
        });
    }
}
export class FoxBehavior {
    constructor(newEntityDisplay, newIsRunningAnimation, newIsLookingRight) {
        this.isLookingRight = newIsLookingRight;
        this.isRunningAnimation = newIsRunningAnimation;
        this.entityDisplay = newEntityDisplay;
    }
    onIdle() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunningAnimation = true;
            if (this.isLookingRight) {
                this.entityDisplay = "";
            }
            else {
                this.entityDisplay = "L";
            }
            this.isRunningAnimation = false;
        });
    }
    onDead() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunningAnimation = true;
            this.entityDisplay = "";
            this.isRunningAnimation = false;
        });
    }
    onRun() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRunningAnimation = true;
            this.entityDisplay = "R";
            this.isRunningAnimation = false;
        });
    }
}
export class GraphicEngine {
    constructor(newViewSize) {
        this.viewSize = newViewSize;
        this.emptyView = [];
        for (var i = 0; i < 3; i++) {
            this.emptyView[i] = [];
            for (var x = 0; x < this.viewSize.x; x++) {
                this.emptyView[i][x] = [];
                for (var y = 0; y < this.viewSize.y; y++) {
                    this.emptyView[i][x][y] = ""; // Fill with space
                }
            }
        }
    }
    render() {
        this.bufferSync();
        let world = JSON.parse(JSON.stringify(this.emptyView));
        for (var e of GraphicEngine.graphicEntities) {
            if (e.displayState == null || e.position == null) {
                continue;
            }
            if (e.position.x > 9 || e.position.y > 9 ||
                e.position.x < 0 || e.position.y < 0) {
                continue;
            }
            world[e.depth][e.position.y][e.position.x] = e.displayState;
        }
        for (var zI = 0; zI < 3; zI++) { //  [..]
            for (var colI = 0; colI < this.viewSize.y; colI++) {
                let rowElement = document.getElementById("p-" + zI + "-" + colI); //  [..]
                rowElement.innerHTML = "";
                let tempRow = world[zI][colI].join("");
                rowElement.innerHTML = tempRow;
                rowElement.innerHTML += "<br>";
            }
        }
    }
    bufferSync() {
        for (var e of GraphicEngine.graphicEntities) {
            switch (e.stateBuffer) {
                case ECS.EntityStates.Idle:
                    if (!e.isRunningAnimation) {
                        e.currentEntityState = e.stateBuffer;
                        e.stateBuffer = null;
                    }
                    break;
                case ECS.EntityStates.Dead:
                    e.currentEntityState = e.stateBuffer;
                    e.stateBuffer = null;
                    break;
                case ECS.EntityStates.Running:
                    e.currentEntityState = e.stateBuffer;
                    e.stateBuffer = null;
                    break;
                case ECS.EntityStates.WindLeft:
                    if (!e.isRunningAnimation) {
                        e.currentEntityState = e.stateBuffer;
                        e.stateBuffer = null;
                    }
                    break;
                case ECS.EntityStates.WindRight:
                    if (!e.isRunningAnimation) {
                        e.currentEntityState = e.stateBuffer;
                        e.stateBuffer = null;
                    }
                    break;
            }
            switch (e.currentEntityState) {
                case ECS.EntityStates.Dead:
                    e.behavior.onDead();
                    break;
                case ECS.EntityStates.Running:
                    e.behavior.onRun();
                    break;
                case ECS.EntityStates.WindLeft:
                    e.behavior.onWindLeft();
                    break;
                case ECS.EntityStates.WindRight:
                    e.behavior.onWindRight();
                    break;
                case ECS.EntityStates.Idle:
                    e.behavior.onIdle();
                    break;
            }
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
