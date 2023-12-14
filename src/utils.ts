import * as Cmds from "./commands.js"
import * as ECS from "./ecs.js"
import * as Comps from "./components.js"

export function randomNumber(max: number) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}



export enum Messages {
    Update,   // make worker work with provided data
    Start,    // initialize w0
    Done,     // returned when worker finished job

    PlayerInput,
    DevBoxInput,

    RenderIt,
    AddedCommand,
    RemovedCommand,
    Work,
}

export class WorkerInfo {
    messagePort: MessagePort | Worker | null
    commands: Cmds.Commands[]
    workerId: number
    constructor(
        newMessagePort: MessagePort | Worker | null,
        newWorkerId: number
    ) {
        this.messagePort = newMessagePort
        this.commands = []
        this.workerId = newWorkerId
    }
}

export class DevBox {
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
export enum MapPropertyChangeType {
    Add,
    Remove,
}
export class MapEntry {
    key: any
    value: any
    constructor(
        newKey: any,
        newValue: any
    ) {
        this.key = newKey
        this.value = newValue
    }
}
export class MapPropertyChange {
    type: MapPropertyChangeType
    property: string
    componentUid: number

    // to index
    componentIndex: number
    componentType: Comps.Components

    // map changes
    addedMapEntry: MapEntry | null
    removedMapKey: any | null
    isEmptied: boolean
    constructor(
        newComponentType: Comps.Components,
        newIndex: number,
        newProperty: string,
        newComponentUid: number,
        newType: MapPropertyChangeType,
        newAddedMapEntry: MapEntry | null = null,
        newRemovedMapEntry: any | null = null,
        newIsEmptied: boolean = false
    ) {
        this.type = newType
        this.componentIndex = newIndex
        this.componentType = newComponentType
        this.property = newProperty
        this.addedMapEntry = newAddedMapEntry
        this.removedMapKey = newRemovedMapEntry
        this.isEmptied = newIsEmptied
        this.componentUid = newComponentUid
    }
}

export class PropertyChange {
    componentIndex: number
    property: string
    value: any
    componentUid: number
    componentType: Comps.Components
    constructor(
        newComponentType: Comps.Components,
        newIndex: number,
        newProperty: string,
        newValue: any,
        newComponentUid: number,
    ) {
        this.componentIndex = newIndex
        this.componentType = newComponentType
        this.property = newProperty
        this.value = newValue
        this.componentUid = newComponentUid
    }
}

export class ComponentDiffs {
    changedComponents: ECS.ComponentAndIndex[]
    removedComponents: ECS.ComponentAndIndex[]
    addedComponents: ECS.ComponentAndIndex[]
    constructor() {
        this.changedComponents = []
        this.removedComponents = []
        this.addedComponents = []
    }
}

export class RemovedComponent {
    componentType: Comps.Components
    componentIndex: number
    componentUid: number
    constructor(
        newComponentType: Comps.Components,
        newComponentIndex: number,
        newComponentUid: number
    ) {
        this.componentType = newComponentType
        this.componentIndex = newComponentIndex
        this.componentUid = newComponentUid
    }
}

export class CommandChange {
    workerReceiver: number
    commandType: Cmds.Commands
    constructor(
        newWorkerReceiver: number,
        newCommandType: Cmds.Commands
    ) {
        this.workerReceiver = newWorkerReceiver
        this.commandType = newCommandType
    }
}
// w# sends to w0
export class Diffs {
    changedProperties: (PropertyChange | MapPropertyChange)[]
    removedComponents: RemovedComponent[]
    addedComponents: ECS.Component[]
    removedCommands: CommandChange[]
    addedCommands: CommandChange[]
    constructor(
        newChangedProperties: (PropertyChange | MapPropertyChange)[],
        newRemovedComponents: RemovedComponent[],
        newAddedComponents: ECS.Component[],
        newRemovedCommands: CommandChange[],
        newAddedCommands: CommandChange[],
    ) {
        this.changedProperties = newChangedProperties
        this.removedComponents = newRemovedComponents
        this.addedComponents = newAddedComponents
        this.removedCommands = newRemovedCommands
        this.addedCommands = newAddedCommands
    }
}

export class GraphicDiff {
    // everything is a computed element
    changedComputedElements: ECS.ComponentAndIndex[]
    addedComputedElements: ECS.ComponentAndIndex[]
    removedComputedElements: ECS.ComponentAndIndex[]
    constructor(
        newChangedComputedElements: ECS.ComponentAndIndex[] = [],
        newAddedComputedElements: ECS.ComponentAndIndex[] = [],
        newRemovedComputedElements: ECS.ComponentAndIndex[] = []
    ) {
        this.changedComputedElements = newChangedComputedElements
        this.addedComputedElements = newAddedComputedElements
        this.removedComputedElements = newRemovedComputedElements
    }
}

export class Input {
    movementDirection: Vector2
    constructor(
        newMovementDirection: Vector2
    ) {
        this.movementDirection = newMovementDirection
    }
}

export interface IIndexable {
    [key: string]: any;
}

export class WorkerInitializationData {
    yourWorkerId: number
    workerIds: number[]
    constructor(
        newYourWorkerId: number,
        newWorkers: number[]
    ) {
        this.workerIds = newWorkers
        this.yourWorkerId = newYourWorkerId
    }
}

export class Message {
    message: Messages
    data: Diffs | DevBox | WorkerInitializationData | Input | GraphicDiff | number | null
    constructor(
        newMessage: Messages,
        newData: Diffs | DevBox | WorkerInitializationData | Input | number | GraphicDiff | null = null
    ) {
        this.message = newMessage
        this.data = newData
    }
}
export function divideList(arr: any[], n: number) {
    var rest = arr.length % n, // how much to divide
        restUsed = rest, // to keep track of the division over the elements
        partLength = Math.floor(arr.length / n),
        result = [];

    for (var i = 0; i < arr.length; i += partLength) {
        var end = partLength + i,
            add = false;

        if (rest !== 0 && restUsed) { // should add one element for the division
            end++;
            restUsed--; // we've used one division element now
            add = true;
        }

        result.push(arr.slice(i, end)); // part of the array

        if (add) {
            i++; // also increment i in the case we added an extra element for division
        }
    }

    return result;
}

export const CHANGES_KEY = "_c"

export function delay(delay: number) {
    return new Promise((resolve, _) => {
        setTimeout(resolve, delay);
    });
};

export class Vector2 {
    x: number
    y: number
    constructor(
        newX: number,
        newY: number
    ) {
        this.x = newX
        this.y = newY
    }
}
export class Vector3 {
    x: number
    y: number
    z: number
    constructor(
        newX: number,
        newY: number,
        newZ: number
    ) {
        this.x = newX
        this.y = newY
        this.z = newZ
    }
}
