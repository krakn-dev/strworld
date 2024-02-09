import html from "./main.html"
import css from "./main.css"
import * as ToolbarItem from "../toolbar-item/main"
import * as Ser from "../../../../serialization"
import * as Comps from "../../../../ecs/components"
import * as RobotVisualizer from "../robot-visualizer/main"


export class CustomElement extends HTMLElement {
    onItemSelected: CustomEvent
    private worker: Worker | undefined
    private toolbarElement: HTMLDivElement
    private selectedItem: ToolbarItem.CustomElement | undefined
    private addItem: ToolbarItem.CustomElement
    private removeItem: ToolbarItem.CustomElement
    private renameItem: ToolbarItem.CustomElement
    private translateItem: ToolbarItem.CustomElement
    private rotateItem: ToolbarItem.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.toolbarElement = this.shadowRoot!.getElementById("toolbar") as HTMLDivElement
        this.addItem = this.shadowRoot!.getElementById("add-toolbar-item") as ToolbarItem.CustomElement
        this.removeItem = this.shadowRoot!.getElementById("remove-toolbar-item") as ToolbarItem.CustomElement
        this.renameItem = this.shadowRoot!.getElementById("rename-toolbar-item") as ToolbarItem.CustomElement
        this.translateItem = this.shadowRoot!.getElementById("translate-toolbar-item") as ToolbarItem.CustomElement
        this.rotateItem = this.shadowRoot!.getElementById("rotate-toolbar-item") as ToolbarItem.CustomElement

        this.onItemSelected = new CustomEvent("itemselected", { bubbles: false, composed: true, cancelable: true, detail: {} })
        this.selectedItem = undefined
        this.worker = undefined
    }
    connectedCallback() {
        document.addEventListener("keydown", this._onKeyPress.bind(this))
        this.addItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.removeItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.renameItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.translateItem.addEventListener("selected", this._onItemSelected.bind(this))
        this.rotateItem.addEventListener("selected", this._onItemSelected.bind(this))

        this.updateSelection(this.addItem)
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
            case "t": {
                this.updateSelection(this.translateItem)
            } break;
            case "r": {
                this.updateSelection(this.rotateItem)
            } break;
            case "e": {
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
        switch (this.selectedItem?.id) {
            case "add-toolbar-item": {
                this.onItemSelected.detail.mode = RobotVisualizer.Mode.Add
            } break;
            case "remove-toolbar-item": {
                this.onItemSelected.detail.mode = RobotVisualizer.Mode.Remove
            } break;
            case "translate-toolbar-item": {
                this.onItemSelected.detail.mode = RobotVisualizer.Mode.Translate
            } break;
            case "rotate-toolbar-item": {
                this.onItemSelected.detail.mode = RobotVisualizer.Mode.Rotate
            } break;
            case "rename-toolbar-item": {
                this.onItemSelected.detail.mode = RobotVisualizer.Mode.Rename
            } break;
        }
        this.dispatchEvent(this.onItemSelected)
    }
}
