import * as CANNON from "cannon-es"

export const randomNumber = (max: number) => Math.floor(Math.random() * max) + 1;
export const newUid = () => randomNumber(100000000)
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class AssetFetchCache {
    static cachedAssets: Map<string, any> = new Map();
    static async fetch(assetName: string): Promise<any> {
        let asset = this.cachedAssets.get(assetName)
        if (asset == undefined) {
            let fetchedAsset = await (await fetch("assets/" + assetName)).blob()
            this.cachedAssets.set(assetName, fetchedAsset)
            return fetchedAsset
        }
        return asset
    }
}


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
export class Quaternion {
    x: number
    y: number
    z: number
    w: number
    constructor(
        newX: number,
        newY: number,
        newZ: number,
        newW: number
    ) {
        this.x = newX
        this.y = newY
        this.z = newZ
        this.w = newW
    }
}

export function eulerToQuaternion(vector: Vector3): Quaternion {
    return new Quaternion(
        (Math.sin(vector.x / 2) * Math.cos(vector.y / 2) * Math.cos(vector.z / 2)) - (Math.cos(vector.x / 2) * Math.sin(vector.y / 2) * Math.sin(vector.z / 2)),
        (Math.cos(vector.x / 2) * Math.sin(vector.y / 2) * Math.cos(vector.z / 2)) + (Math.sin(vector.x / 2) * Math.cos(vector.y / 2) * Math.sin(vector.z / 2)),
        (Math.cos(vector.x / 2) * Math.cos(vector.y / 2) * Math.sin(vector.z / 2)) - (Math.sin(vector.x / 2) * Math.sin(vector.y / 2) * Math.cos(vector.z / 2)),
        (Math.cos(vector.x / 2) * Math.cos(vector.y / 2) * Math.cos(vector.z / 2)) + (Math.sin(vector.x / 2) * Math.sin(vector.y / 2) * Math.sin(vector.z / 2)),
    )
}
export function addVector3(vectorA: Vector3, vectorB: Vector3): Vector3 {
    return new Vector3(
        vectorA.x + vectorB.x,
        vectorA.y + vectorB.y,
        vectorA.z + vectorB.z)
}
export function toCannonVec3(vector: Vector3): CANNON.Vec3 {
    return new CANNON.Vec3(vector.x, vector.y, vector.z)
}
export function normalize(vector: Vector3): Vector3 {
    let magnitude = Math.hypot(vector.x, vector.y, vector.z)
    return new Vector3(
        vector.x / magnitude,
        vector.y / magnitude,
        vector.z / magnitude)
}
export function crossProduct(vectorA: Vector3, vectorB: Vector3): Vector3 {
    return new Vector3(
        (vectorA.y * vectorB.z) - (vectorA.z * vectorB.y),
        (vectorA.z * vectorB.x) - (vectorA.x * vectorB.z),
        (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x)
    )
}
export function replaceRange(
    str: string,
    start: number,
    end: number,
    substituteCallback: (v: string) => string
) {
    let substitute = substituteCallback(str.substring(start, end))
    return str.substring(0, start) + substitute + str.substring(end);
}
export function degreesToRadians(degrees: number): number {
    return degrees * (3.1416 / 180)
}
