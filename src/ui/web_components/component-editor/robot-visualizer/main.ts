import html from "./main.html"
import css from "./main.css"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as Utils from '../../../../utils';
import * as Comps from '../../../../ecs/components';
import * as Ser from "../../../../serialization"
import * as ECS from "../../../../ecs/ecs"
import * as GraphicContext from '../../shared/graphic-context/main';

export enum Mode {
    Remove,
    Add,
    Translate,
    Rotate,
    None,
    Rename,
}
export class CustomElement extends HTMLElement {
    robotComponents: RobotComponent[]
    hasRedRobotComponents: boolean
    hasBlueRobotComponents: boolean
    private robotVisualizerElement: HTMLDivElement
    private graphicContextElement: GraphicContext.CustomElement
    private isMouseDown: boolean
    private isOrbiting: boolean
    private onComponentPlace: CustomEvent
    private onComponentRemove: CustomEvent
    private showPlacementConfirm: CustomEvent
    physics: Physics
    private mode: Mode
    private mouseRaycast: MouseRaycast
    private graphicEffects: GraphicEffects
    private transformControls: TransformControl
    private orbitControls: OrbitControls
    private selectedRobotComponentType: Comps.RobotComponentTypes | undefined
    private updateInterval: any | undefined
    private isTransforming: boolean
    private savedRobotComponentPosition: THREE.Vector3 | undefined
    private savedRobotComponentType: Comps.RobotComponentTypes | undefined


    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotVisualizerElement = this.shadowRoot!.getElementById("robot-visualizer") as HTMLDivElement
        this.graphicContextElement = this.shadowRoot!.getElementById("graphic-context") as GraphicContext.CustomElement

        this.onComponentPlace = new CustomEvent("componentplaced", { bubbles: false, cancelable: true, composed: true })
        this.onComponentRemove = new CustomEvent("componentremoved", { bubbles: false, cancelable: true, composed: true, detail: {} })
        this.showPlacementConfirm = new CustomEvent("showconfirmplacementmenu", { bubbles: false, cancelable: true, composed: true, detail: {} })

