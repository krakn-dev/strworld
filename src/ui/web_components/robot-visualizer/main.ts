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
import * as OrbitControls from "three/examples/jsm/controls/OrbitControls.js"
import { Vec3 } from "cannon-es";

export class CustomElement extends HTMLElement {
    private robotVisualizerElement: HTMLDivElement
    private graphicContextElement: GraphicContext.CustomElement
    private robotGraphicComponents: RobotGraphicComponent[]
    private isMouseDown: boolean
    private isOrbiting: boolean
    private previewObject: THREE.Object3D | undefined
    private raycaster = new THREE.Raycaster();
    private pointer: THREE.Vector2 | undefined
    private mouse3DIntersections: THREE.Intersection<THREE.Object3D>[]
    private updateMouseRaycastInterval: any | undefined
    private onComponentPlace: CustomEvent
    private onComponentRemove: CustomEvent
    private selectedRobotComponentType: Comps.RobotComponentTypes | undefined
    private spatialHash: SpatialHash

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotVisualizerElement = this.shadowRoot!.getElementById("robot-visualizer") as HTMLDivElement
        this.graphicContextElement = this.shadowRoot!.getElementById("graphic-context") as GraphicContext.CustomElement
        this.onComponentPlace = new CustomEvent("componentplaced", { bubbles: false, cancelable: true, composed: true })
        this.onComponentRemove = new CustomEvent("componentremoved", { bubbles: false, cancelable: true, composed: true, detail: {} })
        this.robotGraphicComponents = []
        this.mouse3DIntersections = []
        this.isMouseDown = false
        this.isOrbiting = false
        this.spatialHash = new SpatialHash()
    }
    connectedCallback() {
        this.setupScene()
        this.robotVisualizerElement.addEventListener("mousedown", this._onMouseDown.bind(this))
        this.robotVisualizerElement.addEventListener("mousemove", this._onMouseMove.bind(this))
        this.robotVisualizerElement.addEventListener("mouseup", this._onMouseUp.bind(this))
        this.updateMouseRaycastInterval = setInterval(this.updateMouseRaycast.bind(this), 25)
    }
    disconnectedCallback() {
        clearInterval(this.updateMouseRaycastInterval)
    }
    updateSelectedRobotComponentType(newRobotComponentType: Comps.RobotComponentTypes | undefined) {
        this.selectedRobotComponentType = newRobotComponentType
        if (this.previewObject != undefined) {
            this.graphicContextElement.removeObject(this.previewObject)
            this.previewObject = undefined
        }
    }
    private setupScene() {
        let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
        let orbit = new OrbitControls.OrbitControls(camera, this.graphicContextElement.renderer.domElement)
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
        if (event.button != 2 || this.previewObject == undefined) return
        await Utils.sleep(25)
        let intersection = this.getIntersection()
        if (intersection == undefined) return
        let componentGeometry = new THREE.BoxGeometry(1, 1, 1)
        let componentMaterial = new THREE.MeshPhongMaterial({ color: 0x00cc00, })
        let component = new THREE.Mesh(componentGeometry, componentMaterial)
        this.spatialHash.insert(component)
        component.position.set(
            this.previewObject!.position.x,
            this.previewObject!.position.y,
            this.previewObject!.position.z)
        this.graphicContextElement.addObject(component)
        this.robotGraphicComponents.push(new RobotGraphicComponent(component, this.selectedRobotComponentType!))
        this.dispatchEvent(this.onComponentPlace)
    }
    private async removeComponent(event: any) {
        if (event.button != 0) return
        await Utils.sleep(25)
        let intersection = this.getIntersection()
        if (intersection == undefined) return
        this.graphicContextElement.removeObject(intersection.object)
        console.log(this.robotGraphicComponents[this.getRobotGraphicComponentIndexByObjectId(intersection.object.id)!].robotComponentType)
        this.dispatchEvent(this.onComponentRemove)
    }
    private getRobotGraphicComponentIndexByObjectId(objectId: number): number | null {
        for (let [i, rGC] of this.robotGraphicComponents.entries()) {
            if (rGC.object.id == objectId) {
                return i
            }
        }
        return null
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
            this.mouse3DIntersections.length == 0
        ) {
            return undefined
        }
        if (this.mouse3DIntersections[0].object.id != this.previewObject?.id) {
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
            if (this.selectedRobotComponentType == undefined) return
            this.robotGraphicComponents.push(new RobotGraphicComponent(component, this.selectedRobotComponentType))
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

class SpatialHash {
    hash: Map<Utils.Vector3, THREE.Object3D>
    constructor() {
        this.hash = new Map()
    }
    insert(newObject: THREE.Object3D) {
        if (newObject instanceof THREE.Mesh) {
            const positionAttribute = newObject.geometry.getAttribute('position');

            const vertex = new THREE.Vector3();

            for (let i = 0; i < positionAttribute.count; i++) {

                vertex.fromBufferAttribute(positionAttribute, i); // read vertex

                // do something with vertex
                //
                positionAttribute.setXYZ(i, vertex.x + 1, vertex.y, vertex.z); // write coordinates back
            }

        }
    }
    remove(object: THREE.Object3D) {

    }
}
class RobotGraphicComponent {
    object: THREE.Object3D
    robotComponentType: Comps.RobotComponentTypes
    constructor(
        newMesh: THREE.Object3D,
        newRobotComponentType: Comps.RobotComponentTypes,
    ) {
        this.object = newMesh
        this.robotComponentType = newRobotComponentType
    }
}
