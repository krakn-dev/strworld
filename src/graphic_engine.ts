import * as ECS from "./ecs_engine.js"
import * as Utils from "./utils.js"


let flower = '<span class="icon-flower"><span class="path1"></span><span class="path2"></span><span class="path3"></span></span>'
export class SyncGraphicEntity implements ECS.Command {
    get: ECS.Get
    component: ECS.Components[] | null
    by: ECS.By | null
    byArgs: number | ECS.Entities | null
    commandtype: ECS.Commands

    constructor() { //entitty direction component
        this.commandtype = ECS.Commands.SyncGraphicEntity
        this.component = [ECS.Components.Position, ECS.Components.SpriteDirection]
        this.get = ECS.Get.AllOfEach
        this.by = ECS.By.Everything
        this.byArgs = null
    }

    run(args: ECS.Component[]): void {
        for (var a of args) {
            for (var e of GraphicEngine.graphicEntities) {
                if (a.ownerUid == e.ecsEntityUid) {
                    switch (a.componentType) {
                        case ECS.Components.SpriteDirection:
                            let direction = a as ECS.SpriteDirection;
                            (e as any).isLookingRight = direction.isLookingRight
                            break;

                        case ECS.Components.Position:
                            let position = a as ECS.Position;
                            e.position = position.position
                            break;

                        case ECS.Components.EntityState:
                            let state = a as ECS.EntityState;
                            e.currentEntityState = state.currentState
                            break;
                    }
                }
            }
        }
    }
}

interface AnimalBehavior {
    isRunningAnimation: boolean
    entityDisplay: string | null
    onIdle(): Promise<void>
    onDead(): Promise<void>
    onRun(): Promise<void>
}

interface PlantBehavior {
    isRunningAnimation: boolean
    entityDisplay: string | null
    onIdle(): Promise<void>
    onDead(): Promise<void>
    onWindLeft(): Promise<void>
    onWindRight(): Promise<void>
}

interface GraphicEntity {
    isRunningAnimation: boolean
    stateBuffer: ECS.EntityStates | null
    position: Utils.Vector2 | null
    ecsEntityUid: number
    depth: number
    displayState: string | null
    currentEntityState: ECS.EntityStates
    behavior: PlantBehavior | AnimalBehavior
}

export class GraphicFox implements GraphicEntity {
    isRunningAnimation: boolean
    stateBuffer: ECS.EntityStates | null
    isLookingRight: boolean
    position: Utils.Vector2 | null
    ecsEntityUid: number
    depth: number
    displayState: string | null
    currentEntityState: ECS.EntityStates
    behavior: PlantBehavior | AnimalBehavior

    constructor(newPosition: Utils.Vector2, newEcsEntityUid: number) {
        this.isLookingRight = true
        this.isRunningAnimation = false
        this.stateBuffer = null
        this.position = newPosition
        this.ecsEntityUid = newEcsEntityUid
        this.depth = 2
        this.displayState = ""
        //this.displayState = "#"
        this.currentEntityState = ECS.EntityStates.Idle
        this.behavior = new FoxBehavior(this.displayState, this.isRunningAnimation, this.isLookingRight)
    }
}
export class GraphicGrass implements GraphicEntity {
    isRunningAnimation: boolean
    stateBuffer: ECS.EntityStates | null
    position: Utils.Vector2 | null
    ecsEntityUid: number
    depth: number
    displayState: string | null
    currentEntityState: ECS.EntityStates
    behavior: PlantBehavior | AnimalBehavior

    constructor(newEcsEntityUid: number) {
        this.isRunningAnimation = false
        this.stateBuffer = null
        this.position = null
        this.ecsEntityUid = newEcsEntityUid
        this.depth = 0
        this.displayState = ""
        this.currentEntityState = ECS.EntityStates.Idle
        this.behavior = new GrassBehavior(this.displayState, this.isRunningAnimation)
    }
}
export class GrassBehavior implements PlantBehavior {
    isRunningAnimation: boolean
    entityDisplay: string | null


    constructor(newEntityDisplay: string | null, newIsRunningAnimation: boolean) {
        this.isRunningAnimation = newIsRunningAnimation
        this.entityDisplay = newEntityDisplay
    }

