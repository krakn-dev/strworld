import html from "./main.html"
import css from "./main.css"
import * as CoolButton from "../../shared/cool-button/main"
import * as CoolMenu from "../../shared/cool-menu/main"

export class CustomElement extends HTMLElement {
    onYesButtonPressed: CustomEvent
    onNoButtonPressed: CustomEvent
    private confirmPlacementMenu: CoolMenu.CustomElement
    private yesButtonElement: CoolButton.CustomElement
    private noButtonElement: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.confirmPlacementMenu = this.shadowRoot!.getElementById("help-menu") as CoolMenu.CustomElement
        this.noButtonElement = this.shadowRoot!.getElementById("no-button") as CoolButton.CustomElement
        this.yesButtonElement = this.shadowRoot!.getElementById("yes-button") as CoolButton.CustomElement
        this.onYesButtonPressed = new CustomEvent("yespressed", { bubbles: false, composed: true, cancelable: true })
        this.onNoButtonPressed = new CustomEvent("nopressed", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.yesButtonElement.addEventListener("clicked", this._onYesPressed.bind(this))
        this.noButtonElement.addEventListener("clicked", this._onNoPressed.bind(this))
    }
    private _onNoPressed() {
        this.dispatchEvent(this.onNoButtonPressed)
    }
    private _onYesPressed() {
        this.dispatchEvent(this.onYesButtonPressed)
    }
}


