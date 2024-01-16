import html from "./main.html"
import css from "./main.css"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import * as Utils from '../../../utils';
import * as Comps from '../../../ecs/components';
import * as Ser from "../../../serialization"
import * as ECS from "../../../ecs/ecs"

export class CustomElement extends HTMLElement {
    gameGraphicsElement: HTMLDivElement
    graphicChangesHandler: GraphicChangesHandler
    world: World
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.gameGraphicsElement = this.shadowRoot!.getElementById("game-graphics") as HTMLDivElement

        this.graphicChangesHandler = new GraphicChangesHandler()
        this.world = new World(this.gameGraphicsElement)
    }
    updateGraphics(newData: Ser.GraphicChanges) {
        this.graphicChangesHandler.run(this.world, newData)
    }
    connectedCallback() {
        this.world.renderLoop()
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
        case Comps.EntityTypes.GeometricShape:
            throw "geometric shape is not an asset"
        case Comps.EntityTypes.Robot:
            throw "robot shape is not an asset"
        case Comps.EntityTypes.Wheel:
            throw "wheel is not an asset"
    }
}
function getAnimationToPlayByEntityStates(entityStates: Comps.EntityStates[]): string {
    let animationToPlay: string | undefined = undefined
    for (let eS of entityStates) {
        if (eS == Comps.EntityStates.Run) {
            animationToPlay = "run"
        }
        if (eS == Comps.EntityStates.Idle) {
            animationToPlay = "relax"
        }
    }
    if (animationToPlay == undefined) {
        console.log("defaulting animation")
        animationToPlay = "relax"
    }
    return animationToPlay
}

