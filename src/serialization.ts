import * as Utils from "./utils"
import * as ECS from "./ecs/ecs"
import * as Comps from "./ecs/components"
import * as Mat from "./math"

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
export enum Buttons {
    E, W, A, S, D, Up, Left, Down, Right, Space, RightClick,
    LMB, RMB
}
export class ButtonPress {
    changedButton: Buttons
    isButtonDown: boolean
    constructor(
        newChangedButton: Buttons,
        newIsButtonDown: boolean
    ) {
        this.changedButton = newChangedButton
        this.isButtonDown = newIsButtonDown
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
    ButtonPress,
    MouseMovement,
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
    data: Mat.Vector2 | ButtonPress | [ECS.Component[][], [number, number[]][]] | AvailableRobotComponents | DOMData | GraphicChanges | Options | null
    constructor(
        newMessage: Messages,
        newData: Mat.Vector2 | ButtonPress | [ECS.Component[][], [number, number[]][]] | AvailableRobotComponents | GraphicChanges | Options | DOMData | null = null
    ) {
        this.message = newMessage
        this.data = newData
    }
}
