export function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}
//export async function delay(ms: number): Promise<void> { return new Promise(res => setTimeout(res, ms)) }
export class Str {
    constructor(newStr) {
        this.str = newStr;
    }
}
export class Bool {
    constructor(newBool) {
        this.bool = newBool;
    }
}
export function canRun(queriedComponents, foundComponents) {
    //    for (let qCI = 0; qCI < queriedComponents.length; qCI++) {
    //        if (foundComponents.length != foundComponents.length) {
    //            console.log("found and queried components mismatch -> ", queriedComponents.length, " and ", foundComponents.length, "\n")
    //            console.log("q -> ", queriedComponents, " f -> ", foundComponents)
    //            return false
    //        }
    //    }
    for (let [fCLI, fCL] of foundComponents.entries()) {
        if (fCL.length == 0) {
            console.log("components are missing to run this command. Missing component -> ", queriedComponents[fCLI]);
            return false;
        }
    }
    return true;
}
export const delay = (delay) => {
    let timeout = 0;
    let _resolve;
    const promise = new Promise((resolve, _) => {
        _resolve = resolve;
        timeout = setTimeout(resolve, delay);
    });
    return {
        promise,
        cancel() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
                if (_resolve)
                    _resolve(null);
            }
        }
    };
};
export function reverseCopyArray(input) {
    var ret = new Array;
    for (var i = input.length - 1; i >= 0; i--) {
        ret.push(input[i]);
    }
    return ret;
}
export class Vector3 {
    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    set x(newX) {
        this.isChanged.bool = true;
        this._x = newX;
    }
    set y(newY) {
        this.isChanged.bool = true;
        this._y = newY;
    }
    set z(newZ) {
        this.isChanged.bool = true;
        this._z = newZ;
    }
    constructor(newX, newY, newZ) {
        this.isChanged = new Bool(true);
        this._x = newX;
        this._y = newY;
        this._z = newZ;
    }
    sum(rightHand) {
        let result = new Vector3(this._x, this._y, this._z);
        if (typeof rightHand == "number") {
            result.x += rightHand;
            result.y += rightHand;
            result.z += rightHand;
        }
        else {
            result.x += rightHand.x;
            result.y += rightHand.y;
            result.z += rightHand.z;
        }
        return result;
    }
    substract(rightHand) {
        let result = new Vector3(this._x, this._y, this._z);
        if (typeof rightHand == "number") {
            result.x -= rightHand;
            result.y -= rightHand;
            result.z -= rightHand;
        }
        else {
            result.x -= rightHand.x;
            result.y -= rightHand.y;
            result.z -= rightHand.z;
        }
        return result;
    }
    normalize() {
        let result = new Vector3(this._x, this._y, this._z);
        let hypotenuse = Math.hypot(result.x, result.y, result.z);
        result.x /= hypotenuse;
        result.y /= hypotenuse;
        result.z /= hypotenuse;
        return result;
    }
    multiply(rightHand) {
        let result = new Vector3(this._x, this._y, this._z);
        if (typeof rightHand == "number") {
            result.x *= rightHand;
            result.y *= rightHand;
            result.z *= rightHand;
        }
        else {
            result.x *= rightHand.x;
            result.y *= rightHand.y;
            result.z *= rightHand.z;
        }
        return result;
    }
    divide(rightHand) {
        let result = new Vector3(this._x, this._y, this._z);
        if (typeof rightHand == "number") {
            result.x /= rightHand;
            result.y /= rightHand;
            result.z /= rightHand;
        }
        else {
            result.x /= rightHand.x;
            result.y /= rightHand.y;
            result.z /= rightHand.z;
        }
        return result;
    }
    assign(newVector) {
        this.x = newVector.x;
        this.y = newVector.y;
        this.z = newVector.z;
    }
}
export class Vector2 {
    get x() { return this._x; }
    get y() { return this._y; }
    set x(newX) {
        this.isChanged.bool = true;
        this._x = newX;
    }
    set y(newY) {
        this.isChanged.bool = true;
        this._y = newY;
    }
    constructor(newX, newY) {
        this._x = newX;
        this._y = newY;
        this.isChanged = new Bool(true);
    }
    sum(rightHand) {
        let result = new Vector2(this._x, this._y);
        if (typeof rightHand == "number") {
            result.x += rightHand;
            result.y += rightHand;
        }
        else {
            result.x += rightHand.x;
            result.y += rightHand.y;
        }
        return result;
    }
    substract(rightHand) {
        let result = new Vector2(this._x, this._y);
        if (typeof rightHand == "number") {
            result.x -= rightHand;
            result.y -= rightHand;
        }
        else {
            result.x -= rightHand.x;
            result.y -= rightHand.y;
        }
        return result;
    }
    normalize() {
        let result = new Vector2(this._x, this._y);
        let hypotenuse = Math.hypot(result.x, result.y);
        result.x /= hypotenuse;
        result.y /= hypotenuse;
        return result;
    }
    multiply(rightHand) {
        let result = new Vector2(this._x, this._y);
        if (typeof rightHand == "number") {
            result.x *= rightHand;
            result.y *= rightHand;
        }
        else {
            result.x *= rightHand.x;
            result.y *= rightHand.y;
        }
        return result;
    }
    divide(rightHand) {
        let result = new Vector2(this._x, this._y);
        if (typeof rightHand == "number") {
            result.x /= rightHand;
            result.y /= rightHand;
        }
        else {
            result.x /= rightHand.x;
            result.y /= rightHand.y;
        }
        return result;
    }
    assign(newVector) {
        this.x = newVector.x;
        this.y = newVector.y;
    }
}