export class GraphicChangesHandler {
    private loader: GLTFLoader
    constructor() {
        this.loader = new GLTFLoader();
        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("draco/");
        this.loader.setDRACOLoader(dracoLoader);
    }
    private changeGraphicObjectFromComponents(
        graphicObjects: GraphicObject[],
        entityComponents: ECS.EntityComponents[]
    ) {
        for (let eC of entityComponents) {
            for (let gO of graphicObjects) {
                if (eC.entityUid != gO.entityUid) continue

                for (let c of eC.components) {
                    switch (c.componentType) {
                        case Comps.ComponentTypes.Camera:
                            let cameraComponent = c as Comps.Camera
                            let cameraObject = gO.object as THREE.PerspectiveCamera
                            cameraObject.far = cameraComponent.far
                            cameraObject.fov = cameraComponent.fov
                            cameraObject.near = cameraComponent.near
                            cameraObject.aspect = cameraComponent.aspect
                            cameraObject.updateProjectionMatrix()
                            break;
                        case Comps.ComponentTypes.Light:
                            let lightComponent = c as Comps.Light
                            switch (lightComponent.lightType) {
                                case Comps.LightTypes.AmbientLight: {
                                    let lightObject = gO.object as THREE.AmbientLight
                                    lightObject.intensity = lightComponent.intensity
                                    lightObject.color = new THREE.Color(lightComponent.color)
                                } break;
                                case Comps.LightTypes.PointLight: {
                                    let lightObject = gO.object as THREE.PointLight
                                    lightObject.intensity = lightComponent.intensity
                                    lightObject.color = new THREE.Color(lightComponent.color)
                                } break;
                                case Comps.LightTypes.DirectionalLight: {
                                    let lightObject = gO.object as THREE.DirectionalLight
                                    lightObject.intensity = lightComponent.intensity
                                    lightObject.color = new THREE.Color(lightComponent.color)
                                } break;
                                case Comps.LightTypes.SpotLight: {
                                    let lightObject = gO.object as THREE.SpotLight
                                    lightObject.color = new THREE.Color(lightComponent.color)
                                    lightObject.intensity = lightComponent.intensity
                                    lightObject.decay = lightComponent.decay
                                    lightObject.distance = lightComponent.distance
                                } break;
                            }
                            break;
                        case Comps.ComponentTypes.ShapeColor:
                            let colorComponent = c as Comps.ShapeColor
                            let newMaterial = new THREE.MeshPhongMaterial(
                                { color: new THREE.Color(colorComponent.color) });
                            (gO.object as THREE.Mesh).material = newMaterial
                            break;
                        case Comps.ComponentTypes.Rotation:
                            let rotationComponent = c as Comps.Rotation
                            gO.object.setRotationFromQuaternion(
                                new THREE.Quaternion(
                                    rotationComponent.x,
                                    rotationComponent.y,
                                    rotationComponent.z,
                                    rotationComponent.w,
                                )
                            )
                            break;
                        case Comps.ComponentTypes.EntityState:
                            let entityStateComponent = c as Comps.EntityState
                            let animationToPlay = getAnimationToPlayByEntityStates(
                                entityStateComponent.states)

                            if (
                                gO.animationClips != undefined &&
                                gO.animationMixer != undefined
                            ) {
                                let animationClip = THREE
                                    .AnimationClip
                                    .findByName(gO.animationClips, animationToPlay)

                                let action = gO.animationMixer.clipAction(animationClip)
                                gO.animationMixer.stopAllAction()
                                action.play()

                            }
                            break;
                        case Comps.ComponentTypes.Position:
                            let positionComponent = c as Comps.Position
                            gO.object.position.x = positionComponent.x
                            gO.object.position.y = positionComponent.y
                            gO.object.position.z = positionComponent.z
                            break;
                    }
                }
            }
        }
    }
    private async createGraphicObjectFromComponents(
        world: World,
        entitiesComponents: ECS.EntityComponents[],
        newEntitiesUids: number[]
    ) {
        for (let eC of entitiesComponents) {
            for (let nEU of newEntitiesUids) {
                if (nEU != eC.entityUid) continue

                let boxShapeComponent = undefined
                let lightType = undefined
                let entityType = undefined

                for (let c of eC.components) {
                    if (c.componentType == Comps.ComponentTypes.Shape) {
                        boxShapeComponent = (c as Comps.Shape)
                    }
                    if (c.componentType == Comps.ComponentTypes.EntityType) {
                        entityType = (c as Comps.EntityType).entityType
                    }
                    if (c.componentType == Comps.ComponentTypes.Light) {
                        lightType = (c as Comps.Light).lightType
                    }
                }

                let newGraphicObject: GraphicObject | undefined = undefined
                switch (entityType) {
                    case Comps.EntityTypes.Stickman:
                    case Comps.EntityTypes.Grass:
                    case Comps.EntityTypes.Dog:
                        {
                            let modelBlob: Blob = await Utils.AssetFetchCache.fetch(
                                getModelNameByEntityType(entityType))

                            let obj = await this.loader
                                .parseAsync(await modelBlob.arrayBuffer(), "")

                            newGraphicObject = new GraphicObject(
                                obj.scene,
                                eC.entityUid,
                                obj.animations,
                                new THREE.AnimationMixer(obj.scene),
                            )
                        } break;

                    case Comps.EntityTypes.Camera: {
                        newGraphicObject = new GraphicObject(
                            new THREE.PerspectiveCamera(),
                            eC.entityUid)
                        world.camera = newGraphicObject.object as THREE.PerspectiveCamera
                    } break;

                    case Comps.EntityTypes.GeometricShape: {
                        let material = new THREE.MeshPhongMaterial();
                        let geometry: THREE.BufferGeometry;
                        switch (boxShapeComponent!.shapeType) {
                            case Comps.ShapeTypes.Box: {
                                geometry = new THREE.BoxGeometry(
                                    boxShapeComponent!.size!.x,
                                    boxShapeComponent!.size!.y,
                                    boxShapeComponent!.size!.z);
                            } break;
                            case Comps.ShapeTypes.Cylinder: {
                                geometry = new THREE.CylinderGeometry(
                                    boxShapeComponent!.radiusTop,
                                    boxShapeComponent!.radiusBottom,
                                    boxShapeComponent!.height,
                                    boxShapeComponent!.numberOfSegments,
                                );
                            } break;
                        }
                        const mesh = new THREE.Mesh(geometry, material);
                        newGraphicObject = new GraphicObject(mesh, eC.entityUid)
                        newGraphicObject.object.castShadow = true
                        newGraphicObject.object.receiveShadow = true
                    } break;

                    case Comps.EntityTypes.Light: {
                        for (let c2 of eC.components) {
                            if (c2.componentType == Comps.ComponentTypes.Light) {
                                let lightType = (c2 as Comps.Light).lightType
                                switch (lightType) {
                                    case Comps.LightTypes.AmbientLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.AmbientLight(),
                                            eC.entityUid)
                                        break;
                                    case Comps.LightTypes.PointLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.PointLight(),
                                            eC.entityUid)
                                        newGraphicObject.object.castShadow = true
                                        break;
                                    case Comps.LightTypes.DirectionalLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.DirectionalLight(),
                                            eC.entityUid)
                                        newGraphicObject.object.castShadow = true
                                        break;
                                    case Comps.LightTypes.SpotLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.SpotLight(),
                                            eC.entityUid)
                                        newGraphicObject.object.castShadow = true
                                        break;
                                }
                            }
                        }
                    } break;
                }
                if (newGraphicObject == undefined) continue
                newGraphicObject.entityType = entityType
                world.graphicObjects.push(newGraphicObject)
                world.scene.add(newGraphicObject.object)
            }
        }
    }

    private createEntityComponents(changedComponents: ECS.Component[]): ECS.EntityComponents[] {
        let result: ECS.EntityComponents[] = []
        for (let cC of changedComponents) {
            let isInserted = false
            for (let r of result) {
                if (r.entityUid == cC.entityUid) {
                    isInserted = true
                    r.components.push(cC)
                }
            }
            if (!isInserted) {
                let newEntityComponents = new ECS.EntityComponents(cC.entityUid)
                newEntityComponents.components.push(cC)
                result.push(newEntityComponents)
            }
        }
        return result
    }
    async run(
        world: World,
        graphicChanges: Ser.GraphicChanges
    ) {
        let entitiesComponents = this.createEntityComponents(graphicChanges.changedComponents)

        await this.createGraphicObjectFromComponents(
            world,
            entitiesComponents,
            graphicChanges.addedEntitiesUid)

        this.changeGraphicObjectFromComponents(world.graphicObjects, entitiesComponents)

        for (let rEU of graphicChanges.removedEntitiesUid) {
            for (let [gOI, gO] of world.graphicObjects.entries()) {
                if (rEU == gO.entityUid) {
                    world.scene.remove(world.graphicObjects[gOI].object)
                    world.graphicObjects.splice(gOI, 1)
                    break;
                }
            }
        }
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

export class World {
    graphicObjects: GraphicObject[]
    scene: THREE.Scene
    renderer: THREE.Renderer
    camera: THREE.Camera | undefined
    clock: THREE.Clock
    constructor(parentElement: HTMLElement) {
        this.graphicObjects = []
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.camera = undefined
        this.clock = new THREE.Clock()

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        (this.renderer as any).shadowMap.enabled = true;
        parentElement.append(this.renderer.domElement);
        window.addEventListener("resize", this.onWindowResize.bind(this))
    }
    private onWindowResize() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        this.renderer.setSize(width, height);
        if (this.camera != undefined) {
            let perspectiveCamera = this.camera as THREE.PerspectiveCamera
            perspectiveCamera.aspect = width / height;
            perspectiveCamera.updateProjectionMatrix();
        }
    }
    renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));

        let delta = this.clock.getDelta()
        if (this.camera == undefined) {
            return
        }
        for (let gO of this.graphicObjects) {
            if (
                gO.animationClips != undefined &&
                gO.animationMixer != undefined
            ) {
                gO.animationMixer.update(delta)
            }
        }
        this.renderer.render(this.scene, this.camera);
    }
}