        this.robotComponents = []
        this.isMouseDown = false
        this.isOrbiting = false
        this.physics = new Physics()
        this.mode = Mode.None
        this.graphicEffects = new GraphicEffects(this.graphicContextElement, true)
        this.graphicContextElement.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 20000)
        this.transformControls = new TransformControl(this.graphicContextElement.camera, this.graphicContextElement.renderer)
        this.orbitControls = new OrbitControls(this.graphicContextElement.camera!, this.graphicContextElement.renderer.domElement)
        this.orbitControls.maxDistance = 100
        this.orbitControls.minDistance = 1
        this.isTransforming = false

        let skybox = this.createSkybox()
        this.mouseRaycast = new MouseRaycast(this.graphicContextElement.scene)
        this.graphicContextElement.addObject(skybox)
        this.updateInterval = setInterval(this._update.bind(this), 25)
        this.transformControls.controls.addEventListener("objectChange", this._onObjectTransformed.bind(this))

        this.hasRedRobotComponents = false
        this.hasBlueRobotComponents = false
    }
    connectedCallback() {
        this.setupScene()
        this.robotVisualizerElement.addEventListener("mousedown", this._onMouseDown.bind(this))
        this.robotVisualizerElement.addEventListener("mousemove", this._onMouseMove.bind(this))
        this.robotVisualizerElement.addEventListener("mouseup", this._onMouseUp.bind(this))
        this.transformControls.controls.addEventListener("mouseDown", this._onStartedTransforming.bind(this))
        this.transformControls.controls.addEventListener("mouseUp", this._onStoppedTransforming.bind(this))
    }
    disconnectedCallback() {
        clearInterval(this.updateInterval)
    }
    private _onObjectTransformed() {
        if (this.graphicEffects.selectedObject != undefined) {
            this.updateObjectPosition(
                this.graphicEffects.selectedObject,
                this.graphicEffects.selectedObject.position)
            this.updateObjectRotation(
                this.graphicEffects.selectedObject,
                new THREE.Quaternion().setFromEuler(this.graphicEffects.selectedObject.rotation))

        }
    }
    private _onStartedTransforming() {
        this.orbitControls.enabled = false
        this.isTransforming = true
    }
    private _onStoppedTransforming() {
        this.orbitControls.enabled = true
        this.isTransforming = false
    }
    private _update() {
        this.physics.step()
        if (this.isTransforming) {
            this.mouseRaycast.intersection = undefined
        } else {
            this.mouseRaycast.updateIntersection(this.robotComponents)
        }
        this.graphicEffects.intersection = this.mouseRaycast.intersection
        if (this.graphicEffects.isPlacePreviewEnabled) {
            this.graphicEffects.updatePreviewObject()
            this.physics.updatePlaceTest(this.graphicEffects.selectedObject)
            if (this.physics.isPlaceTestBodyColliding) {
                this.graphicEffects.isSelectedMaterialRed = true
            } else {
                this.graphicEffects.isSelectedMaterialRed = false
            }
        } else {
            if (!this.graphicEffects.keepHighlight) {
                this.graphicEffects.selectHighlightObject(this.mouseRaycast.intersection)
            }
        }
        this.graphicEffects.updateMaterialColor()
        let collidingObjects = this.getCollidingObjects()
        let notGluedObjects = this.getNotGluedObjects()
        this.graphicEffects.updateCollidingObjects(collidingObjects)
        this.graphicEffects.updateNotGluedObjects(notGluedObjects)

        if (collidingObjects.length > 0) {
            this.hasRedRobotComponents = true
        } else {
            this.hasRedRobotComponents = false
        }
        if (notGluedObjects.length > 0) {
            this.hasBlueRobotComponents = true
        } else {
            this.hasBlueRobotComponents = false
        }
    }
    private getRobotComponentIndexByBodyId(bodyId: number): number | undefined {
        for (let [i, rGC] of this.robotComponents.entries()) {
            if (
                rGC.collisionBody.id == bodyId ||
                rGC.glueBody.id == bodyId
            ) {
                return i
            }
        }
        return undefined
    }
    private getNotGluedObjects(): THREE.Object3D[] {
        if (this.physics.graph.islands.length == 1) {
            return []
        }
        let notGluedBodiesId: number[] = []
        for (let island of this.physics.graph.islands) {
            let isGlued = false
            for (let bId of island) {
                if (this.robotComponents[0].glueBody.id == bId) {
                    isGlued = true
                }
            }
            if (!isGlued) {
                notGluedBodiesId = [...notGluedBodiesId, ...island]
            }
        }

        let objects = []
        for (let bI of notGluedBodiesId) {
            let index = this.getRobotComponentIndexByBodyId(bI)
            if (index != undefined) {
                objects.push(this.robotComponents[index].object)
            }
        }
        return objects
    }
    private getCollidingObjects(): THREE.Object3D[] {
        let collidingBodiesId = []
        for (let ids of this.physics.collisionBodiesOverlap) {
            let isAFound = false
            let isBFound = false

            for (let cId of collidingBodiesId) {
                if (cId == ids[0]) {
                    isAFound = true
                }
                if (cId == ids[1]) {
                    isBFound = true
                }
            }

            if (!isAFound) {
                collidingBodiesId.push(ids[0])
            }
            if (!isBFound) {
                collidingBodiesId.push(ids[1])
            }
        }
        let objects = []
        for (let cBI of collidingBodiesId) {
            let index = this.getRobotComponentIndexByBodyId(cBI)
            if (index != undefined) {
                objects.push(this.robotComponents[index].object)
            }
        }
        return objects
    }
    private _onMouseMove(event: any) {
        if (this.isMouseDown) {
            if (this.orbitControls.enabled) {
                this.isOrbiting = true
            } else {
                this.isOrbiting = false
            }
        }
        this.mouseRaycast.updateCursorPosition(event)
    }
    private _onMouseDown() {
        this.isMouseDown = true
    }
    private _onMouseUp(event: any) {
        if (!this.isOrbiting) {
            this._click()
        }
        this.isMouseDown = false
        this.isOrbiting = false
    }
    updateSelectedRobotComponentType(newRobotComponentType: Comps.RobotComponentTypes | undefined) {
        this.selectedRobotComponentType = newRobotComponentType
    }
    private async setupScene() {
        let directionalLight = new THREE.DirectionalLight(0xffffff, 2)
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
        let processorGeometry = new THREE.BoxGeometry(1, 1, 1)
        let processorMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00 })
        let processor = new THREE.Mesh(processorGeometry, processorMaterial)
        this.graphicContextElement.camera!.position.set(-2, 2, 5)
        directionalLight.position.set(3, 3, 3)
        directionalLight.castShadow = true
        this.orbitControls.update()

        this.graphicContextElement.addObject(directionalLight)
        this.graphicContextElement.addObject(ambientLight)
        this.mouseRaycast.updateCamera(this.graphicContextElement.camera!)
        this.selectedRobotComponentType = Comps.RobotComponentTypes.Processor
        this.addObject(processor)
    }
    updateMode(newMode: Mode) {
        this.mode = newMode
        switch (this.mode) {
            case Mode.Remove: {
                this.graphicEffects.isSelectedMaterialRed = false
                this.disableTransform()
                this.transformControls.detach()
                this.graphicEffects.keepHighlight = false
                this.graphicEffects.setHighlightMode()
                this.physics.enablePlaceTest(false)
            } break;
            case Mode.Add: {
                this.graphicEffects.isSelectedMaterialRed = false
                this.disableTransform()
                this.transformControls.detach()
                this.graphicEffects.setPlacePreviewMode()
                this.physics.enablePlaceTest(true)
            } break;
            case Mode.Translate: {
                this.graphicEffects.isSelectedMaterialRed = false
                this.transformControls.setTranslationMode()
                this.enableTransform()
                this.graphicEffects.setHighlightMode()
                this.physics.enablePlaceTest(false)
            } break;
            case Mode.Rotate: {
                this.graphicEffects.isSelectedMaterialRed = false
                this.transformControls.setRotationMode()
                this.enableTransform()
                this.transformControls.controls.setRotationSnap(Math.PI / 4)
                this.graphicEffects.setHighlightMode()
                this.physics.enablePlaceTest(false)
            } break;
            case Mode.None: {
                // do nothing
            } break;
        }
    }
    onPlaceAnywayClicked() {
        if (
            this.savedRobotComponentPosition == undefined ||
            this.savedRobotComponentType == undefined
        ) {
            return
        }

        let objectGeometry = new THREE.BoxGeometry(1, 1, 1)
        let objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00 })
        let object = new THREE.Mesh(objectGeometry, objectMaterial)
        this.selectedRobotComponentType = this.savedRobotComponentType
        object.position.copy(this.savedRobotComponentPosition)
        this.addObject(object)
        this.dispatchEvent(this.onComponentPlace)
    }
    private async _click() {
        if (this.mouseRaycast.intersection == undefined) return
        switch (this.mode) {
            case Mode.Add: {
                await Utils.sleep(25)
                let position = Calculator.getPositionToPlaceComponent(this.mouseRaycast.intersection!)
                if (position == undefined) return

                if (this.physics.isPlaceTestBodyColliding) {
                    this.dispatchEvent(this.showPlacementConfirm)
                    this.savedRobotComponentPosition = position
                    this.savedRobotComponentType = this.selectedRobotComponentType
                    return
                }
                let objectGeometry = new THREE.BoxGeometry(1, 1, 1)
                let objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00 })
                let object = new THREE.Mesh(objectGeometry, objectMaterial)
                object.position.set(position.x, position.y, position.z)
                this.addObject(object)
                this.dispatchEvent(this.onComponentPlace)
            } break;
            case Mode.Remove: {
                await Utils.sleep(25)
                if (this.mouseRaycast.intersection?.object == undefined) return
                let index = this.getRobotComponentIndexByObjectId(this.mouseRaycast.intersection.object.id)
                if (index == undefined || index == 0) return
                this.onComponentRemove.detail.robotComponentType = this.robotComponents[index].robotComponentType
                this.removeObject(this.mouseRaycast.intersection.object)
                this.dispatchEvent(this.onComponentRemove)
            } break;
            case Mode.Translate: {
                await Utils.sleep(25)
                this.transformControls.attach(this.mouseRaycast.intersection!.object)
                this.graphicEffects.selectHighlightObject(this.mouseRaycast.intersection)
                this.graphicEffects.keepHighlight = true
            } break;
            case Mode.Rotate: {
                await Utils.sleep(25)
                this.transformControls.attach(this.mouseRaycast.intersection!.object)
                this.graphicEffects.selectHighlightObject(this.mouseRaycast.intersection)
                this.graphicEffects.keepHighlight = true
            } break;
        }
    }
    private getRobotComponentIndexByObjectId(objectId: number): number | undefined {
        for (let [i, rGC] of this.robotComponents.entries()) {
            if (rGC.object.id == objectId) {
                return i
            }
        }
        return undefined
    }
    private createSkybox(): THREE.Object3D {
        let front: any = new THREE.TextureLoader().load("assets/sky-nz.png")
        let back: any = new THREE.TextureLoader().load("assets/sky-pz.png")
        let left: any = new THREE.TextureLoader().load("assets/sky-nx.png")
        let right: any = new THREE.TextureLoader().load("assets/sky-px.png")
        let top: any = new THREE.TextureLoader().load("assets/sky-py.png")
        let bottom: any = new THREE.TextureLoader().load("assets/sky-ny.png")

        front = new THREE.MeshBasicMaterial({ map: front, side: THREE.BackSide })
        back = new THREE.MeshBasicMaterial({ map: back, side: THREE.BackSide })
        left = new THREE.MeshBasicMaterial({ map: left, side: THREE.BackSide })
        right = new THREE.MeshBasicMaterial({ map: right, side: THREE.BackSide })
        top = new THREE.MeshBasicMaterial({ map: top, side: THREE.BackSide })
        bottom = new THREE.MeshBasicMaterial({ map: bottom, side: THREE.BackSide })
        let materialArray = [front, back, top, bottom, right, left]
        let skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000)
        return new THREE.Mesh(skyboxGeometry, materialArray)
    }
    removeObject(object: THREE.Object3D) {
        this.graphicContextElement.removeObject(object)
        let index = this.getRobotComponentIndexByObjectId(object.id)
        if (index == undefined) return
        this.physics.removeBodies(
            this.robotComponents[index].collisionBody,
            this.robotComponents[index].glueBody)
    }
    addObject(object: THREE.Object3D) {
        this.graphicContextElement.addObject(object)
        let [collisionBody, glueBody] = this.physics.addBody(object)
        this.robotComponents.push(
            new RobotComponent(object, collisionBody, glueBody, this.selectedRobotComponentType!))
    }
    updateObjectPosition(object: THREE.Object3D, position: THREE.Vector3) {
        let index = this.getRobotComponentIndexByObjectId(object.id)
        if (index == undefined) return
        this.robotComponents[index].object.position.copy(position)
        this.robotComponents[index].glueBody.position.set(position.x, position.y, position.z)
        this.robotComponents[index].collisionBody.position.set(position.x, position.y, position.z)
    }
    updateObjectRotation(object: THREE.Object3D, rotation: THREE.Quaternion) {
        let index = this.getRobotComponentIndexByObjectId(object.id)
        if (index == undefined) return
        this.robotComponents[index].object.rotation.setFromQuaternion(rotation)
        this.robotComponents[index].glueBody.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
        this.robotComponents[index].collisionBody.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
    }
    enableTransform() {
        this.graphicContextElement.addObject(this.transformControls.controls)
    }
    disableTransform() {
        this.graphicContextElement.removeObject(this.transformControls.controls)
    }
}
class TransformControl {
    controls: TransformControls
    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.Renderer) {
        this.controls = new TransformControls(camera, renderer.domElement)
    }
    attach(object: THREE.Object3D,) {
        this.controls.attach(object)
    }
    setRotationMode() {
        this.controls.setMode("rotate")
    }
    setTranslationMode() {
        this.controls.setMode("translate")
    }
    detach() {
        this.controls.detach()
    }

}
class GraphicEffects {
    private graphicContext: GraphicContext.CustomElement
    private collidingObjects: THREE.Object3D[]
    private notGluedObjects: THREE.Object3D[]

