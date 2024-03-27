import html from "./main.html"
import css from "./main.css"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import * as Utils from '../../../../utils';
import * as Comps from '../../../../ecs/components';
import * as Ser from "../../../../serialization"
import * as ECS from "../../../../ecs/ecs"
import * as GraphicContext from '../../shared/graphic-context/main';

export class CustomElement extends HTMLElement {
    gameGraphicsElement: HTMLDivElement
    private worker: Worker | undefined
    private graphicContextElement: GraphicContext.CustomElement
    private graphicEntities: Map<number, GraphicEntity>
    private loader: GLTFLoader
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.gameGraphicsElement = this.shadowRoot!.getElementById("game-graphics") as HTMLDivElement
        this.graphicContextElement = this.shadowRoot!.getElementById("graphic-context") as GraphicContext.CustomElement
        this.loader = new GLTFLoader();
        this.graphicEntities = new Map()
    }
    connectedCallback() {
        let dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("draco/");
        this.loader.setDRACOLoader(dracoLoader);
    }
    async updateGraphics(graphicChanges: Ser.GraphicChanges) {
        await this.createGraphicEntities(graphicChanges.addedEntitiesUid, graphicChanges.addedComponents)
        this.updateGraphicEntities(graphicChanges.changedComponents)
        this.removeGraphicEntities(graphicChanges.removedEntitiesUid)
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
    }
    private async createGraphicEntities(addedEntitiesUid: number[], addedComponents: ECS.Component[]) {
        for (let aEUid of addedEntitiesUid) {
            this.graphicEntities.set(aEUid, new GraphicEntity(aEUid))
        }
        for (let aC of addedComponents) {
            let graphicEntity = this.graphicEntities.get(aC.entityUid)
            if (graphicEntity == undefined) {
                continue
            };

            switch (aC.componentType) {
                case Comps.ComponentTypes.EntityType: {
                    if (this.graphicEntities.get(aC.entityUid)?.object != undefined) continue
                    let entityTypeComponent = aC as Comps.EntityType
                    switch (entityTypeComponent.entityType) {
                        case Comps.EntityTypes.Character:
                        //let modelBlob: Blob = await Utils.AssetFetchCache.fetch(
                        //    this.getModelNameByEntityType(entityTypeComponent.entityType))

                        //let obj = await this.loader.parseAsync(await modelBlob.arrayBuffer(), "");
                        //graphicEntity.object = obj.scene;
                        //graphicEntity.animationClips = obj.animations;
                        //graphicEntity.animationMixer = new THREE.AnimationMixer(obj.scene);
                    }
                } break;
                case Comps.ComponentTypes.Shape: {
                    if (this.graphicEntities.get(aC.entityUid)?.object != undefined) continue
                    let shapeComponent = aC as Comps.Shape
                    let material = new THREE.MeshPhongMaterial();
                    let geometry: THREE.BufferGeometry;
                    switch (shapeComponent!.shapeType) {
                        case Comps.ShapeTypes.Box: {
                            geometry = new THREE.BoxGeometry(
                                shapeComponent.size!.x,
                                shapeComponent.size!.y,
                                shapeComponent.size!.z);
                        } break;
                        case Comps.ShapeTypes.Sphere: {
                            geometry = new THREE.SphereGeometry(
                                shapeComponent.radius!);
                        } break;
                        case Comps.ShapeTypes.Capsule: {
                            geometry = new THREE.CapsuleGeometry(
                                shapeComponent.radius!,
                                shapeComponent.height!,
                                shapeComponent.sideNumber,
                                shapeComponent.sideNumber);
                        } break;
                        case Comps.ShapeTypes.Cylinder: {
                            geometry = new THREE.CylinderGeometry(
                                shapeComponent.radius!,
                                shapeComponent.radius!,
                                shapeComponent.height!,
                                shapeComponent.sideNumber!);
                        } break;
                        case Comps.ShapeTypes.Compound: continue;
                    }
                    const mesh = new THREE.Mesh(geometry, material);
                    graphicEntity.object = mesh
                    graphicEntity.object.castShadow = true
                    graphicEntity.object.receiveShadow = true
                } break;
                case Comps.ComponentTypes.Camera: {
                    let cameraComponent = aC as Comps.Camera
                    let camera = new THREE.PerspectiveCamera(
                        cameraComponent.fov,
                        cameraComponent.aspect,
                        cameraComponent.near,
                        cameraComponent.far)
                    graphicEntity.object = camera
                    this.graphicContextElement.camera = camera
                } break;
                case Comps.ComponentTypes.Light: {
                    let lightComponent = aC as Comps.Light

                    switch (lightComponent.lightType) {
                        case Comps.LightTypes.AmbientLight:
                            graphicEntity.object = new THREE.AmbientLight(
                                lightComponent.color,
                                lightComponent.intensity);
                            break;
                        case Comps.LightTypes.PointLight:
                            graphicEntity.object = new THREE.PointLight(
                                lightComponent.color,
                                lightComponent.intensity,
                                lightComponent.distance,
                                lightComponent.decay);

                            graphicEntity.object.castShadow = true;
                            break;
                        case Comps.LightTypes.DirectionalLight:
                            graphicEntity.object = new THREE.DirectionalLight(
                                lightComponent.color,
                                lightComponent.intensity);
                            graphicEntity.object.castShadow = true;
                            break;
                        case Comps.LightTypes.SpotLight:
                            graphicEntity.object = new THREE.SpotLight(
                                lightComponent.color,
                                lightComponent.intensity,
                                lightComponent.distance,
                                lightComponent.angle,
                                lightComponent.penumbra,
                                lightComponent.decay)
                            graphicEntity.object.castShadow = true
                            break;
                    }
                } break;
                case Comps.ComponentTypes.ShapeColor: {
                    if (graphicEntity.object == undefined) continue

                    let shapeColorComponent = aC as Comps.ShapeColor
                    let newMaterial = new THREE.MeshPhongMaterial({
                        color: new THREE.Color(shapeColorComponent.color)
                    });
                    (graphicEntity.object as THREE.Mesh).material = newMaterial

                } break;
                case Comps.ComponentTypes.Rotation: {
                    if (graphicEntity.object == undefined) continue
                    let rotationComponent = aC as Comps.Rotation
                    graphicEntity.object.setRotationFromQuaternion(
                        new THREE.Quaternion(
                            rotationComponent.x,
                            rotationComponent.y,
                            rotationComponent.z,
                            rotationComponent.w))
                } break;
                case Comps.ComponentTypes.EntityState: {
                    if (graphicEntity.object == undefined) continue
                    let entityStateComponent = aC as Comps.EntityState
                    let animationToPlay = this.getAnimationToPlayByEntityStates(
                        entityStateComponent.states)

                    if (
                        graphicEntity.animationClips != undefined &&
                        graphicEntity.animationMixer != undefined
                    ) {
                        let animationClip =
                            THREE.AnimationClip.findByName(graphicEntity.animationClips, animationToPlay)

                        let action = graphicEntity.animationMixer.clipAction(animationClip)
                        graphicEntity.animationMixer.stopAllAction()
                        action.play()
                    }
                } break;
                case Comps.ComponentTypes.Position: {
                    if (graphicEntity.object == undefined) continue
                    let positionComponent = aC as Comps.Position
                    graphicEntity.object!.position.x = positionComponent.x
                    graphicEntity.object!.position.y = positionComponent.y
                    graphicEntity.object!.position.z = positionComponent.z
                } break;
            }

        }
        for (let aE of addedEntitiesUid) {
            let graphicEntity = this.graphicEntities.get(aE)
            if (
                graphicEntity == undefined ||
                graphicEntity.object == undefined
            ) {
                continue
            };

            this.graphicContextElement.addObject(
                graphicEntity.object,
                graphicEntity.animationMixer);

        }
    }
    private removeGraphicEntities(removedEntitiesUid: number[]) {
        for (let rEU of removedEntitiesUid) {
            let graphicEntity = this.graphicEntities.get(rEU)
            if (graphicEntity == undefined) {
                continue
            }
            if (graphicEntity.object == undefined) {
                this.graphicEntities.delete(rEU)
                continue
            }
            this.graphicContextElement.removeObject(graphicEntity.object)
        }
    }
    private updateGraphicEntities(changedComponents: ECS.Component[]) {
        for (let cC of changedComponents) {
            let graphicEntity = this.graphicEntities.get(cC.entityUid)
            if (graphicEntity == undefined) continue
            switch (cC.componentType) {
                case Comps.ComponentTypes.Camera: {
                    let cameraComponent = cC as Comps.Camera
                    let cameraObject = graphicEntity.object as THREE.PerspectiveCamera
                    cameraObject.far = cameraComponent.far
                    cameraObject.fov = cameraComponent.fov
                    cameraObject.near = cameraComponent.near
                    cameraObject.aspect = cameraComponent.aspect
                    cameraObject.updateProjectionMatrix()
                } break;
                case Comps.ComponentTypes.Light: {
                    let lightComponent = cC as Comps.Light
                    switch (lightComponent.lightType) {
                        case Comps.LightTypes.AmbientLight: {
                            let lightObject = graphicEntity.object as THREE.AmbientLight
                            lightObject.intensity = lightComponent.intensity!
                            lightObject.color = new THREE.Color(lightComponent.color)
                        } break;
                        case Comps.LightTypes.PointLight: {
                            let lightObject = graphicEntity.object as THREE.PointLight
                            lightObject.intensity = lightComponent.intensity!
                            lightObject.color = new THREE.Color(lightComponent.color)
                            lightObject.distance = lightComponent.distance!
                            lightObject.decay = lightComponent.decay!
                        } break;
                        case Comps.LightTypes.DirectionalLight: {
                            let lightObject = graphicEntity.object as THREE.DirectionalLight
                            lightObject.intensity = lightComponent.intensity!
                            lightObject.color = new THREE.Color(lightComponent.color)
                        } break;
                        case Comps.LightTypes.SpotLight: {
                            let lightObject = graphicEntity.object as THREE.SpotLight
                            lightObject.color = new THREE.Color(lightComponent.color)
                            lightObject.intensity = lightComponent.intensity!
                            lightObject.decay = lightComponent.decay!
                            lightObject.distance = lightComponent.distance!
                            lightObject.penumbra = lightComponent.penumbra!
                            lightObject.angle = lightComponent.angle!
                        } break;
                    }
                } break;
                case Comps.ComponentTypes.ShapeColor: {
                    let colorComponent = cC as Comps.ShapeColor
                    let newMaterial = new THREE.MeshPhongMaterial(
                        { color: new THREE.Color(colorComponent.color) });
                    (graphicEntity.object as THREE.Mesh).material = newMaterial
                } break;
                case Comps.ComponentTypes.Rotation: {
                    if (graphicEntity.object == undefined) continue
                    let rotationComponent = cC as Comps.Rotation
                    graphicEntity.object!.setRotationFromQuaternion(
                        new THREE.Quaternion(
                            rotationComponent.x,
                            rotationComponent.y,
                            rotationComponent.z,
                            rotationComponent.w))

                } break;
                case Comps.ComponentTypes.EntityState:
                    if (graphicEntity.object == undefined) continue
                    let entityStateComponent = cC as Comps.EntityState
                    let animationToPlay = this.getAnimationToPlayByEntityStates(
                        entityStateComponent.states)

                    if (
                        graphicEntity.animationClips != undefined &&
                        graphicEntity.animationMixer != undefined
                    ) {
                        let animationClip = THREE
                            .AnimationClip
                            .findByName(graphicEntity.animationClips, animationToPlay)

                        let action = graphicEntity.animationMixer.clipAction(animationClip)
                        graphicEntity.animationMixer.stopAllAction()
                        action.play()
                    }
                    break;
                case Comps.ComponentTypes.Position:
                    if (graphicEntity.object == undefined) continue
                    let positionComponent = cC as Comps.Position
                    graphicEntity.object!.position.x = positionComponent.x
                    graphicEntity.object!.position.y = positionComponent.y
                    graphicEntity.object!.position.z = positionComponent.z
                    break;
            }
        }
    }


    //private getModelNameByEntityType(entityType: Comps.EntityTypes): string {
    //    switch (entityType) {
    //        case Comps.EntityTypes.Stickman:
    //            return "stickman.glb"
    //        case Comps.EntityTypes.Grass:
    //            return "grass.glb"
    //        case Comps.EntityTypes.Dog:
    //            return "dog.glb"
    //        case Comps.EntityTypes.Camera:
    //            throw "camera is not an asset"
    //        case Comps.EntityTypes.Light:
    //            throw "light is not an asset"
    //        case Comps.EntityTypes.GeometricShape:
    //            throw "geometric shape is not an asset"
    //        case Comps.EntityTypes.Robot:
    //            throw "robot shape is not an asset"
    //        case Comps.EntityTypes.RobotComponent:
    //            throw "robot component is not an asset"
    //        case Comps.EntityTypes.RobotSuperComponent:
    //            throw "robot super component is not an asset"
    //        case Comps.EntityTypes.Weapon:
    //            throw "robot super component is not an asset"
    //    }
    //}
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

class GraphicEntity {
    entityUid: number
    object: THREE.Object3D | undefined
    entityType: Comps.EntityTypes | undefined
    animationClips: THREE.AnimationClip[] | undefined
    animationMixer: THREE.AnimationMixer | undefined
    constructor(newEntityUid: number) {
        this.entityUid = newEntityUid
    }
}
