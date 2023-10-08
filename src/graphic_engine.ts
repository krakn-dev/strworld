import * as ECS from "./ecs_engine.js"
import * as Utils from "./utils.js"


let flower = '<span class="icon-flower"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>'
export class SyncGraphicEntity implements ECS.Command {
    get: ECS.Get
    component: ECS.Components | null
    by: ECS.By | null
    byArgs: number | ECS.Entities | null
    commandtype: ECS.Commands

    constructor(newComponentUid: number) {
        this.commandtype = ECS.Commands.SyncGraphicEntity
        this.component = ECS.Components.Position
        this.get = ECS.Get.One
        this.by = ECS.By.ComponentUid
        this.byArgs = newComponentUid
    }

    run(args: ECS.Component[]): void {
        for (var a of args) {
            for (var e of GraphicEngine.graphicEntities) {
                if (a.componentUid == e.componentUid) {
                    e.position = (a as ECS.Position).position
                }
            }
        }
    }
}

interface AnimalBehavior {
    entityDisplay: string | null
    onIdle(): Promise<void>
    onDeath(): Promise<void>
    onWalkRight(): Promise<void>
    onWalkLeft(): Promise<void>
}

interface PlantBehavior {
    entityDisplay: string | null
    onIdle(): Promise<void>
    onDeath(): Promise<void>
    onWindLeft(): Promise<void>
    onWindRight(): Promise<void>
}

interface GraphicEntity {
    isRunningAnimation: boolean
    stateBuffer: ECS.EntityStates | null
    position: Utils.Vector2
    componentUid: number
    depth: number
    displayState: string | null
    entityType: ECS.Entities
    currentState: ECS.EntityStates
    behavior: PlantBehavior | AnimalBehavior
}

export class GraphicFox implements GraphicEntity {
    isRunningAnimation: boolean
    stateBuffer: ECS.EntityStates | null
    position: Utils.Vector2
    componentUid: number
    depth: number
    displayState: string | null
    entityType: ECS.Entities
    currentState: ECS.EntityStates
    behavior: PlantBehavior | AnimalBehavior

    constructor(newPosition: Utils.Vector2, newComponentUid: number) {
        this.isRunningAnimation = false
        this.stateBuffer = null
        this.position = newPosition
        this.componentUid = newComponentUid
        this.depth = 2
        this.displayState = ""
        this.entityType = ECS.Entities.Fox
        this.currentState = ECS.EntityStates.Idle
        this.behavior = new FoxBehavior(this.displayState)
    }
}
export class FoxBehavior implements AnimalBehavior {
    entityDisplay: string | null

    constructor(newEntityDisplay: string | null) {
        this.entityDisplay = newEntityDisplay
    }

    async onIdle(): Promise<void> {
        this.entityDisplay = ""
    }
    async onDeath(): Promise<void> {
        this.entityDisplay = "."
    }
    async onWalkRight(): Promise<void> {
        this.entityDisplay = ""
    }
    async onWalkLeft(): Promise<void> {
        this.entityDisplay = ""
    }
}

export class GraphicEngine {
    static graphicEntities: GraphicEntity[] = []

    viewSize: Utils.Vector2
    worldString: string[][][]
    z: HTMLElement[]

    constructor(newViewSize: Utils.Vector2) {
        this.z = [document.getElementById("z-0")!,
        document.getElementById("z-1")!,
        document.getElementById("z-2")!]

        this.viewSize = newViewSize
        this.worldString = []

        for (var i = 0; i < this.z.length; i++) {
            this.worldString[i] = []
            for (var x = 0; x < this.viewSize.x; x++) {
                this.worldString[i][x] = []
                for (var y = 0; y < this.viewSize.y; y++) {
                    this.worldString[i][x][y] = "&nbsp;"
                }
            }
        }
    }

    static setState(newEntityState: ECS.EntityStates, entityUid: number) {
        for (var e of GraphicEngine.graphicEntities) {
            if (e.componentUid == entityUid) {
                if (e.isRunningAnimation) {
                    e.stateBuffer = newEntityState
                }
                else {
                    e.currentState = newEntityState
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
                        e.currentState = e.stateBuffer
                        e.stateBuffer = null
                    }
                    break;
                case ECS.EntityStates.WalkLeft:
                    e.currentState = e.stateBuffer
                    e.stateBuffer = null
                    break;
                case ECS.EntityStates.Death:
                    e.currentState = e.stateBuffer
                    e.stateBuffer = null
                    break;
                case ECS.EntityStates.WalkRight:
                    e.currentState = e.stateBuffer
                    e.stateBuffer = null
                    break;
                case ECS.EntityStates.WindLeft:
                    if (!e.isRunningAnimation) {
                        e.currentState = e.stateBuffer
                        e.stateBuffer = null
                    }
                    break;
                case ECS.EntityStates.WindRight:
                    if (!e.isRunningAnimation) {
                        e.currentState = e.stateBuffer
                        e.stateBuffer = null
                    }
                    break;
            }

            switch (e.currentState) {
                case ECS.EntityStates.Death:
                    (e.behavior as any).onDeath()
                    break;
                case ECS.EntityStates.WalkLeft:
                    (e.behavior as AnimalBehavior).onWalkRight()
                    break;
                case ECS.EntityStates.WalkRight:
                    (e.behavior as AnimalBehavior).onWalkLeft()
                    break;
                case ECS.EntityStates.WindLeft:
                    (e.behavior as PlantBehavior).onWindLeft()
                    break;
                case ECS.EntityStates.WindRight:
                    (e.behavior as PlantBehavior).onWindRight()
                    break;
                case ECS.EntityStates.Idle:
                    (e.behavior as any).onIdle()
                    break;
            }

        }
    }
}

enum Colors {
    Green = "#95ff85",
    Red = "#e66570",
    Black = "#302829",
}
