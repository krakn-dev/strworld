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

export class CustomElement extends HTMLElement {
    gameGraphicsElement: HTMLDivElement
    private worker: Worker | undefined
    private graphicContextElement: GraphicContext.CustomElement
    private graphicObjects: GraphicObject[]
    private loader: GLTFLoader
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.gameGraphicsElement = this.shadowRoot!.getElementById("game-graphics") as HTMLDivElement
        this.graphicContextElement = this.shadowRoot!.getElementById("graphic-context") as GraphicContext.CustomElement
        this.loader = new GLTFLoader();
        this.graphicObjects = []
    }
    connectedCallback() {
        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("draco/");
        this.loader.setDRACOLoader(dracoLoader);
    }
    async updateGraphics(
        graphicChanges: Ser.GraphicChanges
    ) {
        let componentsByEntity = this.sortComponentsByEntity(graphicChanges.changedComponents)
        await this.createObjects(componentsByEntity, graphicChanges.addedEntitiesUid)
        this.changeObjects(componentsByEntity)
        this.removeObjects(graphicChanges.removedEntitiesUid)
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
        this.worker.postMessage(new Ser.Message(Ser.Messages.RefreshGraphics))
    }
    private removeObjects(
        removedEntitiesUid: number[]
    ) {
        for (let rEU of removedEntitiesUid) {
            for (let [gOI, gO] of this.graphicObjects.entries()) {
                if (rEU == gO.entityUid) {
                    this.graphicObjects.splice(gOI, 1)
                    break;
                }
            }
        }
    }
    private changeObjects(
        componentsByEntity: [number, ECS.Component[]][]
    ) {
        for (let cBE of componentsByEntity) {
            for (let gO of this.graphicObjects) {
                if (cBE[0] != gO.entityUid) continue

                for (let cC of cBE[1]) {
                    switch (cC.componentType) {
                        case Comps.ComponentTypes.Camera:
                            let cameraComponent = cC as Comps.Camera
                            let cameraObject = gO.object as THREE.PerspectiveCamera
                            cameraObject.far = cameraComponent.far
                            cameraObject.fov = cameraComponent.fov
                            cameraObject.near = cameraComponent.near
                            cameraObject.aspect = cameraComponent.aspect
                            cameraObject.updateProjectionMatrix()
                            break;
                        case Comps.ComponentTypes.Light:
                            let lightComponent = cC as Comps.Light
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
                            let colorComponent = cC as Comps.ShapeColor
                            let newMaterial = new THREE.MeshPhongMaterial(
                                { color: new THREE.Color(colorComponent.color) });
                            (gO.object as THREE.Mesh).material = newMaterial
                            break;
                        case Comps.ComponentTypes.Rotation:
                            let rotationComponent = cC as Comps.Rotation
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
                            let entityStateComponent = cC as Comps.EntityState
                            let animationToPlay = this.getAnimationToPlayByEntityStates(
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
                            let positionComponent = cC as Comps.Position
                            gO.object.position.x = positionComponent.x
                            gO.object.position.y = positionComponent.y
                            gO.object.position.z = positionComponent.z
                            break;
                    }
                }
            }
        }
    }
    private async createObjects(
        componentsByEntity: [number, ECS.Component[]][],
        newEntitiesUids: number[]
    ) {
        for (let cBE of componentsByEntity) {
            for (let nEU of newEntitiesUids) {
                if (nEU != cBE[0]) continue

                let shapeComponent = undefined
                let lightType = undefined
                let entityType = undefined

                for (let c of cBE[1]) {
                    if (c.componentType == Comps.ComponentTypes.Shape) {
                        shapeComponent = (c as Comps.Shape)
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
                                this.getModelNameByEntityType(entityType))

                            let obj = await this.loader
                                .parseAsync(await modelBlob.arrayBuffer(), "")

                            newGraphicObject = new GraphicObject(
                                obj.scene,
                                cBE[0],
                                obj.animations,
                                new THREE.AnimationMixer(obj.scene),
                            )
                        } break;

                    case Comps.EntityTypes.Camera: {
                        newGraphicObject = new GraphicObject(
                            new THREE.PerspectiveCamera(),
                            cBE[0])
                        this.graphicContextElement.camera = newGraphicObject.object as THREE.PerspectiveCamera
                    } break;
                    case Comps.EntityTypes.GeometricShape:
                    case Comps.EntityTypes.Robot:
                    case Comps.EntityTypes.RobotComponent: {
                        let material = new THREE.MeshPhongMaterial();
                        let geometry: THREE.BufferGeometry;
                        switch (shapeComponent!.shapeType) {
                            case Comps.ShapeTypes.Box: {
                                geometry = new THREE.BoxGeometry(
                                    shapeComponent!.size!.x,
                                    shapeComponent!.size!.y,
                                    shapeComponent!.size!.z);
                            } break;
                            case Comps.ShapeTypes.Cylinder: {
                                geometry = new THREE.CylinderGeometry(
                                    shapeComponent!.radiusTop,
                                    shapeComponent!.radiusBottom,
                                    shapeComponent!.height,
                                    shapeComponent!.numberOfSegments,
                                );
                            } break;
                        }
                        const mesh = new THREE.Mesh(geometry, material);
                        newGraphicObject = new GraphicObject(mesh, cBE[0])
                        newGraphicObject.object.castShadow = true
                        newGraphicObject.object.receiveShadow = true
                    } break;

                    case Comps.EntityTypes.Light: {
                        for (let c2 of cBE[1]) {
                            if (c2.componentType == Comps.ComponentTypes.Light) {
                                let lightType = (c2 as Comps.Light).lightType
                                switch (lightType) {
                                    case Comps.LightTypes.AmbientLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.AmbientLight(),
                                            cBE[0])
                                        break;
                                    case Comps.LightTypes.PointLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.PointLight(),
                                            cBE[0])
                                        newGraphicObject.object.castShadow = true
                                        break;
                                    case Comps.LightTypes.DirectionalLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.DirectionalLight(),
                                            cBE[0])
                                        newGraphicObject.object.castShadow = true
                                        break;
                                    case Comps.LightTypes.SpotLight:
                                        newGraphicObject = new GraphicObject(
                                            new THREE.SpotLight(),
                                            cBE[0])
                                        newGraphicObject.object.castShadow = true
                                        break;
                                }
                            }
                        }
                    } break;
                }
                if (newGraphicObject == undefined) continue
                newGraphicObject.entityType = entityType
                this.graphicObjects.push(newGraphicObject)
                this.graphicContextElement.addObject(newGraphicObject.object, newGraphicObject.animationMixer)
            }
        }
    }

    private sortComponentsByEntity(changedComponents: ECS.Component[]): [number, ECS.Component[]][] {
        let result: [number, ECS.Component[]][] = []
        for (let cC of changedComponents) {
            let isInserted = false
            for (let cBE of result) {
                if (cBE[0] == cC.entityUid) {
                    isInserted = true
                    cBE[1].push(cC)
                }
            }
            if (!isInserted) {
                result.push([cC.entityUid, [cC]])
            }
        }
        return result
    }
    private getModelNameByEntityType(entityType: Comps.EntityTypes): string {
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
            case Comps.EntityTypes.RobotComponent:
                throw "robot component is not an asset"
        }
    }
    private getAnimationToPlayByEntityStates(entityStates: Comps.EntityStates[]): string {
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
//        window.addEventListener("pointermove", this.onPointerMove.bind(this))
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

