import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
    }
    connectedCallback() {
    }
}