    selectedObject: THREE.Object3D | undefined
    isPlacePreviewEnabled: boolean
    intersection: THREE.Intersection<THREE.Object3D> | undefined
    keepHighlight: boolean
    isSelectedMaterialRed: boolean
    private x: number

    constructor(newGraphicContext: GraphicContext.CustomElement, newIsPlacePreview: boolean) {
        this.graphicContext = newGraphicContext
        this.isPlacePreviewEnabled = newIsPlacePreview
        this.isSelectedMaterialRed = true
        this.collidingObjects = []
        this.notGluedObjects = []
        this.keepHighlight = false
        this.x = 0
    }
    updateCollidingObjects(newCollidingObjects: THREE.Object3D[]) {
        for (let cO of this.collidingObjects) {
            ((cO as THREE.Mesh).material as any).color.set(0x00cc00)
        }
        this.collidingObjects = newCollidingObjects
        for (let cO of this.collidingObjects) {
            ((cO as THREE.Mesh).material as any).color.set(0xcc0000)
        }
    }
    updateNotGluedObjects(newNotGluedObjects: THREE.Object3D[]) {
        for (let cO of this.notGluedObjects) {
            ((cO as THREE.Mesh).material as any).color.set(0x00cc00)
        }
        this.notGluedObjects = newNotGluedObjects
        for (let cO of this.notGluedObjects) {
            ((cO as THREE.Mesh).material as any).color.set(0x0000cc)
        }
    }
    updatePreviewObject() {
        if (this.intersection == undefined && this.selectedObject != undefined) {
            this.graphicContext.removeObject(this.selectedObject)
            this.selectedObject = undefined
        }
        if (this.intersection != undefined && this.selectedObject == undefined) {
            let objectGeometry = new THREE.BoxGeometry(1, 1, 1)
            let objectMaterial = new THREE.MeshPhongMaterial({
                color: 0x00cc00,
                transparent: true, opacity: 0.5
            })
            let object = new THREE.Mesh(objectGeometry, objectMaterial)
            this.selectedObject = object
            this.graphicContext.addObject(object)
        }
        if (this.intersection == undefined || this.selectedObject == undefined) return
        let position = Calculator.getPositionToPlaceComponent(this.intersection)
        if (position == undefined) {
            this.graphicContext.removeObject(this.selectedObject)
            this.selectedObject = undefined
            return
        }
        this.selectedObject.position.set(position.x, position.y, position.z)
    }
    updateMaterialColor() {
        if (this.selectedObject == undefined) return
        if (this.isSelectedMaterialRed) {
            ((this.selectedObject as THREE.Mesh).material as any).color.set(0xff0000)
        }
        else {
            let hex = (Math.trunc((Math.sin(this.x * 0.15) + 1.5) * 5).toString(16))
            hex = (parseInt("0x" + hex)).toString(16) + "f";
            ((this.selectedObject as THREE.Mesh).material as any).color.set(parseInt("0xff" + hex + "ff"))
        }
        this.x += 1;
    }
    selectHighlightObject(intersection: THREE.Intersection<THREE.Object3D> | undefined) {
        if (intersection?.object == undefined) {
            if (this.keepHighlight) {
                return
            } else {
                this.clearSelectedObject()
            }
        }
        this.clearSelectedObject()
        let object = intersection?.object as THREE.Mesh
        this.selectedObject = object
    }
    setPlacePreviewMode() {
        if (this.isPlacePreviewEnabled) return
        this.clearSelectedObject()
        this.isPlacePreviewEnabled = true
    }
    setHighlightMode() {
        if (!this.isPlacePreviewEnabled) return
        if (this.selectedObject != undefined) {
            this.graphicContext.removeObject(this.selectedObject)
            this.selectedObject = undefined
        }
        this.isPlacePreviewEnabled = false
    }
    clearSelectedObject() {
        if (this.selectedObject != undefined) {
            ((this.selectedObject as THREE.Mesh).material as any).color.set(0x00cc00)
            this.selectedObject = undefined
        }
        this.keepHighlight = false
    }
}
class MouseRaycast {
    private raycaster = new THREE.Raycaster();
    private mouse3DIntersections: THREE.Intersection<THREE.Object3D>[]
    private scene: THREE.Scene
    private pointer: THREE.Vector2 | undefined
    private camera: THREE.PerspectiveCamera | undefined
    allIntersections: THREE.Intersection<THREE.Object3D>[]
    intersection: THREE.Intersection<THREE.Object3D> | undefined

