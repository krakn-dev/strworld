import * as Cmds from "./commands.js"
import * as ECS from "./ecs.js"
import * as Comps from "./components.js"

export function randomNumber(max: number) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}

export function property<TObj>(name: keyof TObj) {
    return name;
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
}

export class WorkerOutput {
    propertiesToChange: ECS.PropertyChange[] | null
    componentsToRemove: [number, number][] | null
    componentsToAdd: ECS.Component[] | null
    commandsToRemove: Cmds.Commands[] | null
    commandsToAdd: Cmds.Commands[] | null
    state: Map<string, any> | null = null

    constructor(
        newPropertiesToChange: ECS.PropertyChange[] | null = null,
        newComponentsToRemove: [number, number][] | null = null,
        newComponentsToAdd: ECS.Component[] | null = null,
        newState: Map<string, any> | null = null,
        newCommandsToRemove: Cmds.Commands[] | null = null,
        newCommandsToAdd: Cmds.Commands[] | null = null,
    ) {
        this.state = newState
        this.propertiesToChange = newPropertiesToChange
        this.componentsToRemove = newComponentsToRemove
        this.componentsToAdd = newComponentsToAdd
        this.commandsToRemove = newCommandsToRemove
        this.commandsToAdd = newCommandsToAdd
    }
}

export class WorkerInput {
    state: Map<string, any>
    components: ECS.Component[][]
    commands: Cmds.Commands[]
    constructor(
        newState: Map<string, any>,
        newComponents: ECS.Component[][],
        newCommands: Cmds.Commands[]
    ) {
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
    data: WorkerInput | WorkerOutput | null
    constructor(
        newMessage: Messages,
        newData: WorkerInput | WorkerOutput | null = null
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
