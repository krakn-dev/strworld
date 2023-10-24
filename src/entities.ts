import * as ECS from "./ecs.js"
import * as Utils from "./utils.js"

export enum Entities {
    Human,
    Grass,
}

export class Grass implements ECS.Entity {
    entityType: Entities
    entityUid: number
    isNew: boolean
    constructor() {
        this.isNew = true
        this.entityType = Entities.Grass
        this.entityUid = Utils.newUid()
    }
}


export class Human implements ECS.Entity {
    entityType: Entities
    entityUid: number
    isNew: boolean
    constructor() {
        this.isNew = true
        this.entityType = Entities.Human
        this.entityUid = Utils.newUid()
    }
}
