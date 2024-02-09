import html from "./main.html"
import css from "./main.css"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

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
    private robotVisualizerElement: HTMLDivElement
    private graphicContextElement: GraphicContext.CustomElement
    private robotComponents: RobotComponent[]
    private isMouseDown: boolean
    private isOrbiting: boolean
    private onComponentPlace: CustomEvent
    private onComponentRemove: CustomEvent
    private physics: Physics
    private mode: Mode
    private mouseRaycast: MouseRaycast
    private graphicEffects: GraphicEffects
    private transformControls: TransformControl
    private orbitControls: OrbitControls
    private selectedRobotComponentType: Comps.RobotComponentTypes | undefined
    private updateInterval: any | undefined
    private isTransforming: boolean


    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotVisualizerElement = this.shadowRoot!.getElementById("robot-visualizer") as HTMLDivElement
        this.graphicContextElement = this.shadowRoot!.getElementById("graphic-context") as GraphicContext.CustomElement

        this.onComponentPlace = new CustomEvent("componentplaced", { bubbles: false, cancelable: true, composed: true })
        this.onComponentRemove = new CustomEvent("componentremoved", { bubbles: false, cancelable: true, composed: true, detail: {} })

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
        this.graphicEffects.updateCollidingObjects(this.getCollidingObjects())
    }
    private getRobotComponentIndexByBodyId(bodyId: number): number | undefined {
        for (let [i, rGC] of this.robotComponents.entries()) {
            if (rGC.body.id == bodyId) {
                return i
            }
        }
        return undefined
    }
    private getCollidingObjects(): THREE.Object3D[] {
        let collidingBodiesId = []
        for (let ids of this.physics.collidingBodiesId) {
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
        let result = []
        for (let cBI of collidingBodiesId) {
            let index = this.getRobotComponentIndexByBodyId(cBI)
            if (index == undefined) continue
            result.push(this.robotComponents[index].object)
        }
        return result
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
    private async _click() {
        if (this.mouseRaycast.intersection == undefined) return

        switch (this.mode) {
            case Mode.Add: {
                await Utils.sleep(25)
                if (this.physics.isPlaceTestBodyColliding) return
                let position = Calculator.getPositionToPlaceComponent(this.mouseRaycast.intersection!)
                if (position == undefined) return

                let objectGeometry = new THREE.BoxGeometry(1, 1, 1)
                let objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00 })
                let object = new THREE.Mesh(objectGeometry, objectMaterial)
                object.position.set(position.x, position.y, position.z)
                this.addObject(object)
                this.dispatchEvent(this.onComponentPlace)
            } break;
            case Mode.Remove: {
                await Utils.sleep(25)
                this.graphicEffects.selectHighlightObject(this.mouseRaycast.intersection)
                if (this.mouseRaycast.intersection?.object != undefined) {
                    this.removeObject(this.mouseRaycast.intersection!.object)
                }
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
        this.physics.removeBody(this.robotComponents[index].body)
    }
    addObject(object: THREE.Object3D) {
        this.graphicContextElement.addObject(object)
        let body = this.physics.addBody(object)
        this.robotComponents.push(
            new RobotComponent(object, body, this.selectedRobotComponentType!))
    }
    updateObjectPosition(object: THREE.Object3D, position: THREE.Vector3) {
        let index = this.getRobotComponentIndexByObjectId(object.id)
        if (index == undefined) return
        this.robotComponents[index].object.position.copy(position)
        this.robotComponents[index].body.position.set(position.x, position.y, position.z)
    }
    updateObjectRotation(object: THREE.Object3D, rotation: THREE.Quaternion) {
        let index = this.getRobotComponentIndexByObjectId(object.id)
        if (index == undefined) return
        this.robotComponents[index].object.rotation.setFromQuaternion(rotation)
        this.robotComponents[index].body.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
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
class Physics {
    world: CANNON.World
    collidingBodiesId: [number, number][]

    placeTestBody: CANNON.Body | undefined
    isPlaceTestBodyColliding: boolean | undefined
    isPlaceTestEnabled: boolean
    placeTestCollisionCount: number

    constructor() {
        this.world = new CANNON.World()
        this.world.addEventListener("endContact", this._onCollisionExit.bind(this))
        this.world.addEventListener("beginContact", this._onCollisionEnter.bind(this))
        this.collidingBodiesId = []
        this.isPlaceTestEnabled = false
        this.placeTestCollisionCount = 0
    }
    enablePlaceTest(isEnabled: boolean) {
        if (this.isPlaceTestEnabled == isEnabled) return
        this.isPlaceTestEnabled = isEnabled
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
    addBody(mesh: THREE.Object3D): CANNON.Body {
        let xSize = 0.5
        let ySize = 0.5
        let zSize = 0.5

        let shape = new CANNON.Box(new CANNON.Vec3(xSize, ySize, zSize))
        let body = new CANNON.Body({
            position: new CANNON.Vec3(mesh.position.x,
                mesh.position.y,
                mesh.position.z),
            quaternion: new CANNON.Quaternion(mesh.quaternion.x,
                mesh.quaternion.y,
                mesh.quaternion.z,
                mesh.quaternion.w),
            shape: shape,
            mass: 0,
        })
        body.type = CANNON.BODY_TYPES.KINEMATIC
        this.world.addBody(body)
        return body
    }
    step() {
        this.world.fixedStep()
    }
    removeBody(body: CANNON.Body) {
        for (let bI = this.collidingBodiesId.length - 1; bI >= 0; bI--) {
            let collidingBodyAId = this.collidingBodiesId[bI][0]
            let collidingBodyBId = this.collidingBodiesId[bI][1]
            if (
                collidingBodyAId == body.id ||
                collidingBodyBId == body.id
            ) {
                this.collidingBodiesId.splice(bI, 1)
            }
        }
        this.world.removeBody(body)
    }
    private _onCollisionEnter(event: any) {
        let bodyA = event.bodyA
        let bodyB = event.bodyB
        if (bodyA == undefined || bodyB == undefined) {
            return
        }

        if (
            this.isPlaceTestEnabled &&
            this.placeTestBody != undefined &&
            (bodyA.id == this.placeTestBody.id || bodyB.id == this.placeTestBody.id)
        ) {
            this.placeTestCollisionCount += 1
            return
        }

        this.collidingBodiesId.push([bodyA.id, bodyB.id])
    }
    private _onCollisionExit(event: any) {
        if (event.bodyA == undefined || event.bodyB == undefined) {
            return
        }
        let exitedBodyAId = event.bodyA.id
        let exitedBodyBId = event.bodyB.id
        if (
            this.isPlaceTestEnabled &&
            this.placeTestBody != undefined &&
            (exitedBodyAId == this.placeTestBody.id || exitedBodyBId == this.placeTestBody.id)
        ) {
            this.placeTestCollisionCount -= 1
            return
        }
        for (let bI = this.collidingBodiesId.length - 1; bI >= 0; bI--) {
            let collidingBodyAId = this.collidingBodiesId[bI][0]
            let collidingBodyBId = this.collidingBodiesId[bI][1]
            if (
                collidingBodyAId == exitedBodyAId &&
                collidingBodyBId == exitedBodyBId ||
                collidingBodyBId == exitedBodyAId &&
                collidingBodyAId == exitedBodyBId
            ) {
                this.collidingBodiesId.splice(bI, 1)
            }
        }
    }
}
class RobotComponent {
    object: THREE.Object3D
    body: CANNON.Body
    robotComponentType: Comps.RobotComponentTypes
    constructor(
        newMesh: THREE.Object3D,
        newBody: CANNON.Body,
        newRobotComponentType: Comps.RobotComponentTypes,
    ) {
        this.object = newMesh
        this.body = newBody
        this.robotComponentType = newRobotComponentType
    }
    updatePosition(newPosition: THREE.Vector3) {
        this.object.position.copy(newPosition)
        this.body.position.set(newPosition.x, newPosition.y, newPosition.z)
    }
    remove(graphicContext: GraphicContext.CustomElement, world: CANNON.World) {
        graphicContext.removeObject(this.object)
        world.removeBody(this.body)
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
