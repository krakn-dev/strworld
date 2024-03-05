import * as CANNON from "cannon-es"
import * as Comps from "./components"
import * as Utils from "../utils"
import * as ECS from "./ecs"
import * as Res from "./resources"
import { Keys } from "../serialization"

export function isEntityType(entityType: Comps.EntityTypes, entityUid: number, system: ECS.System): boolean {
    let foundEntityType = system.find([
        ECS.Get.One,
        [Comps.ComponentTypes.EntityType],
        ECS.By.EntityUid,
        entityUid
    ])
    if (foundEntityType[0].length == 0) {
        throw "no EntityType component"
    }
    let entityTypeComponent = foundEntityType[0][0] as Comps.EntityType
    if (entityTypeComponent.entityType == entityType) {
        return true
    }
    return false
}

export function getMovementDirection(resources: Res.Resources): Utils.Vector2 {
    let direction = new Utils.Vector2(0, 0)

    let isUpPressed = resources.input.isKeyDown(Keys.Up)
    let isWPressed = resources.input.isKeyDown(Keys.W)

    let isLeftPressed = resources.input.isKeyDown(Keys.Left)
    let isAPressed = resources.input.isKeyDown(Keys.A)

    let isDownPressed = resources.input.isKeyDown(Keys.Down)
    let isSPressed = resources.input.isKeyDown(Keys.S)

    let isRightPressed = resources.input.isKeyDown(Keys.Right)
    let isDPressed = resources.input.isKeyDown(Keys.D)

    if (isUpPressed || isWPressed) direction.y++
    if (isDownPressed || isSPressed) direction.y--
    if (isLeftPressed || isAPressed) direction.x--
    if (isRightPressed || isDPressed) direction.x++

    return direction
}
export function cacheShape(shapeComponent: Comps.Shape, resources: Res.Resources) {
    switch (shapeComponent.shapeType) {
        case Comps.ShapeTypes.Box: {
            console.log("no need to cache")
        } break;
        case Comps.ShapeTypes.Capsule: {
            console.log("no need to cache")
        } break;
        case Comps.ShapeTypes.Cylinder: {
            resources.physics.customConvexShapes.createPrism(
                shapeComponent.sideNumber!,
                shapeComponent.height!,
                shapeComponent.radius!)
        } break;
    }
}
