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
        let skybox = this.createSkybox()
        this.mouseRaycast = new MouseRaycast(this.graphicContextElement.scene, skybox)
        this.graphicContextElement.addObject(skybox)
        this.updateInterval = setInterval(this._update.bind(this), 25)
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
    private _onStartedTransforming() {
        this.orbitControls.enabled = false
    }
    private _onStoppedTransforming() {
        this.orbitControls.enabled = true
    }
    private _update() {
        this.graphicEffects.intersection = this.mouseRaycast.intersection
        if (this.graphicEffects.isPlacePreview) {
            this.graphicEffects.updatePreviewObject()
            this.mouseRaycast.updatePreviewObjectId(this.graphicEffects.selectedObject?.id)
        } else {
            this.mouseRaycast.updatePreviewObjectId(undefined)
        }
        this.graphicEffects.updateMaterialColor()
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
        this.mouseRaycast.updateIntersection(this.robotComponents)
    }
    private _onMouseDown() {
        this.isMouseDown = true
    }
    private _onMouseUp(event: any) {
        if (!this.isOrbiting) {
            this._click()
            console.log(this.mouseRaycast.intersection?.object.id)
            console.log(this.transformControls.controls.object?.id)
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
        console.log(processor.id, "processor id")
    }
    updateMode(newMode: Mode) {
        this.mode = newMode
        switch (this.mode) {
            case Mode.Remove: {
                this.disableTransform()
                this.graphicEffects.setHighlightMode()
            } break;
            case Mode.Add: {
                this.disableTransform()
                this.graphicEffects.setPlacePreviewMode()
            } break;
            case Mode.Translate: {
                this.enableTransform()
                this.graphicEffects.setHighlightMode()
            } break;
            case Mode.Rotate: {
                this.enableTransform()
                this.graphicEffects.setHighlightMode()
            } break;
            case Mode.None: {
                // do nothing
            } break;
        }
    }
    private _click() {
        if (this.mouseRaycast.intersection == undefined) return

        switch (this.mode) {
            case Mode.Add: {
                this._add()
            } break;
            case Mode.Remove: {
                this._remove()
            } break;
            case Mode.Translate: {
                this._translate()
            } break;
            case Mode.Rotate: {
                this._rotate()
            } break;
        }
    }
    private async _rotate() {
        await Utils.sleep(25)
        this.graphicEffects.selectHighlightObject(this.mouseRaycast.intersection)
    }
    private async _translate() {
        await Utils.sleep(25)
        this.graphicEffects.selectHighlightObject(this.mouseRaycast.intersection)
        this.transformControls.attach(this.mouseRaycast.intersection!.object)
        this.transformControls.setTranslationMode()
    }
    private async _remove() {
        await Utils.sleep(25)
        this.graphicEffects.selectHighlightObject(this.mouseRaycast.intersection)
        this.dispatchEvent(this.onComponentRemove)
    }
    private async _add() {
        await Utils.sleep(25)
        let position = Calculator.getPositionToPlaceComponent(this.mouseRaycast.intersection!)
        if (position == undefined) return

        let objectGeometry = new THREE.BoxGeometry(1, 1, 1)
        let objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00, })
        let object = new THREE.Mesh(objectGeometry, objectMaterial)
        object.position.set(position.x, position.y, position.z)
        this.addObject(object)
        this.dispatchEvent(this.onComponentPlace)
    }
    private getGraphicRobotComponentIndexByObjectId(objectId: number): number | null {
        for (let [i, rGC] of this.robotComponents.entries()) {
            if (rGC.object.id == objectId) {
                return i
            }
        }
        return null
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
    addObject(mesh: THREE.Mesh) {
        this.graphicContextElement.addObject(mesh)
        let body = this.physics.addBody(mesh)
        this.robotComponents.push(
            new RobotComponent(mesh, body, this.selectedRobotComponentType!))
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
}
class GraphicEffects {
    private graphicContext: GraphicContext.CustomElement
    selectedObject: THREE.Object3D | undefined
    isPlacePreview: boolean
    intersection: THREE.Intersection<THREE.Object3D> | undefined
    x: number

    constructor(newGraphicContext: GraphicContext.CustomElement, newIsPlacePreview: boolean) {
        this.graphicContext = newGraphicContext
        this.isPlacePreview = newIsPlacePreview
        this.x = 0
    }
    updatePreviewObject() {
        if (this.intersection == undefined && this.selectedObject != undefined) {
            this.graphicContext.removeObject(this.selectedObject)
            this.selectedObject = undefined
            console.log("removing")
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
            console.log("removing")
            return
        }
        this.selectedObject.position.set(position.x, position.y, position.z)
    }
    updateMaterialColor() {
        if (this.selectedObject == undefined) return

        let hex = (Math.trunc((Math.sin(this.x * 0.15) + 1.5) * 5).toString(16))
        hex = (parseInt("0x" + hex)).toString(16) + "f";
        ((this.selectedObject as THREE.Mesh).material as any).color.set(parseInt("0xff" + hex + "ff"))
        this.x += 1;
    }
    selectHighlightObject(intersection: THREE.Intersection<THREE.Object3D> | undefined) {
        if (intersection?.object == undefined) {
            return
        }
        let object = intersection?.object as THREE.Mesh
        this.selectedObject = object
    }
    setPlacePreviewMode() {
        if (this.isPlacePreview) return
        if (this.selectedObject != undefined) {
            ((this.selectedObject as THREE.Mesh).material as any).color.set(0xffffff)
            this.selectedObject = undefined
            //            this.objectMaterial = undefined
        }
        this.isPlacePreview = true
    }
    setHighlightMode() {
        if (!this.isPlacePreview) return
        if (this.selectedObject != undefined) {
            this.graphicContext.removeObject(this.selectedObject)
            this.selectedObject = undefined
        }
        this.isPlacePreview = false
    }
}
class MouseRaycast {
    private raycaster = new THREE.Raycaster();
    private mouse3DIntersections: THREE.Intersection<THREE.Object3D>[]
    private scene: THREE.Scene
    private pointer: THREE.Vector2 | undefined
    private camera: THREE.PerspectiveCamera | undefined
    private transformControls: THREE.Object3D | undefined
    private previewObjectId: number | undefined
    private skybox: THREE.Object3D
    allIntersections: THREE.Intersection<THREE.Object3D>[]
    intersection: THREE.Intersection<THREE.Object3D> | undefined

    constructor(newScene: THREE.Scene, newSkybox: THREE.Object3D) {
        this.intersection = undefined
        this.allIntersections = []
        this.mouse3DIntersections = []
        this.scene = newScene
        this.skybox = newSkybox
    }
    updateTransformControls(newTransformControls: THREE.Object3D) {
        this.transformControls = newTransformControls
    }
    updateCamera(newCamera: THREE.PerspectiveCamera) {
        this.camera = newCamera
    }
    updatePreviewObjectId(newId: number | undefined) {
        this.previewObjectId = newId
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
                }
            }
        }
        if (!isIntersectionFound) {
            this.intersection = undefined
        }
    }
}
class Physics {
    world: CANNON.World
    constructor() {
        this.world = new CANNON.World()
    }
    addBody(mesh: THREE.Mesh): CANNON.Body {
        let boundingBox = new THREE.Box3().setFromObject(mesh)
        let xSize = boundingBox.max.x - boundingBox.min.x
        let ySize = boundingBox.max.y - boundingBox.min.y
        let zSize = boundingBox.max.z - boundingBox.min.z

        let shape = new CANNON.Box(new CANNON.Vec3(xSize / 2, ySize / 2, zSize / 2))
        let body = new CANNON.Body({
            position: new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
            shape: shape
        })
        body.addEventListener("collide", this._onCollision.bind(this))
        this.world.addBody(body)
        return body
    }
    _onCollision() {
        console.log('collision')
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
    static getPositionToPlaceComponent(intersection: THREE.Intersection<THREE.Object3D>): THREE.Vector3 | undefined {
        if (intersection.face == undefined) {
            return undefined
        }
        return new THREE.Vector3(
            Number(((intersection.face!.normal!.x * 0.5) + intersection.point.x).toFixed()),
            Number(((intersection.face!.normal!.y * 0.5) + intersection.point.y).toFixed()),
            Number(((intersection.face!.normal!.z * 0.5) + intersection.point.z).toFixed()))
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
