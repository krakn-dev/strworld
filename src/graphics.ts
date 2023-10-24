import * as Utils from "./utils.js"
import * as ECS from "./ecs.js"
import * as Ents from "./entities.js"
import * as Comps from "./components.js"





export class EntityComputedStyle {
    entityUid: number

    constructor(newEntityUid: number) {
        this.entityUid = newEntityUid
    }
}


export class DocumentEntity {
    private documentEntityReference: HTMLElement
    private stateElement: HTMLElement
    private classes: string[]
    entityUid: number


    constructor(newEntityUid: number) {
        this.classes = []
        this.entityUid = newEntityUid;
        let worldView = document.getElementById("world-view")
        worldView!.insertAdjacentHTML("beforeend", `<div class="rel" id="${newEntityUid}"><div></div></div>`);

        this.documentEntityReference = document.getElementById(newEntityUid.toString())!
        this.stateElement = this.documentEntityReference.firstElementChild! as HTMLElement
    }

    setClasses(newClasses: string[]) {
        if (newClasses.length == 0) return

        for (let cI = this.classes.length - 1; cI >= 0; cI--) {
            if (!newClasses.includes(this.classes[cI])) {
                this.stateElement.classList.remove(this.classes[cI])
                this.classes.splice(cI, 1)
            }
        }
        for (let nC of newClasses) {
            if (!this.classes.includes(nC)) {
                this.stateElement.classList.add(nC)
                this.classes.push(nC)
            }
        }
    }
    setColor(newColor: string) {
        this.stateElement.style.color = newColor
    }
    setLeft(newLeft: number) {
        this.stateElement.style.left = newLeft + "px"
    }
    setTop(newTop: number) {
        this.stateElement.style.top = newTop + "px"
    }
    setZIndex(newZIndex: number) {
        this.stateElement.style.zIndex = newZIndex.toString()
    }
    setDisplayElement(newDisplayElement: string) {
        this.stateElement.innerHTML = newDisplayElement
    }
    dispose() {
        this.documentEntityReference.remove()
    }
}


export interface Animation {
    cancel: Function | null
    isFinished: boolean
    displayElement: Utils.Str
    runOnState: Comps.EntityStates
    currentAnimationNode: number[]
    isChanged: Utils.Bool
    play(): void
}

export class EntityAnimation {
    private animations: Animation[]
    private playingAnimIndex: number | null
    private _displayElement: Utils.Str
    entityUid: number
    isChanged: Utils.Bool

    get displayElement() {
        return this._displayElement.str
    }

    private cancel(aI: number) {
        if (!this.animations[aI].isFinished) {
            if (this.animations[aI].cancel != null) this.animations[aI].cancel!()
            this.animations[aI].isFinished = true
        }
    }

    play(state: Comps.EntityStates) {
        for (let [aI, a] of this.animations.entries()) {
            if (a.runOnState == state)
                if (this.playingAnimIndex == aI && !a.isFinished)
                    return
                else {
                    this.cancel(aI)
                    this.playingAnimIndex = aI
                    this.animations[aI].isChanged = this.isChanged
                    this.animations[aI].displayElement = this._displayElement
                    this.animations[aI].play()
                }
        }
    }

    constructor(newAnimations: Animation[], newOwnerUid: number) {
        this.isChanged = new Utils.Bool(true)
        this._displayElement = new Utils.Str("?")
        this.animations = newAnimations
        this.playingAnimIndex = null
        this.entityUid = newOwnerUid
    }
}