    constructor(newScene: THREE.Scene) {
        this.intersection = undefined
        this.allIntersections = []
        this.mouse3DIntersections = []
        this.scene = newScene
    }
    updateCamera(newCamera: THREE.PerspectiveCamera) {
        this.camera = newCamera
    }
    updateCursorPosition(event: any) {
        this.pointer = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1)
    }
    updateIntersection(robotComponents: RobotComponent[]) {
        if (this.camera == undefined || this.pointer == undefined) return
        this.raycaster.setFromCamera(this.pointer, this.camera);
        this.mouse3DIntersections = this.raycaster.intersectObjects(this.scene.children)

        this.allIntersections = this.mouse3DIntersections

        let isIntersectionFound = false
        for (let i of this.allIntersections) {
            for (let rC of robotComponents) {
                if (rC.object.id == i.object.id) {
                    this.intersection = i
                    isIntersectionFound = true
                    break
                }
            }
            if (isIntersectionFound) {
                break
            }
        }
        if (!isIntersectionFound) {
            this.intersection = undefined
        }
    }
}
class GraphElement {
    id: number
    siblingElements: GraphElement[]
    constructor(newId: number) {
        this.id = newId
        this.siblingElements = []
    }
}
class Graph {
    elements: GraphElement[]

    islands: number[][]
    private alreadyVisitedElements: number[]
    private currentIsland: number[]

