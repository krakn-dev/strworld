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

    RenderIt,
    AddedCommand,
    RemovedCommand,
    Work,
}

export class WorkerInfo {
    messagePort: MessagePort
    commands: Cmds.Commands[]
    workerId: number
    constructor(
        newMessagePort: MessagePort,
        newWorkerId: number
    ) {
        this.messagePort = newMessagePort
        this.commands = []
        this.workerId = newWorkerId
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

export class RemovedComponent {
    type: Comps.Components
    index: number
    componentUid: number
    constructor(
        newType: Comps.Components,
        newIndex: number,
        newComponentUid: number
    ) {
        this.type = newType
        this.index = newIndex
        this.componentUid = newComponentUid
    }
}

// w# sends to w0
export class DiffsOut {
    changedProperties: PropertyChange[]
    removedComponents: RemovedComponent[]
    addedComponents: ECS.Component[]
    removedCommands: Cmds.Commands[]
    addedCommands: Cmds.Commands[]
    workerId: number
    constructor(
        newChangedProperties: PropertyChange[],
        newRemovedComponents: RemovedComponent[],
        newAddedComponents: ECS.Component[],
        newRemovedCommands: Cmds.Commands[],
        newAddedCommands: Cmds.Commands[],
        newWorkerId: number
    ) {
        this.changedProperties = newChangedProperties
        this.removedComponents = newRemovedComponents
        this.addedComponents = newAddedComponents
        this.removedCommands = newRemovedCommands
        this.addedCommands = newAddedCommands
        this.workerId = newWorkerId
    }
}
// w0 sends to w#
export class WorkerInput {
    changedProperties: PropertyChange[]
    removedComponents: RemovedComponent[]
    addedComponents: ECS.Component[]
    input: Input
    constructor(
        newChangedProperties: PropertyChange[],
        newRemovedComponents: RemovedComponent[],
        newAddedComponents: ECS.Component[],
        newInput: Input,
    ) {
        this.input = newInput
        this.changedProperties = newChangedProperties
        this.removedComponents = newRemovedComponents
        this.addedComponents = newAddedComponents
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

export class Message {
    message: Messages
    data: DiffsOut | Cmds.Commands | WorkerInput | WorkerInfo[] | Input | GraphicDiff | number | null
    constructor(
        newMessage: Messages,
        newData: DiffsOut | Cmds.Commands | WorkerInput | WorkerInfo[] | Input | number | GraphicDiff | null = null
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