    async onIdle(): Promise<void> {
        this.isRunningAnimation = true
        //        if (this.isLookingRight) {
        //            this.entityDisplay = ""
        //        }
        //        else {
        //            this.entityDisplay = "L"
        //        }
        this.isRunningAnimation = false
    }
    async onDead(): Promise<void> {
        this.isRunningAnimation = true
        this.entityDisplay = ""
        this.isRunningAnimation = false
    }
    async onWindLeft(): Promise<void> {
        this.isRunningAnimation = true
        this.entityDisplay = "R"
        this.isRunningAnimation = false
    }
    async onWindRight(): Promise<void> {
        this.isRunningAnimation = true
        this.entityDisplay = "R"
        this.isRunningAnimation = false
    }
}
export class FoxBehavior implements AnimalBehavior {
    isRunningAnimation: boolean
    isLookingRight: boolean
    entityDisplay: string | null


    constructor(newEntityDisplay: string | null, newIsRunningAnimation: boolean, newIsLookingRight: boolean) {
        this.isLookingRight = newIsLookingRight
        this.isRunningAnimation = newIsRunningAnimation
        this.entityDisplay = newEntityDisplay
    }

    async onIdle(): Promise<void> {
        this.isRunningAnimation = true
        if (this.isLookingRight) {
            this.entityDisplay = ""
        }
        else {
            this.entityDisplay = "L"
        }
        this.isRunningAnimation = false
    }
    async onDead(): Promise<void> {
        this.isRunningAnimation = true
        this.entityDisplay = ""
        this.isRunningAnimation = false
    }
    async onRun(): Promise<void> {
        this.isRunningAnimation = true
        this.entityDisplay = "R"
        this.isRunningAnimation = false
    }
}


export class GraphicEngine {
    static graphicEntities: GraphicEntity[] = []

    viewSize: Utils.Vector2
    emptyView: string[][][]

    constructor(newViewSize: Utils.Vector2) {

        this.viewSize = newViewSize
        this.emptyView = []

        for (var i = 0; i < 3; i++) {
            this.emptyView[i] = []
            for (var x = 0; x < this.viewSize.x; x++) {
                this.emptyView[i][x] = []
                for (var y = 0; y < this.viewSize.y; y++) {
                    this.emptyView[i][x][y] = "" // Fill with space
                }
            }
        }
    }

    render() {
        this.bufferSync()
        let world: string[][][] = JSON.parse(JSON.stringify(this.emptyView))

        for (var e of GraphicEngine.graphicEntities) {
            if (e.displayState == null || e.position == null) {
                continue;
            }

            if (e.position.x > 9 || e.position.y > 9 ||
                e.position.x < 0 || e.position.y < 0
            ) {
                continue
            }

            world[e.depth][e.position.y][e.position.x] = e.displayState;
        }



        for (var zI = 0; zI < 3; zI++) {                                     //  [..]
            for (var colI = 0; colI < this.viewSize.y; colI++) {
                let rowElement = document.getElementById("p-" + zI + "-" + colI)!  //  [..]
                rowElement.innerHTML = ""
                let tempRow = world[zI][colI].join("")
                rowElement.innerHTML = tempRow
                rowElement.innerHTML += "<br>"
            }
        }
    }


    bufferSync() {
        for (var e of GraphicEngine.graphicEntities) {
            switch (e.stateBuffer) {
                case ECS.EntityStates.Idle:
                    if (!e.isRunningAnimation) {
                        e.currentEntityState = e.stateBuffer
                        e.stateBuffer = null
                    }
                    break;
                case ECS.EntityStates.Dead:
                    e.currentEntityState = e.stateBuffer
                    e.stateBuffer = null
                    break;
                case ECS.EntityStates.Running:
                    e.currentEntityState = e.stateBuffer
                    e.stateBuffer = null
                    break;
                case ECS.EntityStates.WindLeft:
                    if (!e.isRunningAnimation) {
                        e.currentEntityState = e.stateBuffer
                        e.stateBuffer = null
                    }
                    break;
                case ECS.EntityStates.WindRight:
                    if (!e.isRunningAnimation) {
                        e.currentEntityState = e.stateBuffer
                        e.stateBuffer = null
                    }
                    break;
            }

            switch (e.currentEntityState) {
                case ECS.EntityStates.Dead:
                    (e.behavior as any).onDead()
                    break;
                case ECS.EntityStates.Running:
                    (e.behavior as AnimalBehavior).onRun()
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
