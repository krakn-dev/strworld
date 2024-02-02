import html from "./main.html"
import css from "./main.css"
import * as RobotVisualizer from "../robot-visualizer/main"
import * as CoolButton from "../cool-button/main"
import * as RobotComponentSelector from "../robot-component-selector/main"
import * as Ser from "../../../serialization"
import * as ComponentHelpMenu from "../component-help-menu/main"

export class CustomElement extends HTMLElement {
    onComponentEditorClose: CustomEvent
    private componentEditorElement: HTMLDivElement
    private robotVisualizerElement: RobotVisualizer.CustomElement
    private robotComponentSelectorElement: RobotComponentSelector.CustomElement
    private componentHelpMenuElement: ComponentHelpMenu.CustomElement | undefined
    helpButtonElement: CoolButton.CustomElement
    doneButtonElement: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.helpButtonElement = this.shadowRoot!.getElementById("help-button") as CoolButton.CustomElement
        this.doneButtonElement = this.shadowRoot!.getElementById("done-button") as CoolButton.CustomElement
        this.componentEditorElement = this.shadowRoot!.getElementById("component-editor") as HTMLDivElement
        this.robotVisualizerElement = this.shadowRoot!.getElementById("robot-visualizer") as RobotVisualizer.CustomElement
        this.robotComponentSelectorElement = this.shadowRoot!.getElementById("robot-component-selector") as RobotComponentSelector.CustomElement
        this.onComponentEditorClose = new CustomEvent("closecomponenteditor", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.helpButtonElement.addEventListener("clicked", this._onHelpClicked.bind(this))
        this.doneButtonElement.addEventListener("clicked", this._onDoneClicked.bind(this))
        this.robotVisualizerElement.addEventListener("componentplaced", this._onComponentPlaced.bind(this))
        this.robotVisualizerElement.addEventListener("componentremoved", this._onComponentRemoved.bind(this))
        this.robotComponentSelectorElement.addEventListener("itemselected", this._onComponentSelectorItemSelected.bind(this))
    }
    addWorker(newWorker: Worker) {
        this.robotComponentSelectorElement.addWorker(newWorker)
    }
    addAvailableRobotComponents(robotComponents: Ser.AvailableRobotComponents) {
        this.robotComponentSelectorElement.addAvailableRobotComponents(robotComponents)
    }
    private _onHelpClicked() {
        let element = document.createElement("component-help-menu")
        element.setAttribute("id", "component-help-menu")
        this.componentEditorElement.appendChild(element)
        this.componentHelpMenuElement = element as ComponentHelpMenu.CustomElement
        this.componentHelpMenuElement.addEventListener("closehelpmenu", this._onCloseHelpMenu.bind(this))
    }
    private _onCloseHelpMenu() {
        this.componentHelpMenuElement?.remove()
    }
    private _onComponentSelectorItemSelected(event: any) {
        this.robotVisualizerElement.updateSelectedRobotComponentType(event.detail.robotComponentType)
    }
    private _onDoneClicked() {
        this.dispatchEvent(this.onComponentEditorClose)
    }
    private _onComponentRemoved() {
        this.robotComponentSelectorElement.onComponentPlaced()
    }
    private _onComponentPlaced() {
        this.robotComponentSelectorElement.onComponentPlaced()
    }
}


