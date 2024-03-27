import * as Comps from "./components"
import * as Mat from "../math"
import * as ECS from "./ecs"
import * as Res from "./resources"
import * as Ser from "../serialization"

export function shouldDestroyEntity(damage: number, resistance: number): boolean {
    if (resistance - damage < 0) return true
    if (Mat.getRandomNumberInclusive(0, resistance - damage) == 0) return true
    return false
}
export function triggerComponentChange(component: ECS.Component) {
    component.entityUid = component.entityUid
}
export function getMovementDirection(resources: Res.Resources): Mat.Vector2 {
    let direction = new Mat.Vector2(0, 0)

    let isUpPressed = resources.input.isButtonPressed(Ser.Buttons.Up)
    let isWPressed = resources.input.isButtonPressed(Ser.Buttons.W)

    let isLeftPressed = resources.input.isButtonPressed(Ser.Buttons.Left)
    let isAPressed = resources.input.isButtonPressed(Ser.Buttons.A)

    let isDownPressed = resources.input.isButtonPressed(Ser.Buttons.Down)
    let isSPressed = resources.input.isButtonPressed(Ser.Buttons.S)

    let isRightPressed = resources.input.isButtonPressed(Ser.Buttons.Right)
    let isDPressed = resources.input.isButtonPressed(Ser.Buttons.D)

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
