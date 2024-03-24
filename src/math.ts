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
export function normalizeQuaternion(quaternion: Quaternion): Quaternion {
    let magnitude = Math.hypot(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
    return new Quaternion(
        quaternion.x / magnitude,
        quaternion.y / magnitude,
        quaternion.z / magnitude,
        quaternion.w / magnitude)
}
export function dotProductQuaternion(quaternionA: Quaternion, quaternionB: Quaternion): number {
    return (
        quaternionA.x * quaternionB.x + quaternionA.y *
        quaternionB.y + quaternionA.z * quaternionB.z +
        quaternionA.w * quaternionB.w);
}
export function negateQuaternion(quaternion: Quaternion): Quaternion {
    return new Quaternion(-quaternion.x, -quaternion.y, -quaternion.z, -quaternion.w)
}
export function slerpQuaternion(quaternionA: Quaternion, quaternionB: Quaternion, t: number): Quaternion {
    let l2 = dotProductQuaternion(quaternionA, quaternionB);
    if (l2 < 0) {
        quaternionB = negateQuaternion(quaternionB);
    }
    return new Quaternion(
        quaternionA.x - t * (quaternionA.x - quaternionB.x),
        quaternionA.y - t * (quaternionA.y - quaternionB.y),
        quaternionA.z - t * (quaternionA.z - quaternionB.z),
        quaternionA.w - t * (quaternionA.w - quaternionB.w));
}
export function getForwardFromQuaternion(quaternionA: Quaternion, quaternionB: Quaternion, t: number): Quaternion {
    let l2 = dotProductQuaternion(quaternionA, quaternionB);
    if (l2 < 0) {
        quaternionB = negateQuaternion(quaternionB);
    }
    return new Quaternion(
        quaternionA.x - t * (quaternionA.x - quaternionB.x),
        quaternionA.y - t * (quaternionA.y - quaternionB.y),
        quaternionA.z - t * (quaternionA.z - quaternionB.z),
        quaternionA.w - t * (quaternionA.w - quaternionB.w));
}
//////////////
// Vector2
//////////////
export function copyVector2(vector: Vector2): Vector2 {
    return new Vector2(
        vector.x,
        vector.y)
}
export function sumVector2(vectorA: Vector2, vectorB: Vector2): Vector2 {
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
export function divideVector2(vectorA: Vector2, vectorB: Vector2): Vector2 {
    return new Vector2(
        vectorA.x / vectorB.x,
        vectorA.y / vectorB.y)
}
export function normalizeVector2(vector: Vector2): Vector2 {
    let magnitude = Math.hypot(vector.x, vector.y)
    if (magnitude == 0) {
        return new Vector2(0, 0)
    }
    return new Vector2(
        vector.x / magnitude,
        vector.y / magnitude)
}
//////////////
// Vector3
//////////////
export function lerpVector3(vectorA: Vector3, vectorB: Vector3, t: number): Vector3 {
    return new Vector3(
        vectorA.x + (vectorB.x - vectorA.x) * t,
        vectorA.y + (vectorB.y - vectorA.y) * t,
        vectorA.z + (vectorB.z - vectorA.z) * t)
}
export function copyVector3(vector: Vector3): Vector3 {
    return new Vector3(
        vector.x,
        vector.y,
        vector.z)
}
export function sumVector3(vectorA: Vector3, vectorB: Vector3): Vector3 {
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
export function divideVector3(vectorA: Vector3, vectorB: Vector3): Vector3 {
    return new Vector3(
        vectorA.x / vectorB.x,
        vectorA.y / vectorB.y,
        vectorA.z / vectorB.z)
}
export function normalizeVector3(vector: Vector3): Vector3 {
    let magnitude = Math.hypot(vector.x, vector.y, vector.z)
    if (magnitude == 0) {
        return new Vector3(0, 0, 0)
    }
    return new Vector3(
        vector.x / magnitude,
        vector.y / magnitude,
        vector.z / magnitude)
}
export function applyQuaternionToVector3(vector: Vector3, quaternion: Quaternion): Vector3 {
    const tx = 2 * (quaternion.y * vector.z - quaternion.z * vector.y);
    const ty = 2 * (quaternion.z * vector.x - quaternion.x * vector.z);
    const tz = 2 * (quaternion.x * vector.y - quaternion.y * vector.x);

    return new Vector3(
        vector.x + quaternion.w * tx + quaternion.y * tz - quaternion.z * ty,
        vector.y + quaternion.w * ty + quaternion.z * tx - quaternion.x * tz,
        vector.z + quaternion.w * tz + quaternion.x * ty - quaternion.y * tx)
}
export function dotProductVector3(vectorA: Vector3, vectorB: Vector3): number {
    return (
        (vectorA.x * vectorB.x) +
        (vectorA.y * vectorB.y) +
        (vectorA.z * vectorB.z))
}
//////////////
// Misc
//////////////
export function lerp(x: number, y: number, t: number) {
    return (1 - t) * x + t * y;
}
export function lookAt(to: Vector3, from: Vector3, up: Vector3): Quaternion {
    let forward = normalizeVector3(
        new Vector3(
            from.x - to.x,
            from.y - to.y,
            from.z - to.z));

    let right = normalizeVector3(crossProduct(up, forward));
    up = crossProduct(forward, right);

    let num8 = (right.x + up.y) + forward.z;
    let quaternion = new Quaternion(0, 0, 0, 1);
    if (num8 > 0) {
        let num = Math.sqrt(num8 + 1);
        quaternion.w = num * 0.5;
        num = 0.5 / num;
        quaternion.x = (up.z - forward.y) * num;
        quaternion.y = (forward.x - right.z) * num;
        quaternion.z = (right.y - up.x) * num;
        return quaternion;
    }
    if ((right.x >= up.y) && (right.x >= forward.z)) {
        let num7 = Math.sqrt(((1 + right.x) - up.y) - forward.z);
        let num4 = 0.5 / num7;
        quaternion.x = 0.5 * num7;
        quaternion.y = (right.y + up.x) * num4;
        quaternion.z = (right.z + forward.x) * num4;
        quaternion.w = (up.z - forward.y) * num4;
        return quaternion;
    }
    if (up.y > forward.z) {
        let num6 = Math.sqrt(((1 + up.y) - right.x) - forward.z);
        let num3 = 0.5 / num6;
        quaternion.x = (up.x + right.y) * num3;
        quaternion.y = 0.5 * num6;
        quaternion.z = (forward.y + up.z) * num3;
        quaternion.w = (forward.x - right.z) * num3;
        return quaternion;
    }
    let num5 = Math.sqrt(((1 + forward.z) - right.x) - up.y);
    let num2 = 0.5 / num5;
    quaternion.x = (forward.x + right.z) * num2;
    quaternion.y = (forward.y + up.z) * num2;
    quaternion.z = 0.5 * num5;
    quaternion.w = (right.y - up.x) * num2;
    return quaternion;
}
export function axisAngletoQuaternion(axis: Vector3, angle: number): Quaternion {
    let s = Math.sin(angle / 2)
    let u = normalizeVector3(axis)
    return new Quaternion(
        u.x * s, u.y * s, u.z * s, Math.cos(angle / 2))
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
export function rotatePoint(vector: Vector3, point: Vector3) {
    let cosa = Math.cos(vector.y);
    let sina = Math.sin(vector.y);

    let cosb = Math.cos(vector.x);
    let sinb = Math.sin(vector.x);

    let cosc = Math.cos(vector.z);
    let sinc = Math.sin(vector.z);

    let Axx = cosa * cosb;
    let Axy = cosa * sinb * sinc - sina * cosc;
    let Axz = cosa * sinb * cosc + sina * sinc;

    let Ayx = sina * cosb;
    let Ayy = sina * sinb * sinc + cosa * cosc;
    let Ayz = sina * sinb * cosc - cosa * sinc;

    let Azx = -sinb;
    let Azy = cosb * sinc;
    let Azz = cosb * cosc;

    let px = point.x;
    let py = point.y;
    let pz = point.z;

    return new Vector3(
        Axx * px + Axy * py + Axz * pz,
        Ayx * px + Ayy * py + Ayz * pz,
        Azx * px + Azy * py + Azz * pz);
}
export function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180)
}
export function rad2deg(radians: number): number {
    return radians * (180 / Math.PI)
}
export function getRandomNumberInclusive(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    return Math.floor(Math.random() * (Math.floor(max) - minCeiled + 1) + minCeiled);
}
export function clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max)
}
