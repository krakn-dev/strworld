import html from "./main.html"
import css from "./main.css"
import * as ComponentSelectorItem from "../component-selector-item/main"
import * as Ser from "../../../serialization"
import * as Comps from "../../../ecs/components"

export class CustomElement extends HTMLElement {
    onItemSelected: CustomEvent
    private worker: Worker | undefined
    private robotComponentSelector: HTMLDivElement
    private robotComponentItems: ComponentSelectorItem.CustomElement[]
    private selectedItem: ComponentSelectorItem.CustomElement | undefined

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.robotComponentSelector = this.shadowRoot!.getElementById("robot-component-selector") as HTMLDivElement

        this.onItemSelected = new CustomEvent("itemselected", { bubbles: false, composed: true, cancelable: true, detail: {} })
        this.robotComponentItems = []
        this.selectedItem = undefined
        this.worker = undefined
    }
    connectedCallback() {

    }
    private requestAvailableRobotComponents() {
        this.worker!.postMessage(new Ser.Message(Ser.Messages.GetAvailableRobotComponents))
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
        this.requestAvailableRobotComponents()
    }
    onComponentPlaced() {
        if (this.selectedItem == undefined) return
        this.selectedItem!.updateQuantity(this.selectedItem.quatity - 1)

        if (this.selectedItem.quatity != 0) return
        this.selectedItem.remove()
        this.updateSelection(undefined)
    }
    addAvailableRobotComponents(robotComponents: Ser.AvailableRobotComponents) {
        let isFirstSelected = false
        for (let i = 0; i < robotComponents.robotComponentTypes.length; i++) {
            if (robotComponents.robotComponentTypes[i] == Comps.RobotComponentTypes.Processor) {
                continue
            }
            let element = document.createElement("component-selector-item") as ComponentSelectorItem.CustomElement
            element.setAttribute("component-type", robotComponents.robotComponentTypes[i].toString())
            element.setAttribute("quantity", robotComponents.quantity[i].toString())
            this.robotComponentSelector.appendChild(element)
            this.robotComponentItems.push(element)
            element.addEventListener("selected", this._onItemSelected.bind(this))
            if (!isFirstSelected) {
                this.robotComponentItems[i].select()
                this.selectedItem = this.robotComponentItems[i]
                isFirstSelected = true
            }
        }
    }
    private _onItemSelected(event: any) {
        let newSelectedItem = event.originalTarget as ComponentSelectorItem.CustomElement
        this.updateSelection(newSelectedItem)
    }
    private updateSelection(newSelectedItem: ComponentSelectorItem.CustomElement | undefined) {
        if (newSelectedItem?.robotComponentType != this.selectedItem?.robotComponentType) {
            this.selectedItem?.unselect()
        }
        this.selectedItem = newSelectedItem
        this.selectedItem?.select()
        this.onItemSelected.detail.robotComponentType = this.selectedItem?.robotComponentType
        this.dispatchEvent(this.onItemSelected)
    }
}
