import * as Comps from "./components.js";
export class PlayerRunning {
    constructor() {
        this.executeOn = Comps.EntityStates.Run;
        this.frameTimes = [0, 200, 400, 600, 800, 1000, 1200];
        this.frames = ["", "", "", "", "", "", null];
    }
}
export class PlayerIdle {
    constructor() {
        this.executeOn = Comps.EntityStates.Idle;
        this.frameTimes = [0, 1000];
        this.frames = ["", null];
    }
}
