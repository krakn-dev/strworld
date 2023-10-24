export function randomNumber(max: number) {
    return Math.floor(Math.random() * max) + 1;
}
export function newUid() {
    return randomNumber(100000000);
}
//export async function delay(ms: number): Promise<void> { return new Promise(res => setTimeout(res, ms)) }


export const delay = (delay: number) => {
    let timeout: number | null = 0;
    let _resolve: null | ((reason: any | null) => void);

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


export function reverseCopyArray(input: any) {
    var ret = new Array;
    for (var i = input.length - 1; i >= 0; i--) {
        ret.push(input[i]);
    }
    return ret;
}
export class Vector2 {
    x: number
    y: number
    constructor(newX: number, newY: number) {
        this.x = newX
        this.y = newY
    }
}
