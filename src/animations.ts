import * as Comps from "./components.js"

export interface Animation {
    executeOn: Comps.EntityStates
    frames: (string | null)[]
    frameTimes: number[]
}

export class PlayerRunning implements Animation {
    executeOn: Comps.EntityStates
    frameTimes: number[]
    frames: (string | null)[]
    constructor() {
        this.executeOn = Comps.EntityStates.Run
        this.frameTimes = [0, 200, 400, 600, 800, 1000, 1200]
        this.frames = ["", "", "", "", "", "", null]
    }
}

export class PlayerIdle implements Animation {
    executeOn: Comps.EntityStates
    frameTimes: number[]
    frames: (string | null)[]
    constructor() {
        this.executeOn = Comps.EntityStates.Idle
        this.frameTimes = [0, 1000]
        this.frames = ["", null]
    }
}
