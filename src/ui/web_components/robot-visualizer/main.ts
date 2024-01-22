import html from "./main.html"
import css from "./main.css"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import * as Utils from '../../../utils';
import * as Comps from '../../../ecs/components';
import * as Ser from "../../../serialization"
import * as ECS from "../../../ecs/ecs"
import * as GraphicContext from '../graphic-context/main';
import * as Ctrls from "three/examples/jsm/controls/OrbitControls.js"

export class CustomElement extends HTMLElement {
    private robotVisualizerElement: HTMLDivElement
    private graphicContextElement: GraphicContext.CustomElement
    private graphicComponents: GraphicObject[]
    private isMouseDown: boolean
    private isOrbiting: boolean
    private previewObject: THREE.Object3D | undefined
    private raycaster = new THREE.Raycaster();
    private pointer: THREE.Vector2 | undefined
    private mouse3DIntersections: THREE.Intersection<THREE.Object3D>[]
    private updateMouseRaycastInterval: any | undefined

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotVisualizerElement = this.shadowRoot!.getElementById("robot-visualizer") as HTMLDivElement
        this.graphicContextElement = this.shadowRoot!.getElementById("graphic-context") as GraphicContext.CustomElement
        this.graphicComponents = []
        this.mouse3DIntersections = []
        this.isMouseDown = false
        this.isOrbiting = false
    }
    connectedCallback() {
        this.setupScene()
        this.robotVisualizerElement.addEventListener("mousedown", this._onMouseDown.bind(this))
        this.robotVisualizerElement.addEventListener("mousemove", this._onMouseMove.bind(this))
        this.robotVisualizerElement.addEventListener("mouseup", this._onMouseUp.bind(this))
        this.updateMouseRaycastInterval = setInterval(this.updateMouseRaycast.bind(this), 10)
    }
    disconnectedCallback() {
        clearInterval(this.updateMouseRaycastInterval)
    }
    private setupScene() {
        let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
        let orbit = new Ctrls.OrbitControls(camera, this.graphicContextElement.renderer.domElement)
        let directionalLight = new THREE.DirectionalLight(0xffffff, 2)
        let ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
        let processorGeometry = new THREE.BoxGeometry(1, 1, 1)
        let processorMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00 })
        let processor = new THREE.Mesh(processorGeometry, processorMaterial)
        camera.position.set(-2, 2, 5)
        directionalLight.position.set(3, 3, 3)
        directionalLight.castShadow = true
        orbit.update()

        this.graphicContextElement.camera = camera
        this.graphicContextElement.addObject(directionalLight)
        this.graphicContextElement.addObject(processor)
        this.graphicContextElement.addObject(ambientLight)
    }
    private async placeComponent(event: any) {
        if (event.button != 2) return
        await Utils.sleep(10)
        let intersection = this.getIntersection()
        if (intersection == undefined) return
        let componentGeometry = new THREE.BoxGeometry(1, 1, 1)
        let componentMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00, })
        let component = new THREE.Mesh(componentGeometry, componentMaterial)
        component.position.set(
            this.previewObject!.position.x,
            this.previewObject!.position.y,
            this.previewObject!.position.z)
        this.graphicContextElement.addObject(component)
    }
    private async removeComponent(event: any) {
        if (event.button != 0) return
        await Utils.sleep(10)
        let intersection = this.getIntersection()
        if (intersection == undefined) return
        this.graphicContextElement.removeObject(intersection.object)
    }
    private getPositionToPlaceComponent(intersection: THREE.Intersection<THREE.Object3D>): THREE.Vector3 {
        return new THREE.Vector3(
            Number(((intersection.face!.normal!.x * 0.5) + intersection.point.x).toFixed()),
            Number(((intersection.face!.normal!.y * 0.5) + intersection.point.y).toFixed()),
            Number(((intersection.face!.normal!.z * 0.5) + intersection.point.z).toFixed())
        )
    }
    private getIntersection(): THREE.Intersection<THREE.Object3D> | undefined {
        if (
            this.mouse3DIntersections.length == 0 ||
            this.previewObject == undefined
        ) {
            return undefined
        }
        if (this.mouse3DIntersections[0].object.id != this.previewObject.id) {
            return this.mouse3DIntersections[0]
        } else {
            return this.mouse3DIntersections[1]
        }
    }
    private updateComponentPreview() {
        if (
            this.previewObject != undefined &&
            this.mouse3DIntersections.length == 0 ||
            (this.mouse3DIntersections.length == 1 &&
                this.mouse3DIntersections[0].object.id == this.previewObject?.id)
        ) {
            this.graphicContextElement.removeObject(this.previewObject!)
            this.previewObject = undefined
            return
        }
        if (this.previewObject == undefined) {
            let componentGeometry = new THREE.BoxGeometry(1, 1, 1)
            let componentMaterial = new THREE.MeshPhongMaterial({
                color: 0x00cc00,
                transparent: true, opacity: 0.5
            })
            let component = new THREE.Mesh(componentGeometry, componentMaterial)
            this.previewObject = component
            this.graphicContextElement.addObject(component)
        }
        let intersection = this.getIntersection()
        if (intersection == undefined) return

        let position = this.getPositionToPlaceComponent(intersection)
        this.previewObject.position.set(position.x, position.y, position.z)
    }
    private _onMouseMove(event: any) {
        if (this.isMouseDown) {
            this.isOrbiting = true
        }
        this.pointer = new THREE.Vector2()
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }
    private updateMouseRaycast() {
        if (
            this.pointer == undefined ||
            this.graphicContextElement.camera == undefined
        ) {
            return
        }
        this.raycaster.setFromCamera(this.pointer, this.graphicContextElement.camera);
        this.mouse3DIntersections = this.raycaster.intersectObjects(this.graphicContextElement.scene.children)
        this.updateComponentPreview()
    }
    private _onMouseDown() {
        this.isMouseDown = true
    }
    private _onMouseUp(event: any) {
        if (!this.isOrbiting) {
            this.placeComponent(event)
            this.removeComponent(event)
        }
        this.isMouseDown = false
        this.isOrbiting = false
    }
}

class GraphicObject {
    object: THREE.Object3D
    entityUid: number
    entityType: Comps.EntityTypes | undefined
    animationClips: THREE.AnimationClip[] | undefined
    animationMixer: THREE.AnimationMixer | undefined
    constructor(
        newMesh: THREE.Object3D,
        newEntityUid: number,
        newAnimationClips: THREE.AnimationClip[] | undefined = undefined,
        newAnimationMixer: THREE.AnimationMixer | undefined = undefined,
    ) {
        this.object = newMesh
        this.entityUid = newEntityUid
        this.animationClips = newAnimationClips
        this.animationMixer = newAnimationMixer
    }
}

//    raycaster = new THREE.Raycaster();
//    pointer: THREE.Vector2 | undefined = undefined;
//    onPointerMove(event: any) {
//        // calculate pointer position in normalized device coordinates
//        // (-1 to +1) for both components
//        this.pointer = new THREE.Vector2()
//        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
//        this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
//    }
//    constructor(parentElement: HTMLElement) {
//    }
//    gameGraphicsLoop() {
//        if (this.pointer == undefined) return
//        this.raycaster.setFromCamera(this.pointer, this.camera);
//        const intersects = this.raycaster.intersectObjects(this.scene.children);
//        if (intersects.length == 0) return
//        let point = intersects[0].point
//        let mouseCoordinates = new THREE.Vector3(
//            Math.round(point.x * 100) / 100,
//            Math.round(point.y * 100) / 100,
//            Math.round(point.z * 100) / 100,
//        )
//        console.log(mouseCoordinates)
//    }
//}

