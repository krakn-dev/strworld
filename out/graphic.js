export var Properties;
(function (Properties) {
    Properties[Properties["Classes"] = 0] = "Classes";
    Properties[Properties["Left"] = 1] = "Left";
    Properties[Properties["Top"] = 2] = "Top";
    Properties[Properties["zIndex"] = 3] = "zIndex";
    Properties[Properties["Color"] = 4] = "Color";
})(Properties || (Properties = {}));
export class EntityComputedStyle {
    constructor(newEntityUid) {
        this.entityUid = newEntityUid;
        this.properties = [[], 0, 0, 0, "#000000"];
        this.changed = [true, true, true, true, true];
    }
}
export class DocumentEntity {
    constructor(newEntityUid) {
        this.entityUid = newEntityUid;
        let worldView = document.getElementById("world-view");
        worldView.insertAdjacentHTML("beforeend", `<div class="rel" id="${newEntityUid}"><div class="state"></div></div>`);
        this.documentEntityReference = document.getElementById(newEntityUid.toString());
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
