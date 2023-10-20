import * as Comps from "./components.js"
import * as Graphics from "./graphics.js"
import * as Utils from "./utils.js"

class AnimationManager {
    private static animationTree: Array<Array<Array<Array<Array<Array<string> | string> | string> | string> | string>> = [
        [ // stickman
            "",
            [ // running
                "",
                "",
                "",
                "",
                "",
                "",
            ],
            [ // knocked down
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
            [ // dying
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
            [ // aiming
                "",
                "",
                "",
                [""], // shooting
                ["", "", "", ""] // reloading
            ]
        ],
        [ // gun
            "a",
            ["b"], [], []],
        [ // grass types
            ",", [], [], [], [], [], [],],
        [ // grass types
            ",", [], [], [], [], [], [],],
    ]
    static play(currentAnimationNode: number[]): string {
        let can = currentAnimationNode

        switch (can.length) {
            case 1:
                return this.animationTree[can[0]][0] as string // select idle list's first element
            case 2:
                can.push(0)
                return this.animationTree[can[0]][can[1]][can[2]] as string
            case 3:
                can[2] += 1
                return this.animationTree[can[0]][can[1]][can[2]] as string

            case 0:
                console.log("nothing to play")
                throw ""
            default:
                throw "no node avaible at such position"

        }
    }
}

export class StickmanIdle implements Graphics.Animation {
    isFinished: boolean
    cancel: Function | null;
    runOnState: Comps.EntityStates
    currentAnimationNode: number[]
    displayElement: Utils.Str
    isChanged: Utils.Bool

    constructor() {
        this.isChanged = new Utils.Bool(true)
        this.cancel = null
        this.runOnState = Comps.EntityStates.Run
        this.currentAnimationNode = []
        this.isFinished = false
        this.displayElement = new Utils.Str("A")
    }

    async play(): Promise<void> {
        this.currentAnimationNode = [0]

        await this.step(80)

        this.isFinished = true
    }

    async step(ms: number): Promise<boolean> {
        this.displayElement.str =
            AnimationManager.play(this.currentAnimationNode)
        let { promise, cancel } = Utils.delay(ms)
        this.cancel = cancel
        await promise

        return this.isFinished
    }
}


export class StickmanRun implements Graphics.Animation {
    isFinished: boolean
    cancel: Function | null;
    runOnState: Comps.EntityStates
    currentAnimationNode: number[]
    displayElement: Utils.Str
    isChanged: Utils.Bool

    constructor() {
        this.cancel = null
        this.runOnState = Comps.EntityStates.Run
        this.currentAnimationNode = []
        this.isFinished = false
        this.displayElement = new Utils.Str("A")
        this.isChanged = new Utils.Bool(true)
    }

    async play(): Promise<void> {
        console.log("played running")
        this.currentAnimationNode = [0, 1]

        if (await this.step(80)) return
        if (await this.step(80)) return
        if (await this.step(80)) return
        if (await this.step(80)) return
        if (await this.step(80)) return
        if (await this.step(80)) return

        this.isFinished = true
    }

    async step(ms: number): Promise<boolean> {
        this.displayElement.str =
            AnimationManager.play(this.currentAnimationNode)
        let { promise, cancel } = Utils.delay(ms)
        this.cancel = cancel
        await promise

        return this.isFinished
    }
}
