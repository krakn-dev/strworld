import * as Utils from "./utils"
import * as ECS from "./ecs/ecs"

export class DOMData {
    windowWidth: number
    windowHeight: number
    constructor(
        newWindowWidth: number,
        newWindowHeight: number
    ) {
        this.windowWidth = newWindowWidth
        this.windowHeight = newWindowHeight
    }
}
export class Options {
    isShadowsEnabled: boolean
    isSetNight: boolean
    isEnablePhysics: boolean
    isEnableFreeCamera: boolean
    constructor(
        newIsShadowsEnabled: boolean,
        newIsSetNight: boolean,
        newIsEnablePhysics: boolean,
        newIsEnableFreeCamera: boolean
    ) {
        this.isShadowsEnabled = newIsShadowsEnabled
        this.isSetNight = newIsSetNight
        this.isEnablePhysics = newIsEnablePhysics
        this.isEnableFreeCamera = newIsEnableFreeCamera
    }
}
//export class CodeResult {
//    
//}
//export class Code {
//    submitedCode: string
//    modifiedCode: string 
//}
export class Input {
    movementDirection: Utils.Vector2
    code: string | undefined
    constructor(
        newMovementDirection: Utils.Vector2,
        newCode: string | undefined
    ) {
        this.movementDirection = newMovementDirection
        this.code = newCode
    }
}

export class GraphicChanges {
    changedComponents: ECS.Component[]
    addedEntitiesUid: number[]
    removedEntitiesUid: number[]
    constructor() {
        this.changedComponents = []
        this.addedEntitiesUid = []
        this.removedEntitiesUid = []
    }
}

export enum Messages {
    Start,
    Input,
    Options,
    GraphicChanges,
}
export class Message {
    message: Messages
    data: Input | DOMData | GraphicChanges | Options | null
    constructor(
        newMessage: Messages,
        newData: Input | GraphicChanges | Options | DOMData | null = null
    ) {
        this.message = newMessage
        this.data = newData
    }
}
