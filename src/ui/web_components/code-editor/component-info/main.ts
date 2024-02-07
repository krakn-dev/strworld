import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private titleElement: HTMLDivElement
    private descriptionElement: HTMLDivElement
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.titleElement = this.shadowRoot!.getElementById("title") as HTMLDivElement
        this.descriptionElement = this.shadowRoot!.getElementById("description") as HTMLDivElement
        this.descriptionElement.hidden = true
    }

    connectedCallback() {
        this.titleElement.addEventListener("click", this._onClick.bind(this))
    }
    private _onClick() {
        this.descriptionElement.hidden = !this.descriptionElement.hidden
    }
}
