import * as Utils from "./utils.js";
export class EntityComputedStyle {
    constructor(newEntityUid) {
        this.entityUid = newEntityUid;
    }
}
export class DocumentEntity {
    constructor(newEntityUid) {
        this.classes = [];
        this.entityUid = newEntityUid;
        let worldView = document.getElementById("world-view");
        worldView.insertAdjacentHTML("beforeend", `<div class="rel" id="${newEntityUid}"><div></div></div>`);
        this.documentEntityReference = document.getElementById(newEntityUid.toString());
        this.stateElement = this.documentEntityReference.firstElementChild;
    }
    setClasses(newClasses) {
        if (newClasses.length == 0)
            return;
        for (let cI = this.classes.length - 1; cI >= 0; cI--) {
            if (!newClasses.includes(this.classes[cI])) {
                this.stateElement.classList.remove(this.classes[cI]);
                this.classes.splice(cI, 1);
            }
        }
        for (let nC of newClasses) {
            if (!this.classes.includes(nC)) {
                this.stateElement.classList.add(nC);
                this.classes.push(nC);
            }
        }
    }
    setColor(newColor) {
        this.stateElement.style.color = newColor;
    }
    setLeft(newLeft) {
        this.stateElement.style.left = newLeft + "px";
    }
    setTop(newTop) {
        this.stateElement.style.top = newTop + "px";
    }
    setZIndex(newZIndex) {
        this.stateElement.style.zIndex = newZIndex.toString();
    }
    setDisplayElement(newDisplayElement) {
        this.stateElement.innerHTML = newDisplayElement;
    }
    dispose() {
        this.documentEntityReference.remove();
    }
}
export class EntityAnimation {
    get displayElement() {
        return this._displayElement.str;
    }
    cancel(aI) {
        if (!this.animations[aI].isFinished) {
            if (this.animations[aI].cancel != null)
                this.animations[aI].cancel();
            this.animations[aI].isFinished = true;
        }
    }
    play(state) {
        for (let [aI, a] of this.animations.entries()) {
            if (a.runOnState == state)
                if (this.playingAnimIndex == aI && !a.isFinished)
                    return;
                else {
                    this.cancel(aI);
                    this.playingAnimIndex = aI;
                    this.animations[aI].isChanged = this.isChanged;
                    this.animations[aI].displayElement = this._displayElement;
                    this.animations[aI].play();
                }
        }
    }
    constructor(newAnimations, newOwnerUid) {
        this.isChanged = new Utils.Bool(true);
        this._displayElement = new Utils.Str("?");
        this.animations = newAnimations;
        this.playingAnimIndex = null;
        this.entityUid = newOwnerUid;
    }
}
