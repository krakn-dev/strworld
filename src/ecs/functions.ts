import * as Comps from "./components"
import * as Mat from "../math"
import * as ECS from "./ecs"
import * as Res from "./resources"
import * as Ser from "../serialization"

export function getComposedShapeCenterOfMass(shapesEntityUid: number[], resources: Res.Resources): Mat.Vector3 {
    let result = new Mat.Vector3(0, 0, 0)

    for (let eUid of shapesEntityUid) {
        let entityCache = resources.entitiesCache.get(eUid)
        let shapeComponent = entityCache!.components[Comps.ComponentTypes.Shape][0] as Comps.Shape
        let shapePositionOffset = shapeComponent.positionOffset!
        result.x += shapePositionOffset.x
        result.y += shapePositionOffset.y
        result.z += shapePositionOffset.z
    }
    result.x /= shapesEntityUid.length
    result.y /= shapesEntityUid.length
    result.z /= shapesEntityUid.length

    return result
}
export function getMovementDirection(resources: Res.Resources): Mat.Vector2 {
    let direction = new Mat.Vector2(0, 0)

    let isUpPressed = resources.input.isKeyDown(Ser.Keys.Up)
    let isWPressed = resources.input.isKeyDown(Ser.Keys.W)

    let isLeftPressed = resources.input.isKeyDown(Ser.Keys.Left)
    let isAPressed = resources.input.isKeyDown(Ser.Keys.A)

    let isDownPressed = resources.input.isKeyDown(Ser.Keys.Down)
    let isSPressed = resources.input.isKeyDown(Ser.Keys.S)

    let isRightPressed = resources.input.isKeyDown(Ser.Keys.Right)
    let isDPressed = resources.input.isKeyDown(Ser.Keys.D)

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
