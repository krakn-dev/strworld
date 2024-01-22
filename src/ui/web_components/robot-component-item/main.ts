import html from "./main.html"
import css from "./main.css"
import * as CoolButton from "../cool-button/main"
import * as Comps from "../../../ecs/components"

export class CustomElement extends HTMLElement {
    componentType: Comps.RobotComponentTypes
    quatity: number
    onSelected: CustomEvent
    private componentItemElement: HTMLDivElement
    private quantityElement: HTMLDivElement
    private imageElement: HTMLDivElement
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.componentItemElement = this.shadowRoot!.getElementById("component-item") as HTMLDivElement
        this.quantityElement = this.shadowRoot!.getElementById("quantity") as HTMLDivElement
        this.imageElement = this.shadowRoot!.getElementById("image") as HTMLDivElement

        this.onSelected = new CustomEvent("selected", { bubbles: false, composed: true, cancelable: true })
        if (!this.hasAttribute("component-type") || !this.hasAttribute("quantity")) {
            console.log("not enough attributes")
        }
        this.componentType = this.getComponentType()
        this.quatity = this.getQuantity()
        this.updateQuantity(this.quatity)
    }
    connectedCallback() {
        this.componentItemElement.addEventListener("click", this._onSelected.bind(this))
    }
    private getQuantity(): number {
        return Number(this.getAttribute("quantity"))
    }
    private getComponentType(): Comps.RobotComponentTypes {
        switch (Number(this.getAttribute("component-type")) as Comps.RobotComponentTypes) {
            case Comps.RobotComponentTypes.Wheel:
                this.imageElement.innerText = "wheel"
                return Comps.RobotComponentTypes.Wheel

            case Comps.RobotComponentTypes.Processor:
                this.imageElement.innerText = "processor"
                return Comps.RobotComponentTypes.Processor

            case Comps.RobotComponentTypes.SteelPlate:
                this.imageElement.innerText = "steel plate"
                return Comps.RobotComponentTypes.SteelPlate

            case Comps.RobotComponentTypes.WoodenStick:
                this.imageElement.innerText = "wooden stick"
                return Comps.RobotComponentTypes.WoodenStick

        }
    }
    updateQuantity(newQuantity: number) {
        this.quatity = newQuantity
        this.quantityElement.innerText = newQuantity.toString()
    }
    deselect() {
        if (this.componentItemElement.classList.contains("select"))
            this.componentItemElement.classList.remove("select")
    }
    select() {
        this.componentItemElement.classList.add("select")
    }
    private _onSelected() {
        this.dispatchEvent(this.onSelected)
        this.select()
    }
}
