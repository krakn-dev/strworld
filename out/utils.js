export function randomNumber(max) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}
export function reverseCopyArray(input) {
    var ret = new Array;
    for (var i = input.length - 1; i >= 0; i--) {
        ret.push(input[i]);
    }
    return ret;
}
export class Vector2 {
    constructor(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}
