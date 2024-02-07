import html from "./main.html"
import css from "./main.css"
import * as CoolButton from "../../shared/cool-button/main"
import * as CoolMenu from "../../shared/cool-menu/main"

export class CustomElement extends HTMLElement {
    onHelpMenuClose: CustomEvent
    private helpMenuElement: CoolMenu.CustomElement
    private okButtonElement: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.helpMenuElement = this.shadowRoot!.getElementById("help-menu") as CoolMenu.CustomElement
        this.okButtonElement = this.shadowRoot!.getElementById("ok-button") as CoolButton.CustomElement
        this.onHelpMenuClose = new CustomEvent("closehelpmenu", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.okButtonElement.addEventListener("clicked", this._onOkClicked.bind(this))
    }
    private _onOkClicked() {
        this.dispatchEvent(this.onHelpMenuClose)
    }
}


