import * as Cmds from "./commands.js";
import * as Comps from "./components.js";
export function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}
export function property(name) {
    return name;
}
export const NUMBER_OF_COMPONENTS = (() => {
    let n = 0;
    for (let i = 0; i < Object.keys(Comps.Components).length / 2; i++) {
        n++;
    }
    return n;
})();
export const NUMBER_OF_COMMANDS = (() => {
    let n = 0;
    for (let i = 0; i < Object.keys(Cmds.Commands).length / 2; i++) {
        n++;
    }
    return n;
})();
export var Messages;
(function (Messages) {
    Messages[Messages["Work"] = 0] = "Work";
    Messages[Messages["Start"] = 1] = "Start";
    Messages[Messages["Done"] = 2] = "Done";
    Messages[Messages["AreYouReadyKids"] = 3] = "AreYouReadyKids";
    // if workers are ready to do work
    Messages[Messages["AyeAyeCaptain"] = 4] = "AyeAyeCaptain";
    // means that they able to do work
})(Messages || (Messages = {}));
export class WorkerOutput {
    constructor(newPropertiesToChange = null, newComponentsToRemove = null, newComponentsToAdd = null, newState = null, newCommandsToRemove = null, newCommandsToAdd = null) {
        this.state = null;
        this.state = newState;
        this.propertiesToChange = newPropertiesToChange;
        this.componentsToRemove = newComponentsToRemove;
        this.componentsToAdd = newComponentsToAdd;
        this.commandsToRemove = newCommandsToRemove;
        this.commandsToAdd = newCommandsToAdd;
    }
}
export class WorkerInput {
    constructor(newState, newComponents, newCommands) {
        this.state = newState;
        this.commands = newCommands;
        this.components = newComponents;
    }
}
export class Message {
    constructor(newMessage, newData = null) {
        this.message = newMessage;
        this.data = newData;
    }
}
export function divideList(arr, n) {
    var rest = arr.length % n, // how much to divide
    restUsed = rest, // to keep track of the division over the elements
    partLength = Math.floor(arr.length / n), result = [];
    for (var i = 0; i < arr.length; i += partLength) {
        var end = partLength + i, add = false;
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
export const CHANGES_KEY = "_c";
export function delay(delay) {
    return new Promise((resolve, _) => {
        setTimeout(resolve, delay);
    });
}
;
