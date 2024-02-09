import html from "./main.html"
import css from "./main.css"
import * as RobotVisualizer from "./robot-visualizer/main"
import * as CoolButton from "../shared/cool-button/main"
import * as Comps from '../../../ecs/components';
import * as ComponentSelector from "./component-selector/main"
import * as Ser from "../../../serialization"
import * as Utils from '../../../utils';
import * as HelpMenu from "./help-menu/main"
import * as Toolbar from "./toolbar/main"

export class CustomElement extends HTMLElement {
    onComponentEditorClose: CustomEvent
    private worker: Worker | undefined
    private componentEditorElement: HTMLDivElement
    private robotVisualizerElement: RobotVisualizer.CustomElement
    private componentSelectorElement: ComponentSelector.CustomElement
    private toolbarElement: Toolbar.CustomElement
    private helpMenuElement: HelpMenu.CustomElement | undefined
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
        this.componentSelectorElement = this.shadowRoot!.getElementById("component-selector") as ComponentSelector.CustomElement
        this.toolbarElement = this.shadowRoot!.getElementById("toolbar") as Toolbar.CustomElement
        this.onComponentEditorClose = new CustomEvent("closecomponenteditor", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.helpButtonElement.addEventListener("clicked", this._onHelpClicked.bind(this))
        this.doneButtonElement.addEventListener("clicked", this._onDoneClicked.bind(this))
        this.robotVisualizerElement.addEventListener("componentplaced", this._onComponentPlaced.bind(this))
        this.robotVisualizerElement.addEventListener("componentremoved", this._onComponentRemoved.bind(this))
        this.componentSelectorElement.addEventListener("itemselected", this._onComponentSelectorItemSelected.bind(this))
        this.toolbarElement.addEventListener("itemselected", this._onToolbarItemSelected.bind(this))
    }
    addWorker(newWorker: Worker) {
        this.componentSelectorElement.addWorker(newWorker)
        this.worker = newWorker
    }
    addAvailableRobotComponents(robotComponents: Ser.AvailableRobotComponents) {
        this.componentSelectorElement.addAvailableRobotComponents(robotComponents)
    }
    private serializeAndSendRobotComponents(robotComponents: RobotVisualizer.RobotComponent[]) {
        let serializedComponents: Ser.RobotComponent[] = []
        for (let rC of robotComponents) {
            let positionComponent = new Comps.Position(
                new Utils.Vector3(
                    rC.object.position.x,
                    rC.object.position.y,
                    rC.object.position.z,
                ), 0)
            let rotationComponent = new Comps.Rotation(
                new Utils.Vector3(0, 0, 0), 0)
            rotationComponent.x = rC.object.quaternion.x
            rotationComponent.y = rC.object.quaternion.y
            rotationComponent.z = rC.object.quaternion.z
            rotationComponent.w = rC.object.quaternion.w

            serializedComponents.push(
                new Ser.RobotComponent(
                    rC.robotComponentType,
                    positionComponent,
                    rotationComponent
                ))
        }
        this.worker!.postMessage(
            new Ser.Message(
                Ser.Messages.RobotComponents,
                new Ser.RobotComponents(serializedComponents)))
    }
    private _onHelpClicked() {
        let element = document.createElement("help-menu")
        element.setAttribute("id", "help-menu")
        this.componentEditorElement.appendChild(element)
        this.helpMenuElement = element as HelpMenu.CustomElement
        this.helpMenuElement.addEventListener("closehelpmenu", this._onCloseHelpMenu.bind(this))
    }
    private _onCloseHelpMenu() {
        this.helpMenuElement?.remove()
    }
    private _onToolbarItemSelected(event: any) {
        this.robotVisualizerElement.updateMode(event.detail.mode)
    }
    private _onComponentSelectorItemSelected(event: any) {
        this.robotVisualizerElement.updateSelectedRobotComponentType(event.detail.robotComponentType)
    }
    private _onDoneClicked() {
        this.serializeAndSendRobotComponents(this.robotVisualizerElement.robotComponents)
        this.dispatchEvent(this.onComponentEditorClose)
    }
    private _onComponentRemoved(event: any) {
        this.componentSelectorElement.onComponentRemoved(event.detail.robotComponentType)
    }
    private _onComponentPlaced() {
        this.componentSelectorElement.onComponentPlaced()
    }
}


