import * as Comps from "./components.js";
export class PlayerRunning {
    constructor() {
        this.executeOn = Comps.EntityStates.Run;
        this.frameTimes = [0, 200, 400, 600, 800, 1000];
        this.frames = ["", "", "", "", "", ""];
    }
}
export class PlayerIdle {
    constructor() {
        this.executeOn = Comps.EntityStates.Run;
        this.frameTimes = [0];
        this.frames = [""];
    }
}