    constructor() {
        this.elements = []
        this.islands = []
        this.alreadyVisitedElements = []
        this.currentIsland = []
    }
    removeElementSibling(elementId: number, siblingId: number) {
        for (let e of this.elements) {
            if (e.id == elementId) {
                for (let [sEI, sE] of e.siblingElements.entries()) {
                    if (sE.id == siblingId) {
                        e.siblingElements.splice(sEI, 1)
                    }
                }
            }
        }
    }
    addElementSibling(elementId: number, siblingId: number) {
        let siblingElement: GraphElement | undefined = undefined
        let targetElement: GraphElement | undefined = undefined

        for (let e of this.elements) {
            if (e.id == elementId) {
                targetElement = e
            }
            if (e.id == siblingId) {
                siblingElement = e
            }
        }
        if (siblingElement == undefined || targetElement == undefined) {
            console.log("???????????")
            return
        }
        targetElement.siblingElements.push(siblingElement)
    }
    newElement(elementId: number) {
        this.elements.push(new GraphElement(elementId))
    }
    removeElement(elementId: number) {
        for (let [eI, e] of this.elements.entries()) {
            for (let [sI, s] of e.siblingElements.entries()) {
                if (s.id == elementId) {
                    e.siblingElements.splice(sI, 1)
                    break;
                }
            }
            if (e.id == elementId) {
                this.elements.splice(eI, 1)
            }
        }
    }
    recursiveSearch(element: GraphElement) {
        for (let aVE of this.alreadyVisitedElements) {
            if (aVE == element.id) {
                return
            }
        }
        this.alreadyVisitedElements.push(element.id)
        this.currentIsland.push(element.id)
        for (let s of element.siblingElements) {
            this.recursiveSearch(s)
        }
    }
    updateIslands() {
        this.islands = []
        for (let e of this.elements) {
            this.currentIsland = []
            this.recursiveSearch(e)
            if (this.currentIsland.length > 0) {
                this.islands.push(this.currentIsland)
            }
        }
        this.alreadyVisitedElements = []
    }
}
class Physics {
    world: CANNON.World
    collisionBodiesId: number[]
    glueBodiesId: number[]
    graph: Graph

