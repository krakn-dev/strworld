import html from "./main.html"
import css from "./main.css"
import * as ToolbarItem from "../toolbar-item/main"
import * as Ser from "../../../serialization"
import * as Comps from "../../../ecs/components"

export class CustomElement extends HTMLElement {
    onItemSelected: CustomEvent
    private worker: Worker | undefined
    private componentToolbarElement: HTMLDivElement
    private selectedItem: ToolbarItem.CustomElement | undefined
    private addItem: ToolbarItem.CustomElement
    private removeItem: ToolbarItem.CustomElement
    private renameItem: ToolbarItem.CustomElement
    private moveItem: ToolbarItem.CustomElement
    private rotateItem: ToolbarItem.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.componentToolbarElement = this.shadowRoot!.getElementById("component-toolbar") as HTMLDivElement
        this.addItem = this.shadowRoot!.getElementById("add-component-item") as ToolbarItem.CustomElement
        this.removeItem = this.shadowRoot!.getElementById("remove-component-item") as ToolbarItem.CustomElement
        this.renameItem = this.shadowRoot!.getElementById("rename-component-item") as ToolbarItem.CustomElement
        this.moveItem = this.shadowRoot!.getElementById("move-component-item") as ToolbarItem.CustomElement
        this.rotateItem = this.shadowRoot!.getElementById("rotate-component-item") as ToolbarItem.CustomElement

        this.onItemSelected = new CustomEvent("itemselected", { bubbles: false, composed: true, cancelable: true, detail: {} })
        this.selectedItem = undefined
        this.worker = undefined
    }
    connectedCallback() {
        document.addEventListener("keydown", this._onKeyPress.bind(this))
        this.addItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.removeItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.renameItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.moveItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.rotateItem.addEventListener("selected", this._onItemSelected.bind(this))
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
    }
    private _onKeyPress(event: any) {
        switch (event.key) {
            case "a": {
                this.updateSelection(this.addItem)
            } break;
            case "x": {
                this.updateSelection(this.removeItem)
            } break;
            case "g": {
                this.updateSelection(this.moveItem)
            } break;
            case "r": {
                this.updateSelection(this.rotateItem)
            } break;
            case "s": {
                this.updateSelection(this.renameItem)
            } break;
        }
    }
    private _onItemSelected(event: any) {
        let newSelectedItem = event.originalTarget as ToolbarItem.CustomElement
        this.updateSelection(newSelectedItem)
    }
    private updateSelection(newSelectedItem: ToolbarItem.CustomElement | undefined) {
        if (newSelectedItem?.id != this.selectedItem?.id) {
            this.selectedItem?.unselect()
        } else {
            return
        }
        this.selectedItem = newSelectedItem
        this.selectedItem!.select()
        this.dispatchEvent(this.onItemSelected)
    }
}
