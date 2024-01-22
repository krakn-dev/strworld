import html from "./main.html"
import css from "./main.css"
import * as ComponentItem from "../robot-component-item/main"
import * as Ser from "../../../serialization"

export class CustomElement extends HTMLElement {
    onItemSelected: CustomEvent
    private worker: Worker | undefined
    private robotComponentSelector: HTMLDivElement
    private robotComponentItems: ComponentItem.CustomElement[]
    private selectedItem: ComponentItem.CustomElement | undefined

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotComponentSelector = this.shadowRoot!.getElementById("robot-component-selector") as HTMLDivElement

        this.onItemSelected = new CustomEvent("selected", { bubbles: false, composed: true, cancelable: true })
        this.robotComponentItems = []
        this.selectedItem = undefined
        this.worker = undefined
    }
    connectedCallback() {
        // make request

    }
    requestAvailableRobotComponents() {
        this.worker!.postMessage(new Ser.Message(Ser.Messages.GetAvailableRobotComponents))
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
    }
    private _onItemSelected() {
        this.dispatchEvent(this.onItemSelected)
    }
    private _onOpenCodeEditor() {
        this.dispatchEvent(this.onItemSelected)
    }
}
