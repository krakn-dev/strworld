import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import * as Utils from './utils';
import * as Comps from './components';
import * as Ser from "./serialization"

export class GraphicChangesHandler {
    loader: GLTFLoader
    constructor() {
        this.loader = new GLTFLoader();
        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("draco/");
        this.loader.setDRACOLoader(dracoLoader);
    }

    async run(
        world: World,
        graphicChanges: Ser.GraphicChanges
    ) {
        for (let cGP of graphicChanges.changedGraphicProperties) {
            for (let gO of world.graphicObjects) {
                if (cGP.entityUid == gO.entityUid) {
                    if (cGP.isPositionChanged) {
                        gO.mesh.position.x = cGP.position.x
                        gO.mesh.position.y = cGP.position.y
                    }
                }
            }
        }
        for (let rGP of graphicChanges.removedGraphicProperties) {
            for (let [gOI, gO] of world.graphicObjects.entries()) {
                if (rGP.entityUid == gO.entityUid) {
                    world.graphicObjects.splice(gOI, 1)
                    break;
                }
            }
        }
        for (let aGP of graphicChanges.addedGraphicProperties) {
            let modelBlob: Blob = await Utils.AssetFetchCache.fetch(
                getModelNameByEntityType(aGP.entityType))

            this.loader
                .parse(await modelBlob.arrayBuffer(), "", (obj) => {
                    let graphicObject = new GraphicObject(
                        obj.scene,
                        obj.animations,
                        new THREE.AnimationMixer(obj.scene),
                        aGP.entityUid
                    )
                    world.graphicObjects.push(graphicObject)
                })
        }
    }
}

function getModelNameByEntityType(entityType: Comps.EntityTypes): string {
    switch (entityType) {
        case Comps.EntityTypes.Stickman:
            return "stickman.glb"
        case Comps.EntityTypes.Grass:
            return "grass.glb"
        case Comps.EntityTypes.Dog:
            return "dog.glb"
        case Comps.EntityTypes.Camera:
            throw "camera is not an asset"
        case Comps.EntityTypes.Light:
            throw "light is not an asset"
    }
}

export class GraphicObject {
    mesh: THREE.Group<THREE.Object3DEventMap>
    entityUid: number
    animationClips: THREE.AnimationClip[]
    animationMixer: THREE.AnimationMixer
    constructor(
        newMesh: THREE.Group<THREE.Object3DEventMap>,
        newAnimationClips: THREE.AnimationClip[],
        newAnimationMixer: THREE.AnimationMixer,
        newEntityUid: number
    ) {
        this.entityUid = newEntityUid
        this.mesh = newMesh
        this.animationClips = newAnimationClips
        this.animationMixer = newAnimationMixer
    }
}

export class World {
    graphicObjects: GraphicObject[]
    scene: THREE.Scene
    renderer: THREE.Renderer
    camera: THREE.Camera | undefined
    constructor() {
        this.graphicObjects = []
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer()
        this.camera = undefined
    }
    setup() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    renderLoop() {
        requestAnimationFrame(this.renderLoop);
        if (this.camera == undefined) {
            console.log("no camera found")
            return
        }
        this.renderer.render(this.scene, this.camera);
    }
}

