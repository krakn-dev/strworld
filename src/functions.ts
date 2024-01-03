import * as ECS from "./ecs"
import * as Comps from "./components"
import * as Utils from "./utils"

export function getVertices(shapeComponent: Comps.Shape, positionComponent: Comps.Position): Utils.Vector3[] {
    let vertices: Utils.Vector3[] = []
    switch (shapeComponent.shapeType) {
        case Comps.ShapeTypes.Box: {
            let ftlVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)
            let ftrVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)
            let fblVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)
            let fbrVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)
            let btlVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)
            let btrVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)
            let bblVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)
            let bbrVertex = new Utils.Vector3(positionComponent.x, positionComponent.y, positionComponent.z)

            ftlVertex.z += shapeComponent.size.z
            ftrVertex.z += shapeComponent.size.z
            fblVertex.z += shapeComponent.size.z
            fbrVertex.z += shapeComponent.size.z

            btlVertex.z -= shapeComponent.size.z
            btrVertex.z -= shapeComponent.size.z
            bblVertex.z -= shapeComponent.size.z
            bbrVertex.z -= shapeComponent.size.z

            ftrVertex.x += shapeComponent.size.x
            fbrVertex.x += shapeComponent.size.x
            btrVertex.x += shapeComponent.size.x
            bbrVertex.x += shapeComponent.size.x

            ftlVertex.x -= shapeComponent.size.x
            fblVertex.x -= shapeComponent.size.x
            btlVertex.x -= shapeComponent.size.x
            bblVertex.x -= shapeComponent.size.x

            ftrVertex.y += shapeComponent.size.y
            ftlVertex.y += shapeComponent.size.y
            btrVertex.y += shapeComponent.size.y
            btlVertex.y += shapeComponent.size.y

            fbrVertex.y -= shapeComponent.size.y
            fblVertex.y -= shapeComponent.size.y
            bbrVertex.y -= shapeComponent.size.y
            bblVertex.y -= shapeComponent.size.y

            vertices.push(ftlVertex)
            vertices.push(ftrVertex)
            vertices.push(fblVertex)
            vertices.push(fbrVertex)
            vertices.push(btlVertex)
            vertices.push(btrVertex)
            vertices.push(bblVertex)
            vertices.push(bbrVertex)
        } break;
    }
    return vertices
}
