import * as Comps from "./components.js"

export interface Animation {
    executeOn: Comps.EntityStates
    frames: string[]
    frameTimes: number[]
}

export class PlayerRunning implements Animation {
    executeOn: Comps.EntityStates
    frameTimes: number[]
    frames: string[]
    constructor() {
        this.executeOn = Comps.EntityStates.Run
        this.frameTimes = [0, 200, 400, 600, 800, 1000]
        this.frames = ["", "", "", "", "", ""]
    }
}

export class PlayerIdle implements Animation {
    executeOn: Comps.EntityStates
    frameTimes: number[]
    frames: string[]
    constructor() {
        this.executeOn = Comps.EntityStates.Run
        this.frameTimes = [0]
        this.frames = [""]
    }
}