    collisionBodiesOverlap: [number, number][]
    glueBodiesOverlap: [number, number][]

    placeTestBody: CANNON.Body | undefined
    isPlaceTestBodyColliding: boolean | undefined
    isPlaceTestEnabled: boolean
    placeTestCollisionCount: number

    lastRemovedGlueBodyId: number | undefined
    lastRemovedCollisionBodyId: number | undefined

    constructor() {
        this.world = new CANNON.World()
        this.world.addEventListener("endContact", this._onCollisionExit.bind(this))
        this.world.addEventListener("beginContact", this._onCollisionEnter.bind(this))
        this.collisionBodiesId = []
        this.glueBodiesId = []
        this.collisionBodiesOverlap = []
        this.glueBodiesOverlap = []
        this.graph = new Graph()
        this.isPlaceTestEnabled = false
        this.placeTestCollisionCount = 0
    }
    enablePlaceTest(isEnabled: boolean) {
        if (this.isPlaceTestEnabled == isEnabled) return
        this.isPlaceTestEnabled = isEnabled
        this.placeTestCollisionCount = 0
        if (this.isPlaceTestEnabled) {
            let xSize = 0.5
            let ySize = 0.5
            let zSize = 0.5

            let shape = new CANNON.Box(new CANNON.Vec3(xSize, ySize, zSize))
            let body = new CANNON.Body({
                shape: shape,
                mass: 0,
            })
            body.type = CANNON.BODY_TYPES.KINEMATIC
            this.placeTestBody = body
            this.world.addBody(body)
        } else {
            if (this.placeTestBody != undefined) {
                this.world.removeBody(this.placeTestBody)
                this.placeTestBody = undefined
            }
            this.isPlaceTestBodyColliding = undefined
        }
    }
    updatePlaceTest(object: THREE.Object3D | undefined) {
        if (this.placeTestBody == undefined || object == undefined) return
        this.placeTestBody.position = new CANNON.Vec3(
            object.position.x,
            object.position.y,
            object.position.z);

        this.placeTestBody.quaternion = new CANNON.Quaternion(
            object.quaternion.x,
            object.quaternion.y,
            object.quaternion.z,
            object.quaternion.w);

        if (this.placeTestCollisionCount == 0) {
            this.isPlaceTestBodyColliding = false
        }
        else {
            this.isPlaceTestBodyColliding = true
        }
    }
    addBody(mesh: THREE.Object3D): [CANNON.Body, CANNON.Body] {
        let xSize = 0.5
        let ySize = 0.5
        let zSize = 0.5

        let collisionBody = new CANNON.Body({
            position: new CANNON.Vec3(
                mesh.position.x,
                mesh.position.y,
                mesh.position.z),
            quaternion: new CANNON.Quaternion(
                mesh.quaternion.x,
                mesh.quaternion.y,
                mesh.quaternion.z,
                mesh.quaternion.w),
            shape: new CANNON.Box(new CANNON.Vec3(xSize, ySize, zSize)),
            mass: 0,
        })
        let glueBody = new CANNON.Body({
            position: new CANNON.Vec3(
                mesh.position.x,
                mesh.position.y,
                mesh.position.z),
            quaternion: new CANNON.Quaternion(
                mesh.quaternion.x,
                mesh.quaternion.y,
                mesh.quaternion.z,
                mesh.quaternion.w),
            shape: new CANNON.Box(new CANNON.Vec3(xSize + 0.1, ySize + 0.1, zSize + 0.1)),
            mass: 0,
        })
        collisionBody.type = CANNON.BODY_TYPES.KINEMATIC
        glueBody.type = CANNON.BODY_TYPES.KINEMATIC

        this.glueBodiesId.push(glueBody.id)
        this.collisionBodiesId.push(collisionBody.id)
        this.world.addBody(collisionBody)
        this.world.addBody(glueBody)

        this.graph.newElement(glueBody.id)
        return [collisionBody, glueBody]
    }
    step() {
        this.world.fixedStep()
    }
    removeBodies(collisionBody: CANNON.Body, glueBody: CANNON.Body) {
        for (let [cBII, cBI] of this.collisionBodiesId.entries()) {
            if (cBI == collisionBody.id) {
                this.collisionBodiesId.splice(cBII, 1)
                this.glueBodiesId.splice(cBII, 1)
                this.world.removeBody(collisionBody)
                this.world.removeBody(glueBody)

                this.graph.removeElement(glueBody.id)

                this.lastRemovedGlueBodyId = glueBody.id
                this.lastRemovedCollisionBodyId = collisionBody.id
                return;
            }
        }
    }
    private _onCollisionEnter(event: any) {
        let bodyAId = event.bodyA.id
        let bodyBId = event.bodyB.id

        if (bodyAId == undefined || bodyBId == undefined) {
            return
        }

        if (
            this.isPlaceTestEnabled &&
            this.placeTestBody != undefined &&
            (bodyAId == this.placeTestBody.id || bodyBId == this.placeTestBody.id)
        ) {
            for (let gBI of this.glueBodiesId) {
                if (bodyAId == gBI || bodyBId == gBI) {
                    return
                }
            }
            this.placeTestCollisionCount += 1
            return
        }

        // glue bodies only overlaps with its kind
        let foundGlueCount = 0
        for (let gBI of this.glueBodiesId) {
            if (gBI == bodyAId || gBI == bodyBId) {
                foundGlueCount += 1
            }
        }
        // same for collision bodies
        let foundCollisionCount = 0
        for (let cBI of this.collisionBodiesId) {
            if (cBI == bodyAId || cBI == bodyBId) {
                foundCollisionCount += 1
            }
        }
        if (foundGlueCount == 2) {
            this.glueBodiesOverlap.push([bodyAId, bodyBId])

            this.graph.addElementSibling(bodyBId, bodyAId)
            this.graph.addElementSibling(bodyAId, bodyBId)
        }
        if (foundCollisionCount == 2) {
            this.collisionBodiesOverlap.push([bodyAId, bodyBId])
        }
        this.graph.updateIslands()
    }
    private removeOverlap(exitedBodyAId: number, exitedBodyBId: number) {
        for (let oI = this.collisionBodiesOverlap.length - 1; oI >= 0; oI--) {
            let collidingBodyAId = this.collisionBodiesOverlap[oI][0]
            let collidingBodyBId = this.collisionBodiesOverlap[oI][1]
            if (
                (collidingBodyAId == exitedBodyAId && collidingBodyBId == exitedBodyBId) ||
                (collidingBodyBId == exitedBodyAId && collidingBodyAId == exitedBodyBId)
            ) {
                this.collisionBodiesOverlap.splice(oI, 1)
                break;
            }
        }
        for (let oI = this.glueBodiesOverlap.length - 1; oI >= 0; oI--) {
            let glueBodyAId = this.glueBodiesOverlap[oI][0]
            let glueBodyBId = this.glueBodiesOverlap[oI][1]
            if (
                (glueBodyAId == exitedBodyAId && glueBodyBId == exitedBodyBId) ||
                (glueBodyBId == exitedBodyAId && glueBodyAId == exitedBodyBId)
            ) {
                this.graph.removeElementSibling(exitedBodyAId, exitedBodyBId)
                this.graph.removeElementSibling(exitedBodyBId, exitedBodyAId)
                this.graph.updateIslands()
                this.glueBodiesOverlap.splice(oI, 1)
                break;
            }
        }
    }
    private isPlaceTestBodyOverlapRemoved(exitedBodyAId: number, exitedBodyBId: number): boolean {
        if (
            this.isPlaceTestEnabled &&
            this.placeTestBody != undefined &&
            (exitedBodyAId == this.placeTestBody.id || exitedBodyBId == this.placeTestBody.id)
        ) {
            for (let gBI of this.glueBodiesId) {
                if (exitedBodyAId == gBI || exitedBodyBId == gBI) {
                    return true
                }
            }
            this.placeTestCollisionCount -= 1
            return true
        }
        return false
    }
    private _onCollisionExit(event: any) {
        let exitedBodyAId: number | undefined = undefined;
        let exitedBodyBId: number | undefined = undefined;

        if (event.bodyA != undefined) {
            exitedBodyAId = event.bodyA.id
        }
        if (event.bodyB != undefined) {
            exitedBodyBId = event.bodyB.id
        }

        if (exitedBodyAId != undefined && exitedBodyBId != undefined) {
            if (this.isPlaceTestBodyOverlapRemoved(exitedBodyAId, exitedBodyBId)) {
                return
            }
            this.removeOverlap(exitedBodyAId, exitedBodyBId)
            this.graph.updateIslands()
            return
        }

        if (
            (exitedBodyAId == undefined || exitedBodyBId == undefined) &&
            (this.lastRemovedCollisionBodyId == undefined || this.lastRemovedGlueBodyId == undefined)
        ) {
            return
        }

        let isBodyAUndefined = false
        let isBodyBUndefined = false

        if (exitedBodyAId == undefined) {
            isBodyAUndefined = true
        }
        if (exitedBodyBId == undefined) {
            isBodyBUndefined = true
        }

        if (isBodyAUndefined) {
            exitedBodyAId = this.lastRemovedCollisionBodyId
        }
        if (isBodyBUndefined) {
            exitedBodyBId = this.lastRemovedCollisionBodyId
        }

        // collision bodies
        if (this.isPlaceTestBodyOverlapRemoved(exitedBodyAId!, exitedBodyBId!)) {
            return
        }
        this.removeOverlap(exitedBodyAId!, exitedBodyBId!)

        // glue bodies
        if (isBodyAUndefined) {
            exitedBodyAId = this.lastRemovedGlueBodyId
        }
        if (isBodyBUndefined) {
            exitedBodyBId = this.lastRemovedGlueBodyId
        }
        this.removeOverlap(exitedBodyAId!, exitedBodyBId!)
        this.graph.updateIslands()

    }
}
export class RobotComponent {
    object: THREE.Object3D
    glueBody: CANNON.Body
    collisionBody: CANNON.Body
    robotComponentType: Comps.RobotComponentTypes
    constructor(
        newMesh: THREE.Object3D,
        newCollisionBody: CANNON.Body,
        newGlueBody: CANNON.Body,
        newRobotComponentType: Comps.RobotComponentTypes,
    ) {
        this.object = newMesh
        this.glueBody = newGlueBody
        this.collisionBody = newCollisionBody
        this.robotComponentType = newRobotComponentType
    }
}
class Calculator {
    static getPositionToPlaceComponent(intersection: THREE.Intersection<THREE.Object3D> | undefined): THREE.Vector3 | undefined {
        if (intersection == undefined || intersection.face == undefined) {
            return undefined
        }
        return new THREE.Vector3(
            (intersection.face!.normal!.x * 0.51) + intersection.point.x,
            (intersection.face!.normal!.y * 0.51) + intersection.point.y,
            (intersection.face!.normal!.z * 0.51) + intersection.point.z)
    }
}
//        let front= await Utils.AssetFetchCache.fetch("room-nz.png")
//        let back= await Utils.AssetFetchCache.fetch("room-pz.png")
//        let left= await  Utils.AssetFetchCache.fetch("room-nx.png")
//        let right= await  Utils.AssetFetchCache.fetch("room-px.png")
//        let top= await Utils.AssetFetchCache.fetch("room-py.png")
//        let bottom= await  Utils.AssetFetchCache.fetch("room-ny.png")
//
//        front = new THREE.MeshBasicMaterial({map:new THREE.Texture(await createImageBitmap(front)), side:THREE.BackSide})
//        back = new THREE.MeshBasicMaterial({map:new THREE.Texture(await createImageBitmap(back)), side:THREE.BackSide})
//        left = new THREE.MeshBasicMaterial({map:new THREE.Texture(await createImageBitmap(left)), side:THREE.BackSide})
//        right = new THREE.MeshBasicMaterial({map:new THREE.Texture(await createImageBitmap(right)), side:THREE.BackSide})
//        top = new THREE.MeshBasicMaterial({map:new THREE.Texture( await createImageBitmap(top)), side:THREE.BackSide})
//        bottom = new THREE.MeshBasicMaterial({map:new THREE.Texture(await createImageBitmap(bottom)), side:THREE.BackSide})
