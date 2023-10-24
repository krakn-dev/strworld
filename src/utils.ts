import * as Cmds from "./commands.js"
import * as ECS from "./ecs.js"
import * as Comps from "./components.js"

export function randomNumber(max: number) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}


export const NUMBER_OF_COMPONENTS = (() => { // fill component list with the number of component types
    let n: number = 0
    for (let i = 0; i < Object.keys(Comps.Components).length / 2; i++) {
        n++
    }
    return n
})()

export const NUMBER_OF_COMMANDS = (() => { // fill component list with the number of component types
    let n: number = 0
    for (let i = 0; i < Object.keys(Cmds.Commands).length / 2; i++) {
        n++
    }
    return n
})()

export enum Messages {
    Work,     // make worker work with provided data
    Start,    // initialize worker manager
    Done,     // returned when worker finished job

    AreYouReadyKids, // manager worker asks
    // if workers are ready to do work

    AyeAyeCaptain,   // response from workers
    // means that they able to do work
    WakeUp,

    BdsabasdmbswhaWhat,

    PlayerInput,

    RenderIt,
}

export class WorkerInfo {
    messagePort: MessagePort
    isProcessing: boolean
    uid: number
    constructor(
        newMessagePort: MessagePort,
        newUid: number
    ) {
        this.isProcessing = false
        this.messagePort = newMessagePort
        this.uid = newUid
    }

}


export class GraphicDiff {
    changedComputedElements: Comps.ComputedElement[]
    addedComputedElements: Comps.ComputedElement[]
    removedComputedElements: Comps.ComputedElement[]
    constructor(
        newChangedComputedElements: Comps.ComputedElement[] = [],
        newAddedComputedElements: Comps.ComputedElement[] = [],
        newRemovedComputedElements: Comps.ComputedElement[] = []
    ) {
        this.changedComputedElements = newChangedComputedElements
        this.addedComputedElements = newAddedComputedElements
        this.removedComputedElements = newRemovedComputedElements
    }
}

export class WorkerOutput {
    propertiesToChange: ECS.PropertyChange[]
    componentsToRemove: [number, number][]
    componentsToAdd: ECS.Component[]
    commandsToRemove: Cmds.Commands[]
    commandsToAdd: Cmds.Commands[]
    state: Map<string, any>
    workerUid: number

    constructor(
        newPropertiesToChange: ECS.PropertyChange[],
        newComponentsToRemove: [number, number][],
        newComponentsToAdd: ECS.Component[],
        newState: Map<string, any>,
        newCommandsToRemove: Cmds.Commands[],
        newCommandsToAdd: Cmds.Commands[],
        newWorkerUid: number
    ) {
        this.state = newState
        this.propertiesToChange = newPropertiesToChange
        this.componentsToRemove = newComponentsToRemove
        this.componentsToAdd = newComponentsToAdd
        this.commandsToRemove = newCommandsToRemove
        this.commandsToAdd = newCommandsToAdd
        this.workerUid = newWorkerUid
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

export class WorkerUids {
    w0Uid: number
    w1Uid: number
    w2Uid: number
    constructor() {
        this.w0Uid = newUid()
        this.w1Uid = newUid()
        this.w2Uid = newUid()
    }
}

export class WorkerInput {
    state: Map<string, any>
    components: ECS.Component[][]
    commands: Cmds.Commands[]
    input: Input
    constructor(
        newState: Map<string, any>,
        newComponents: ECS.Component[][],
        newCommands: Cmds.Commands[],
        newInput: Input,
    ) {
        this.input = newInput
        this.state = newState
        this.commands = newCommands
        this.components = newComponents
    }
}

export interface IIndexable {
    [key: string]: any;
}

export class Message {
    message: Messages
    data: WorkerInput | WorkerOutput | WorkerUids | Input | GraphicDiff | number | null
    constructor(
        newMessage: Messages,
        newData: WorkerInput | WorkerOutput | WorkerUids | Input | number | GraphicDiff | null = null
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
