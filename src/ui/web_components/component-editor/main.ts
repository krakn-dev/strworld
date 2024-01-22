import html from "./main.html"
import css from "./main.css"
import * as RobotVisualizer from "../robot-visualizer/main"
import * as CoolButton from "../cool-button/main"
import * as RobotComponentSelector from "../robot-component-selector/main"

export class CustomElement extends HTMLElement {
    onComponentEditorClose: CustomEvent
    private componentEditorElement: HTMLDivElement
    private robotVisualizerElement: RobotVisualizer.CustomElement
    private robotComponentSelectorElement: RobotComponentSelector.CustomElement
    private doneButtonElement: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.componentEditorElement = this.shadowRoot!.getElementById("component-editor") as HTMLDivElement
        this.robotVisualizerElement = this.shadowRoot!.getElementById("robot-visualizer") as RobotVisualizer.CustomElement
        this.robotComponentSelectorElement = this.shadowRoot!.getElementById("robot-component-selector") as RobotComponentSelector.CustomElement
        this.doneButtonElement = this.shadowRoot!.getElementById("done-button") as CoolButton.CustomElement

        this.onComponentEditorClose = new CustomEvent("closecomponenteditor", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.doneButtonElement.addEventListener("clicked", this._onDoneClicked.bind(this))
    }
    addWorker(newWorker: Worker) {
        this.robotComponentSelectorElement.addWorker(newWorker)
    }
    private _onDoneClicked() {
        this.dispatchEvent(this.onComponentEditorClose)
    }
}


