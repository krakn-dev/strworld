import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private coolButtonElement: HTMLButtonElement
    private onClick: CustomEvent

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.coolButtonElement = this.shadowRoot!.getElementById("cool-button") as HTMLButtonElement
        this.onClick = new CustomEvent("clicked", { bubbles: false, cancelable: true, composed: true })
    }
    connectedCallback() {
        this.coolButtonElement.addEventListener("click", this._onClick.bind(this))
    }
    private _onClick() {
        this.dispatchEvent(this.onClick)
    }
}
