import html from "./main.html"
import css from "./main.css"
import * as CoolButton from "../cool-button/main"

export class CustomElement extends HTMLElement {
    onOpenCodeEditor: CustomEvent
    onOpenComponentEditor: CustomEvent

    private robotMenuElement: HTMLDivElement
    private editCodeButton: CoolButton.CustomElement
    private editComponentsButton: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotMenuElement = this.shadowRoot!.getElementById("robot-menu") as HTMLDivElement

        this.onOpenCodeEditor = new CustomEvent("opencodeeditor", { bubbles: false, composed: true, cancelable: true })
        this.onOpenComponentEditor = new CustomEvent("opencomponenteditor", { bubbles: false, composed: true, cancelable: true })

        this.editCodeButton = this.shadowRoot!.getElementById("edit-code-button") as CoolButton.CustomElement
        this.editComponentsButton = this.shadowRoot!.getElementById("edit-components-button") as CoolButton.CustomElement
    }
    connectedCallback() {
        this.editCodeButton.addEventListener("clicked", this._onOpenCodeEditor.bind(this))
        this.editComponentsButton.addEventListener("clicked", this._onOpenComponentEditor.bind(this))
    }
    private _onOpenComponentEditor() {
        this.dispatchEvent(this.onOpenComponentEditor)
    }
    private _onOpenCodeEditor() {
        this.dispatchEvent(this.onOpenCodeEditor)
    }
}
