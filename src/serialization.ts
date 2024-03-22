import * as Utils from "./utils"
import * as ECS from "./ecs/ecs"
import * as Comps from "./ecs/components"

export class Scroll {
    scrollLeft: number
    scrollTop: number
    constructor(
        newScrollLeft: number,
        newScrollTop: number
    ) {
        this.scrollTop = newScrollTop
        this.scrollLeft = newScrollLeft
    }
}
export class CodeError {
    isRuntimeError: boolean
    description: string
    lineNumber: number | undefined
    constructor(
        newIsRuntimeError: boolean,
        newDescription: string,
        newLineNumber: number | undefined = undefined
    ) {
        this.isRuntimeError = newIsRuntimeError
        this.description = newDescription
        this.lineNumber = newLineNumber
    }
}
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
export enum Keys {
    W, A, S, D, Up, Left, Down, Right, Space,
}
export class Input {
    changedKey: Keys
    isKeyDown: boolean
    constructor(
        newChangedKey: Keys,
        newIsKeyDown: boolean
    ) {
        this.changedKey = newChangedKey
        this.isKeyDown = newIsKeyDown
    }
}

export class GraphicChanges {
    changedComponents: ECS.Component[]
    addedComponents: ECS.Component[]
    addedEntitiesUid: number[]
    removedEntitiesUid: number[]
    constructor() {
        this.changedComponents = []
        this.addedComponents = []
        this.addedEntitiesUid = []
        this.removedEntitiesUid = []
    }
}
export class AvailableRobotComponents {
    robotComponentTypes: Comps.RobotComponentTypes[]
    quantity: number[]
    constructor(
        newComponents: Comps.RobotComponentTypes[],
        newQuantity: number[],
    ) {
        this.robotComponentTypes = newComponents
        this.quantity = newQuantity
    }
}
export enum Messages {
    Start,
    Input,
    Options,
    GraphicChanges,
    GetAvailableRobotComponents,
    AvailableRobotComponents,
    RefreshGraphics,
    Stop,
    Continue,
    UpdateAvailableComponents,
    RobotComponents
}

export class Message {
    message: Messages
    data: Input | Comps.RobotComponent[] | AvailableRobotComponents | DOMData | GraphicChanges | Options | null
    constructor(
        newMessage: Messages,
        newData: Input | Comps.RobotComponent[] | AvailableRobotComponents | GraphicChanges | Options | DOMData | null = null
    ) {
        this.message = newMessage
        this.data = newData
    }
}
