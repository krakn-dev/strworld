import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    onSelected: CustomEvent
    private toolbarItemElement: HTMLDivElement
    private iconElement: HTMLDivElement
    private keyElement: HTMLDivElement
    static observedAttributes = ["key", "icon", "disabled"];
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.toolbarItemElement = this.shadowRoot!.getElementById("toolbar-item") as HTMLDivElement
        this.keyElement = this.shadowRoot!.getElementById("key") as HTMLDivElement
        this.iconElement = this.shadowRoot!.getElementById("icon") as HTMLDivElement
        this.onSelected = new CustomEvent("selected", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.toolbarItemElement.addEventListener("click", this._onSelected.bind(this))
    }
    attributeChangedCallback(attributeName: string, oldValue: string, newValue: string) {
        switch (attributeName) {
            case "key": {
                this.keyElement.innerHTML = newValue
            } break;
            case "icon": {
                this.iconElement.innerHTML = newValue
            } break;
        }
    }
    unselect() {
        this.iconElement.classList.remove("select")
    }
    select() {
        this.iconElement.classList.add("select")
    }
    private _onSelected() {
        this.dispatchEvent(this.onSelected)
    }
}
