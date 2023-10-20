var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Comps from "./components.js";
import * as Utils from "./utils.js";
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
export class StickmanIdle {
    constructor() {
        this.isChanged = new Utils.Bool(true);
        this.cancel = null;
        this.runOnState = Comps.EntityStates.Run;
        this.currentAnimationNode = [];
        this.isFinished = false;
        this.displayElement = new Utils.Str("A");
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentAnimationNode = [0];
            yield this.step(80);
            this.isFinished = true;
        });
    }
    step(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            this.displayElement.str =
                AnimationManager.play(this.currentAnimationNode);
            let { promise, cancel } = Utils.delay(ms);
            this.cancel = cancel;
            yield promise;
            return this.isFinished;
        });
    }
}
export class StickmanRun {
    constructor() {
        this.cancel = null;
        this.runOnState = Comps.EntityStates.Run;
        this.currentAnimationNode = [];
        this.isFinished = false;
        this.displayElement = new Utils.Str("A");
        this.isChanged = new Utils.Bool(true);
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("played running");
            this.currentAnimationNode = [0, 1];
            if (yield this.step(80))
                return;
            if (yield this.step(80))
                return;
            if (yield this.step(80))
                return;
            if (yield this.step(80))
                return;
            if (yield this.step(80))
                return;
            if (yield this.step(80))
                return;
            this.isFinished = true;
        });
    }
    step(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            this.displayElement.str =
                AnimationManager.play(this.currentAnimationNode);
            let { promise, cancel } = Utils.delay(ms);
            this.cancel = cancel;
            yield promise;
            return this.isFinished;
        });
    }
}
