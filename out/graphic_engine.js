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
    constructor(newComponentUid) {
        this.commandtype = ECS.Commands.SyncGraphicEntity;
        this.component = ECS.Components.Position;
        this.get = ECS.Get.One;
        this.by = ECS.By.ComponentUid;
        this.byArgs = newComponentUid;
    }
    run(args) {
        for (var a of args) {
            for (var e of GraphicEngine.graphicEntities) {
                if (a.componentUid == e.componentUid) {
                    e.position = a.position;
                }
            }
        }
    }
}
export class GraphicFox {
    constructor(newPosition, newComponentUid) {
        this.isRunningAnimation = false;
        this.stateBuffer = null;
        this.position = newPosition;
        this.componentUid = newComponentUid;
        this.depth = 2;
        this.displayState = "";
        this.entityType = ECS.Entities.Fox;
        this.currentState = ECS.EntityStates.Idle;
        this.behavior = new FoxBehavior(this.displayState);
    }
}
export class FoxBehavior {
    constructor(newEntityDisplay) {
        this.entityDisplay = newEntityDisplay;
    }
    onIdle() {
        return __awaiter(this, void 0, void 0, function* () {
            this.entityDisplay = "";
        });
    }
    onDeath() {
        return __awaiter(this, void 0, void 0, function* () {
            this.entityDisplay = ".";
        });
    }
    onWalkRight() {
        return __awaiter(this, void 0, void 0, function* () {
            this.entityDisplay = "";
        });
    }
    onWalkLeft() {
        return __awaiter(this, void 0, void 0, function* () {
            this.entityDisplay = "";
        });
    }
}
export class GraphicEngine {
    constructor(newViewSize) {
        this.z = [document.getElementById("z-0"),
            document.getElementById("z-1"),
            document.getElementById("z-2")];
        this.viewSize = newViewSize;
        this.worldString = [];
        for (var i = 0; i < this.z.length; i++) {
            this.worldString[i] = [];
            for (var x = 0; x < this.viewSize.x; x++) {
                this.worldString[i][x] = [];
                for (var y = 0; y < this.viewSize.y; y++) {
                    this.worldString[i][x][y] = "&nbsp;";
                }
            }
        }
    }
    static setState(newEntityState, entityUid) {
        for (var e of GraphicEngine.graphicEntities) {
            if (e.componentUid == entityUid) {
                if (e.isRunningAnimation) {
                    e.stateBuffer = newEntityState;
                }
                else {
                    e.currentState = newEntityState;
                }
                return;
            }
        }
    }
    render() {
        //        this.bufferSync()
        //
        //        for (var i = 0; i < this.z.length; i++) {
        //            this.z[i].innerHTML = ""
        //
        //            for (var e of GraphicEngine.graphicEntities) {
        //                if (e.displayState != null) {
        //                    if (e.depth == i) {
        //                        //                        console.log(this.worldString[i][e.position.x][e.position.y], i, "eeeee")
        //                        console.log(e.displayState, i, "eeeee")
        //                        this.worldString[i][e.position.x][e.position.y] = e.displayState;
        //                        console.log("TYOOOOOOOOOOOOOOOOOOOoo")
        //                    }
        //                }
        //            }
        //
        //            for (var x of this.worldString[i]) {
        //                for (var y of x) {
        //                    this.z[i].innerHTML += y;
        //                }
        //                this.z[i].innerHTML += "<br>";
        //            }
        //        }
    }
    bufferSync() {
        for (var e of GraphicEngine.graphicEntities) {
            switch (e.stateBuffer) {
                case ECS.EntityStates.Idle:
                    if (!e.isRunningAnimation) {
                        e.currentState = e.stateBuffer;
                        e.stateBuffer = null;
                    }
                    break;
                case ECS.EntityStates.WalkLeft:
                    e.currentState = e.stateBuffer;
                    e.stateBuffer = null;
                    break;
                case ECS.EntityStates.Death:
                    e.currentState = e.stateBuffer;
                    e.stateBuffer = null;
                    break;
                case ECS.EntityStates.WalkRight:
                    e.currentState = e.stateBuffer;
                    e.stateBuffer = null;
                    break;
                case ECS.EntityStates.WindLeft:
                    if (!e.isRunningAnimation) {
                        e.currentState = e.stateBuffer;
                        e.stateBuffer = null;
                    }
                    break;
                case ECS.EntityStates.WindRight:
                    if (!e.isRunningAnimation) {
                        e.currentState = e.stateBuffer;
                        e.stateBuffer = null;
                    }
                    break;
            }
            switch (e.currentState) {
                case ECS.EntityStates.Death:
                    e.behavior.onDeath();
                    break;
                case ECS.EntityStates.WalkLeft:
                    e.behavior.onWalkRight();
                    break;
                case ECS.EntityStates.WalkRight:
                    e.behavior.onWalkLeft();
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
