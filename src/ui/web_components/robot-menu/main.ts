import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    onOpenCodeEditor: CustomEvent
    
    private robotMenuElement: HTMLDivElement
    private openCodeEditorButton: HTMLButtonElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotMenuElement = this.shadowRoot!.getElementById("robot-menu") as HTMLDivElement
        this.onOpenCodeEditor = new CustomEvent("opencodeeditor", {bubbles: false,composed: true, cancelable: true})
        this.openCodeEditorButton = this.shadowRoot!.getElementById("open-code-editor") as HTMLButtonElement
    }
    connectedCallback() {
        this.openCodeEditorButton.addEventListener("clicked", this._onOpenCodeEditor.bind(this))
    }
    private _onOpenCodeEditor() {
        this.dispatchEvent(this.onOpenCodeEditor)
    }
}
