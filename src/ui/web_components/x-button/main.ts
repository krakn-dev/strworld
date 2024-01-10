import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private xButtonElement: HTMLButtonElement
    private onClick: CustomEvent
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.xButtonElement = this.shadowRoot!.getElementById("x-button") as HTMLButtonElement
        this.onClick = new CustomEvent(
            "scroll",
            { bubbles: true, cancelable: true, composed: true })
    }
    connectedCallback() {
        this.xButtonElement.addEventListener("click", this._onClick.bind(this))
    }
    private _onClick() {
        this.dispatchEvent(this.onClick)
    }
}
