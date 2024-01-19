import html from "./main.html"
import css from "./main.css"
import * as THREE from 'three';

export class CustomElement extends HTMLElement {
    camera: THREE.Camera | undefined
    graphicContextElement: HTMLDivElement
    private scene: THREE.Scene
    private clock: THREE.Clock
    private renderer: THREE.Renderer
    private animationMixers: [number, THREE.AnimationMixer][]

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.graphicContextElement = this.shadowRoot!.getElementById("graphic-context") as HTMLDivElement
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.camera = undefined
        this.clock = new THREE.Clock()
        this.animationMixers = []
    }
    connectedCallback() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        (this.renderer as any).shadowMap.enabled = true;
        this.graphicContextElement.append(this.renderer.domElement);
        window.addEventListener("resize", this.onWindowResize.bind(this))
        this.renderLoop()
    }
    addObject(object: THREE.Object3D, animationMixer: THREE.AnimationMixer | undefined = undefined) {
        this.scene.add(object)
        if (animationMixer != undefined) {
            this.animationMixers.push([object.id, animationMixer])
        }
    }
    removeObject(object: THREE.Object3D) {
        let removeAtIndex: number | undefined = undefined
        for (let [aMI, aM] of this.animationMixers.entries()) {
            if (aM[0] == object.id) {
                removeAtIndex = aMI
                break;
            }
        }
        if (removeAtIndex != undefined) {
            this.animationMixers.splice(removeAtIndex, 1)
        }
        this.scene.remove(object)
    }
    private onWindowResize() {
        if (this.camera == undefined) return
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.renderer.setSize(width, height);
        let perspectiveCamera = this.camera as THREE.PerspectiveCamera
        perspectiveCamera.aspect = width / height;
        perspectiveCamera.updateProjectionMatrix();
    }
    private renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        let delta = this.clock.getDelta()
        if (this.camera == undefined) return
        for (let aM of this.animationMixers) {
            aM[1].update(delta)
        }
        this.renderer.render(this.scene, this.camera);
    }
}

