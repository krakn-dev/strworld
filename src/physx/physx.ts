import type PhysXT from "./physx-js-webidl.wasm.d.ts"
let _physx = require("./physx-js-webidl.js")

let PhysX: typeof PhysXT

async function start() {
    let physxInstance = await _physx()
    PhysX = physxInstance
}

export { start, PhysX, PhysXT }
