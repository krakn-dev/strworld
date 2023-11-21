import * as Comps from "./components.js";
export class AnimationFrame {
    constructor(newFrameDisplay, newFrameTime, newIsEndFrame = false) {
        this.frameTime = newFrameTime;
        this.frameDisplay = newFrameDisplay;
        this.isEndFrame = newIsEndFrame;
    }
}
export class PlayerRunning {
    constructor() {
        this.executeOn = Comps.EntityStates.Run;
        this.priority = 1;
        this.frames =
            [
                new AnimationFrame("", 0),
                new AnimationFrame("", 100),
                new AnimationFrame("", 200),
                new AnimationFrame("", 300),
                new AnimationFrame("", 400),
                new AnimationFrame("", 500),
                new AnimationFrame("", 600, true)
            ];
    }
}
export class PlayerIdle {
    constructor() {
        this.executeOn = Comps.EntityStates.Idle;
        this.frames =
            [
                new AnimationFrame("", 0),
                new AnimationFrame("", 1000),
                new AnimationFrame("", 2000, true)
            ];
        this.priority = 0;
    }
}
