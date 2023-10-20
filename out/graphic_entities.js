import * as Utils from "./utils.js";
import * as ECS from "./ecs.js";
class GraphicEntity {
    constructor(newEntityUid, newAnimations) {
        this.entityPosition = new Utils.Vector3(0, 0, 0);
        this.animations = newAnimations;
        this.entityState = ECS.EntityStates.Idle;
        this.entityUid = newEntityUid;
        this.displayElement = new Utils.Str("?");
        this.finished = new Utils.Bool(false);
        this.playing = null;
        this.documentEntity = new DocumentEntity(newEntityUid);
        this.isEntityLookingRight = true;
    }
    run() {
        this.playAnimation();
        this.syncDocumentEntity();
    }
    syncDocumentEntity() {
        if (this.isEntityLookingRight)
            this.documentEntity.lookRight();
        else
            this.documentEntity.lookLeft();
        this.documentEntity.setDisplayElement(this.displayElement);
        this.documentEntity.setPosition(this.entityPosition);
    }
    playAnimation() {
        for (let [i, a] of this.animations.entries()) {
            if (a.runOnState == this.entityState) {
                // abort if already playing
                if (this.playing == i)
                    return;
                // cancel playing animation
                if (this.playing != null)
                    this.animations[this.playing].cancel();
                this.finished.bool = false;
                this.playing = i;
                a.play();
            }
        }
    }
}
export class DocumentEntity {
    constructor(entityUid) {
        let worldView = document.getElementById("world-view");
        worldView.insertAdjacentHTML("beforeend", `<div class="rel" id="${entityUid}"><div class="state"></div></div>`);
        this.documentEntityReference = document.getElementById(entityUid.toString());
        this.stateElement = this.documentEntityReference.firstElementChild;
        this._doNotDisturb = false;
        this.isLookingRight = true;
    }
    lookRight() {
        if (this.isLookingRight) {
            return;
        }
        this.isLookingRight = true;
        this.stateElement.classList.remove("look-left");
        this.stateElement.classList.add("look-right");
    }
    lookLeft() {
        if (!this.isLookingRight) {
            return;
        }
        this.isLookingRight = false;
        this.stateElement.classList.remove("look-right");
        this.stateElement.classList.add("look-left");
    }
    toggleDoNotDisturb() {
        this._doNotDisturb = !this._doNotDisturb;
        if (this._doNotDisturb)
            this.stateElement.classList.add("do-not-disturb");
        if (!this._doNotDisturb)
            this.stateElement.classList.remove("do-not-disturb");
    }
    get doNotDisturb() {
        return this._doNotDisturb;
    }
    dispose() {
        this.documentEntityReference.remove();
    }
    setDisplayElement(newDisplayElement) {
        this.stateElement.innerHTML = newDisplayElement.str;
    }
    setPosition(newPosition) {
        this.stateElement.style.left = `${newPosition.x * 0.4}vmin`;
        this.stateElement.style.top = `${newPosition.z * 0.4}vmin`;
        this.stateElement.style.transform = `translateZ(${newPosition.y * 0.2}vmin)`;
        this.stateElement.style.zIndex = (-newPosition.z).toString();
        //        this.stateElement.style.scale = `${1 + (newPosition.y / 50) * 0.15}`
    }
}
