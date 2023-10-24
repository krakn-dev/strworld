import * as ECS from "./ecs_engine.js"
import * as Utils from "./utils.js"

let flower = '<span class="icon-flower"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>'

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

export class SyncGraphicEntity implements ECS.Command {
    get: ECS.Get
    component: ECS.Components[] | null
    by: ECS.By | null
    byArgs: number | ECS.Entities | null
    commandtype: ECS.Commands

    constructor() { //entitty direction component
        this.commandtype = ECS.Commands.SyncGraphicEntity
        this.component = [ECS.Components.Position, ECS.Components.LookingDirection, ECS.Components.EntityState]
        this.get = ECS.Get.AllOfEach
        this.by = ECS.By.Everything
        this.byArgs = null
    }

    run(args: ECS.Component[]): void {
        for (var a of args) {
            for (var e of GraphicEngine.graphicEntities) {
                if (a.ownerUid == e.entityUid) {
                    switch (a.componentType) {
                        case ECS.Components.LookingDirection:
                            let direction = a as ECS.LookingDirection;
                            e.isEntityLookingRight = direction.isLookingRight
                            break;

                        case ECS.Components.Position:
                            let position = a as ECS.Position;
                            e.entityPosition = position.position
                            break;

                        case ECS.Components.EntityState:
                            let state = a as ECS.EntityState;
                            e.entityState = state.currentState
                            break;
                    }
                }
            }
        }
    }
}

export class Str {
    str: string
    constructor(newStr: string) {
        this.str = newStr
    }
}

export class Bool {
    bool: boolean
    constructor(newBool: boolean) {
        this.bool = newBool
    }
}

export class GraphicEntity {
    animations: Animation[]
    currentPlaying: Animation | null
    finishedPlaying: Bool
    entityState: ECS.EntityStates
    displayElement: Str
    entityPosition: Utils.Vector2
    documentEntity: DocumentEntity
    entityUid: number
    isEntityLookingRight: boolean
    z: number

    constructor(
        newAnimations: Animation[],
        newEntityPosition: Utils.Vector2,
        newEntityUid: number,
        newIsEntityLookingRight: boolean,
        newZ: number
    ) {
        this.finishedPlaying = new Bool(false)
        this.entityUid = newEntityUid
        this.z = newZ;
        this.animations = newAnimations
        this.currentPlaying = null
        this.entityState = ECS.EntityStates.Idle
        this.displayElement = new Str("?")
        this.entityPosition = newEntityPosition
        this.isEntityLookingRight = newIsEntityLookingRight
        this.documentEntity = new DocumentEntity(this.entityUid, this.displayElement, this.z)
        if (!this.isEntityLookingRight)
            this.documentEntity.lookLeft()
        for (var a of newAnimations) {
            a.displayElement = this.displayElement
            a.finished = this.finishedPlaying
        }
    }

    doTasks() {
        this.syncEntityStateWithAnimation()
        this.deleteCurrentPlayingAnimation()
        this.syncDocument()
    }

    deleteCurrentPlayingAnimation() {
        if (this.finishedPlaying.bool) {
            this.currentPlaying = null
        }
    }

    syncDocument() {
        this.documentEntity.setPosition(this.entityPosition)
        this.documentEntity.setDisplayElement(this.displayElement)

        if (this.isEntityLookingRight) {
            this.documentEntity.lookRight()
        }
        else
            this.documentEntity.lookLeft()
    }

    syncEntityStateWithAnimation() {
        for (var a of this.animations) {
            if (a.runOnEntityState == this.entityState) {
                if (a.runOnEntityState == this.currentPlaying?.runOnEntityState) {
                    return;
                }

                if (this.currentPlaying?.cancel)
                    this.currentPlaying.cancel()

                this.currentPlaying = a
                this.finishedPlaying.bool = false
                a.run()
            }
        }
    }
}

interface Animation {
    finished: Bool
    cancel: Function | null;
    runOnEntityState: ECS.EntityStates
    currentAnimationNode: number[]
    displayElement: Str

    run(): Promise<void>
}


export class PlantIdle implements Animation {
    finished!: Bool
    cancel: Function | null;
    runOnEntityState: ECS.EntityStates
    displayElement!: Str
    currentAnimationNode: number[]

    constructor() {
        this.cancel = null
        this.runOnEntityState = ECS.EntityStates.Idle
        this.currentAnimationNode = []
    }

