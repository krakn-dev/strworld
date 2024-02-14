import html from "./main.html"
import css from "./main.css"
import * as CoolButton from "../../shared/cool-button/main"
import * as CoolMenu from "../../shared/cool-menu/main"

export class CustomElement extends HTMLElement {
    private quitMenuElement: CoolMenu.CustomElement
    private notSaveButtonElement: CoolButton.CustomElement
    private saveButtonElement: CoolButton.CustomElement
    private cancelButtonElement: CoolButton.CustomElement
    private onCancelPressed: CustomEvent
    private onSavePressed: CustomEvent
    private onNotSavePressed: CustomEvent

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.quitMenuElement = this.shadowRoot!.getElementById("quit-menu") as CoolMenu.CustomElement
        this.cancelButtonElement = this.shadowRoot!.getElementById("cancel-button") as CoolButton.CustomElement
        this.saveButtonElement = this.shadowRoot!.getElementById("save-button") as CoolButton.CustomElement
        this.notSaveButtonElement = this.shadowRoot!.getElementById("not-save-button") as CoolButton.CustomElement
        this.onCancelPressed = new CustomEvent("cancelpressed", { bubbles: false, composed: true, cancelable: true })
        this.onSavePressed = new CustomEvent("savepressed", { bubbles: false, composed: true, cancelable: true })
        this.onNotSavePressed = new CustomEvent("notsavepressed", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.cancelButtonElement.addEventListener("clicked", this._onCancel.bind(this))
        this.notSaveButtonElement.addEventListener("clicked", this._onNotSave.bind(this))
        this.saveButtonElement.addEventListener("clicked", this._onSave.bind(this))
    }
    private _onNotSave() {
        this.dispatchEvent(this.onNotSavePressed)
    }
    private _onSave() {
        this.dispatchEvent(this.onSavePressed)
    }
    private _onCancel() {
        this.dispatchEvent(this.onCancelPressed)
    }
}


