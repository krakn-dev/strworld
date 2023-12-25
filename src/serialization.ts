import * as Utils from "./utils"
import * as Comps from "./components"

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
export class Input {
    movementDirection: Utils.Vector2
    constructor(
        newMovementDirection: Utils.Vector2,
    ) {
        this.movementDirection = newMovementDirection
    }
}

export class GraphicChanges {
    changedGraphicProperties: Comps.ChangedGraphicProperties[]
    addedGraphicProperties: Comps.ChangedGraphicProperties[]
    removedGraphicProperties: Comps.ChangedGraphicProperties[]
    constructor() {
        this.changedGraphicProperties = []
        this.addedGraphicProperties = []
        this.removedGraphicProperties = []
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
    data: Input | GraphicChanges | Options | null
    constructor(
        newMessage: Messages,
        newData: Input | GraphicChanges | Options | null = null
    ) {
        this.message = newMessage
        this.data = newData
    }
}
