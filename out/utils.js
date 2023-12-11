export function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}
export var Messages;
(function (Messages) {
    Messages[Messages["Update"] = 0] = "Update";
    Messages[Messages["Start"] = 1] = "Start";
    Messages[Messages["Done"] = 2] = "Done";
    Messages[Messages["PlayerInput"] = 3] = "PlayerInput";
    Messages[Messages["DevBoxInput"] = 4] = "DevBoxInput";
    Messages[Messages["RenderIt"] = 5] = "RenderIt";
    Messages[Messages["AddedCommand"] = 6] = "AddedCommand";
    Messages[Messages["RemovedCommand"] = 7] = "RemovedCommand";
    Messages[Messages["Work"] = 8] = "Work";
})(Messages || (Messages = {}));
export class WorkerInfo {
    constructor(newMessagePort, newWorkerId) {
        this.messagePort = newMessagePort;
        this.commands = [];
        this.workerId = newWorkerId;
    }
}
export class DevBox {
    constructor(newIsShadowsEnabled, newIsSetNight, newIsEnablePhysics, newIsEnableFreeCamera) {
        this.isShadowsEnabled = newIsShadowsEnabled;
        this.isSetNight = newIsSetNight;
        this.isEnablePhysics = newIsEnablePhysics;
        this.isEnableFreeCamera = newIsEnableFreeCamera;
    }
}
export var MapPropertyChangeType;
(function (MapPropertyChangeType) {
    MapPropertyChangeType[MapPropertyChangeType["Add"] = 0] = "Add";
    MapPropertyChangeType[MapPropertyChangeType["Remove"] = 1] = "Remove";
})(MapPropertyChangeType || (MapPropertyChangeType = {}));
export class MapEntry {
    constructor(newKey, newValue) {
        this.key = newKey;
        this.value = newValue;
    }
}
export class MapPropertyChange {
    constructor(newComponentType, newIndex, newProperty, newComponentUid, newType, newAddedMapEntry = null, newRemovedMapEntry = null, newIsEmptied = false) {
        this.type = newType;
        this.componentIndex = newIndex;
        this.componentType = newComponentType;
        this.property = newProperty;
        this.addedMapEntry = newAddedMapEntry;
        this.removedMapKey = newRemovedMapEntry;
        this.isEmptied = newIsEmptied;
        this.componentUid = newComponentUid;
    }
}
export class PropertyChange {
    constructor(newComponentType, newIndex, newProperty, newValue, newComponentUid) {
        this.componentIndex = newIndex;
        this.componentType = newComponentType;
        this.property = newProperty;
        this.value = newValue;
        this.componentUid = newComponentUid;
    }
}
export class ComponentDiffs {
    constructor() {
        this.changedComponents = [];
        this.removedComponents = [];
        this.addedComponents = [];
    }
}
export class RemovedComponent {
    constructor(newComponentType, newComponentIndex, newComponentUid) {
        this.componentType = newComponentType;
        this.componentIndex = newComponentIndex;
        this.componentUid = newComponentUid;
    }
}
export class CommandChange {
    constructor(newWorkerReceiver, newCommandType) {
        this.workerReceiver = newWorkerReceiver;
        this.commandType = newCommandType;
    }
}
// w# sends to w0
export class Diffs {
    constructor(newChangedProperties, newRemovedComponents, newAddedComponents, newRemovedCommands, newAddedCommands) {
        this.changedProperties = newChangedProperties;
        this.removedComponents = newRemovedComponents;
        this.addedComponents = newAddedComponents;
        this.removedCommands = newRemovedCommands;
        this.addedCommands = newAddedCommands;
    }
}
export class GraphicDiff {
    constructor(newChangedComputedElements = [], newAddedComputedElements = [], newRemovedComputedElements = []) {
        this.changedComputedElements = newChangedComputedElements;
        this.addedComputedElements = newAddedComputedElements;
        this.removedComputedElements = newRemovedComputedElements;
    }
}
export class Input {
    constructor(newMovementDirection) {
        this.movementDirection = newMovementDirection;
    }
}
export class WorkerInitializationData {
    constructor(newYourWorkerId, newWorkers) {
        this.workerIds = newWorkers;
        this.yourWorkerId = newYourWorkerId;
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
export class Vector2 {
    constructor(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}
export class Vector3 {
    constructor(newX, newY, newZ) {
        this.x = newX;
        this.y = newY;
        this.z = newZ;
    }
}