    async run(): Promise<void> {
        let currentAnimationNode = [2]
        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)
        this.finished.bool = true
    }

}
export class StickmanIdle implements Animation {
    finished!: Bool
    cancel: Function | null;
    runOnEntityState: ECS.EntityStates
    displayElement!: Str
    currentAnimationNode: number[]

    constructor() {
        this.cancel = null
        this.runOnEntityState = ECS.EntityStates.Idle
        this.currentAnimationNode = []
    }

    async run(): Promise<void> {
        let currentAnimationNode = [0]
        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)
        this.finished.bool = true
    }

}
export class StickmanRun implements Animation {
    finished!: Bool
    cancel: Function | null;
    runOnEntityState: ECS.EntityStates
    displayElement!: Str
    currentAnimationNode: number[]

    constructor() {
        this.cancel = null
        this.runOnEntityState = ECS.EntityStates.Run
        this.currentAnimationNode = []
    }

    async run(): Promise<void> {
        console.log("played running")
        let currentAnimationNode = [0, 1]

        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)

        if (this.finished.bool) return;

        let { promise, cancel } = Utils.delay(80)
        this.cancel = cancel
        await promise

        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)

        if (this.finished.bool) return;

        ({ promise, cancel } = Utils.delay(80))
        this.cancel = cancel
        await promise

        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)

        if (this.finished.bool) return;

        ({ promise, cancel } = Utils.delay(80))
        this.cancel = cancel
        await promise

        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)

        if (this.finished.bool) return;


        ({ promise, cancel } = Utils.delay(80))
        this.cancel = cancel
        await promise

        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)

        if (this.finished.bool) return;

        ({ promise, cancel } = Utils.delay(80))
        this.cancel = cancel
        await promise

        this.displayElement.str =
            AnimationManager.play(currentAnimationNode)

        this.finished.bool = true
    }

}

export class DocumentEntity {
    private documentEntityReference: HTMLElement
    private stateElement: HTMLElement
    private _doNotDisturb: boolean
    private isLookingRight: boolean

    constructor(entityUid: number, newDisplayElement: Str, z: number) {
        if (z < 0 || z > 2) {
            console.log("z is too high or too low")
            throw ""
        }

        let zElement = document.getElementById("z-" + z)
        zElement!.insertAdjacentHTML("beforeend", `<div class="rel" id="${entityUid}"><div class="state">${newDisplayElement.str}</div></div>`);


        this.documentEntityReference = document.getElementById(entityUid.toString())!
        this.stateElement = this.documentEntityReference.firstElementChild! as HTMLElement

        this._doNotDisturb = false
        this.isLookingRight = true
    }
    lookRight() {
        if (this.isLookingRight) {
            return;
        }
        this.isLookingRight = true
        this.stateElement.classList.remove("look-left")
        this.stateElement.classList.add("look-right")
    }

    lookLeft() {
        if (!this.isLookingRight) {
            return;
        }
        this.isLookingRight = false
        this.stateElement.classList.remove("look-right")
        this.stateElement.classList.add("look-left")
    }

    toggleDoNotDisturb() {
        this._doNotDisturb = !this._doNotDisturb
        if (this._doNotDisturb)
            this.stateElement.classList.add("do-not-disturb")
        if (!this._doNotDisturb)
            this.stateElement.classList.remove("do-not-disturb")
    }

    get doNotDisturb(): boolean {
        return this._doNotDisturb
    }
    dispose() {
        this.documentEntityReference.remove()
    }
    setDisplayElement(newDisplayElement: Str) {
        this.stateElement.innerHTML = newDisplayElement.str
    }
    setPosition(newPosition: Utils.Vector2) {
        this.stateElement.style.left = `${newPosition.x * 0.4}vmin`
        this.stateElement.style.top = `${newPosition.y * 0.4}vmin`
        this.stateElement.style.transform = `translateZ(${newPosition.y * 0.2}vmin)`
        //        this.stateElement.style.scale = `${1 + (newPosition.y / 50) * 0.15}`
    }
}



export class GraphicEngine {
    static graphicEntities: GraphicEntity[] = []
    viewSize: Utils.Vector2

    constructor(newViewSize: Utils.Vector2) {
        this.viewSize = newViewSize
    }

    render() {

        for (var e of GraphicEngine.graphicEntities) {
            //            if (e.entityPosition.x > 9 || e.entityPosition.y > 9 ||
            //                e.entityPosition.x < 0 || e.entityPosition.y < 0
            //            ) {
            //                continue
            //            }
            e.doTasks()
        }

    }


}

enum Colors {
    Green = "#95ff85",
    Red = "#e66570",
    Black = "#302829",
}
