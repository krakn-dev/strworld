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

//////////////
// Quaternion
//////////////
export function copyQuaternion(quaternion: Quaternion): Quaternion {
    return new Quaternion(
        quaternion.x,
        quaternion.y,
        quaternion.z,
        quaternion.w)
}
export function multiplyQuaternion(a: Quaternion, b: Quaternion): Quaternion {
    return new Quaternion(
        a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        a.w * b.y + a.y * b.w + a.z * b.x - a.x * b.z,
        a.w * b.z + a.z * b.w + a.x * b.y - a.y * b.x,
        a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z)
}
//////////////
// Vector2
//////////////
export function copyVector2(vector: Vector2): Vector2 {
    return new Vector2(
        vector.x,
        vector.y)
}
export function addVector2(vectorA: Vector2, vectorB: Vector2): Vector2 {
    return new Vector2(
        vectorA.x + vectorB.x,
        vectorA.y + vectorB.y)
}
export function substractVector2(vectorA: Vector2, vectorB: Vector2): Vector2 {
    return new Vector2(
        vectorA.x - vectorB.x,
        vectorA.y - vectorB.y)
}
export function multiplyVector2(vectorA: Vector2, vectorB: Vector2): Vector2 {
    return new Vector2(
        vectorA.x - vectorB.x,
        vectorA.y - vectorB.y)
}
export function normalizeVector2(vector: Vector2): Vector2 {
    let magnitude = Math.hypot(vector.x, vector.y)
    return new Vector2(
        vector.x / magnitude,
        vector.y / magnitude)
}
//////////////
// Vector3
//////////////
export function copyVector3(vector: Vector3): Vector3 {
    return new Vector3(
        vector.x,
        vector.y,
        vector.z)
}
export function addVector3(vectorA: Vector3, vectorB: Vector3): Vector3 {
    return new Vector3(
        vectorA.x + vectorB.x,
        vectorA.y + vectorB.y,
        vectorA.z + vectorB.z)
}
export function substractVector3(vectorA: Vector3, vectorB: Vector3): Vector3 {
    return new Vector3(
        vectorA.x - vectorB.x,
        vectorA.y - vectorB.y,
        vectorA.z - vectorB.z)
}
export function multiplyVector3(vectorA: Vector3, vectorB: Vector3): Vector3 {
    return new Vector3(
        vectorA.x - vectorB.x,
        vectorA.y - vectorB.y,
        vectorA.z - vectorB.z)
}
export function normalizeVector3(vector: Vector3): Vector3 {
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
        (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x))
}
export function eulerToQuaternion(vector: Vector3): Quaternion {
    let x = vector.x / 2
    let y = vector.y / 2
    let z = vector.z / 2
    return new Quaternion(
        (Math.sin(x) * Math.cos(y) * Math.cos(z)) - (Math.cos(x) * Math.sin(y) * Math.sin(z)),
        (Math.cos(x) * Math.sin(y) * Math.cos(z)) + (Math.sin(x) * Math.cos(y) * Math.sin(z)),
        (Math.cos(x) * Math.cos(y) * Math.sin(z)) - (Math.sin(x) * Math.sin(y) * Math.cos(z)),
        (Math.cos(x) * Math.cos(y) * Math.cos(z)) + (Math.sin(x) * Math.sin(y) * Math.sin(z)))
}
export function deg2rad(degrees: number): number {
    return degrees * (3.1416 / 180)
}
