import html from "./main.html"
import css from "./main.css"
import * as ComponentSelectorItem from "../component-selector-item/main"
import * as Ser from "../../../../serialization"
import * as Comps from "../../../../ecs/components"


export class CustomElement extends HTMLElement {
    onItemSelected: CustomEvent
    private worker: Worker | undefined
    private componentSelector: HTMLDivElement
    private componentSelectorItems: ComponentSelectorItem.CustomElement[]
    private selectedItem: ComponentSelectorItem.CustomElement | undefined

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.componentSelector = this.shadowRoot!.getElementById("component-selector") as HTMLDivElement

        this.onItemSelected = new CustomEvent("itemselected", { bubbles: false, composed: true, cancelable: true, detail: {} })
        this.componentSelectorItems = []
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
        for (let [iI, i] of this.componentSelectorItems.entries()) {
            if (i.robotComponentType == this.selectedItem.robotComponentType) {
                this.componentSelectorItems.splice(iI, 1)
            }
        }
        this.selectedItem.remove()
        this.updateSelection(undefined)
    }
    onComponentRemoved(robotComponentType: Comps.RobotComponentTypes) {
        let isItemFound = false
        for (let i of this.componentSelectorItems) {
            if (i.robotComponentType == robotComponentType) {
                i.updateQuantity(i.quatity + 1)
                isItemFound = true
            }
        }
        if (!isItemFound) {
            this.createItem(robotComponentType, 1)
        }
    }
    addAvailableRobotComponents(robotComponents: Ser.AvailableRobotComponents) {
        let isFirstSelected = false
        for (let i = 0; i < robotComponents.robotComponentTypes.length; i++) {
            if (robotComponents.robotComponentTypes[i] == Comps.RobotComponentTypes.Processor) {
                continue
            }
            this.createItem(
                robotComponents.robotComponentTypes[i],
                robotComponents.quantity[i])
            if (!isFirstSelected) {
                this.updateSelection(this.componentSelectorItems[0])
                isFirstSelected = true
            }
        }
    }
    createItem(robotComponentType: Comps.RobotComponentTypes, quantity: number): ComponentSelectorItem.CustomElement {
        let element = document.createElement("component-selector-item") as ComponentSelectorItem.CustomElement
        element.setAttribute("component-type", robotComponentType.toString())
        element.setAttribute("quantity", quantity.toString())
        this.componentSelector.appendChild(element)
        this.componentSelectorItems.push(element)
        element.addEventListener("selected", this._onItemSelected.bind(this))
        return element
    }
    private _onItemSelected(event: any) {
        let newSelectedItem = event.target as ComponentSelectorItem.CustomElement
        this.updateSelection(newSelectedItem)
    }
    private updateSelection(newSelectedItem: ComponentSelectorItem.CustomElement | undefined) {
        if (newSelectedItem?.robotComponentType != this.selectedItem?.robotComponentType) {
            this.selectedItem?.unselect()
        } else {
            return
        }
        this.selectedItem = newSelectedItem
        this.selectedItem?.select()
        this.onItemSelected.detail.robotComponentType = this.selectedItem?.robotComponentType
        this.dispatchEvent(this.onItemSelected)
    }
}
