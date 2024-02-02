import html from "./main.html"
import css from "./main.css"
import * as CoolButton from "../cool-button/main"
import * as CoolMenu from "../cool-menu/main"

export class CustomElement extends HTMLElement {
    onHelpMenuClose: CustomEvent
    private componentHelpMenuElement: CoolMenu.CustomElement
    private okButtonElement: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.componentHelpMenuElement = this.shadowRoot!.getElementById("component-help-menu") as CoolMenu.CustomElement
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


