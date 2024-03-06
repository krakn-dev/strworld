import html from "./main.html"
import css from "./main.css"
import * as RobotVisualizer from "./robot-visualizer/main"
import * as CoolButton from "../shared/cool-button/main"
import * as Comps from '../../../ecs/components';
import * as ComponentSelector from "./component-selector/main"
import * as Ser from "../../../serialization"
import * as Utils from '../../../utils';
import * as HelpMenu from "./help-menu/main"
import * as QuitMenu from "./quit-menu/main"
import * as ConfirmPlacementMenu from "./confirm-placement-menu/main"
import * as InvalidRobotMenu from "./invalid-robot-menu/main"
import * as Toolbar from "./toolbar/main"

export class CustomElement extends HTMLElement {
    onComponentEditorClose: CustomEvent
    private worker: Worker | undefined
    private componentEditorElement: HTMLDivElement
    private robotVisualizerElement: RobotVisualizer.CustomElement
    private componentSelectorElement: ComponentSelector.CustomElement
    private toolbarElement: Toolbar.CustomElement
    private helpMenuElement: HelpMenu.CustomElement | undefined
    private quitMenuElement: QuitMenu.CustomElement | undefined
    private confirmPlacementMenuElement: ConfirmPlacementMenu.CustomElement | undefined
    private invalidRobotMenuElement: InvalidRobotMenu.CustomElement | undefined
    helpButtonElement: CoolButton.CustomElement
    quitButtonElement: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.helpButtonElement = this.shadowRoot!.getElementById("help-button") as CoolButton.CustomElement
        this.quitButtonElement = this.shadowRoot!.getElementById("quit-button") as CoolButton.CustomElement
        this.componentEditorElement = this.shadowRoot!.getElementById("component-editor") as HTMLDivElement
        this.robotVisualizerElement = this.shadowRoot!.getElementById("robot-visualizer") as RobotVisualizer.CustomElement
        this.componentSelectorElement = this.shadowRoot!.getElementById("component-selector") as ComponentSelector.CustomElement
        this.toolbarElement = this.shadowRoot!.getElementById("toolbar") as Toolbar.CustomElement
        this.onComponentEditorClose = new CustomEvent("closecomponenteditor", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.helpButtonElement.addEventListener("clicked", this._addHelpMenu.bind(this))
        this.quitButtonElement.addEventListener("clicked", this._onQuitClicked.bind(this))
        this.robotVisualizerElement.addEventListener("componentplaced", this._onComponentPlaced.bind(this))
        this.robotVisualizerElement.addEventListener("componentremoved", this._onComponentRemoved.bind(this))
        this.robotVisualizerElement.addEventListener("showconfirmplacementmenu", this._onOpenConfirmPlacementMenu.bind(this))
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
        let serializedComponents: Comps.RobotComponent[] = []
        for (let rC of robotComponents) {
            let robotComponent = new Comps.RobotComponent(rC.robotComponentType, 0, 0)

            robotComponent.positionOffset = new Utils.Vector3(
                rC.object.position.x,
                rC.object.position.y,
                rC.object.position.z);
            robotComponent.rotationOffset = new Utils.Quaternion(
                rC.object.quaternion.x,
                rC.object.quaternion.y,
                rC.object.quaternion.z,
                rC.object.quaternion.w);
            serializedComponents.push(robotComponent)
        }
        this.worker!.postMessage(
            new Ser.Message(Ser.Messages.RobotComponents, serializedComponents))
    }
    private isAnyMenuOpen() {
        return (
            this.helpMenuElement != undefined ||
            this.quitMenuElement != undefined ||
            this.confirmPlacementMenuElement != undefined ||
            this.invalidRobotMenuElement != undefined
        )
    }
    private _addInvalidRobotMenu() {
        if (this.isAnyMenuOpen()) return

        let element = document.createElement("invalid-robot-menu")
        element.setAttribute("id", "invalid-robot-menu")
        this.componentEditorElement.appendChild(element)
        this.invalidRobotMenuElement = element as InvalidRobotMenu.CustomElement
        this.invalidRobotMenuElement.addEventListener("okpressed", this._onInvalidRobotMenuOkPressed.bind(this))
    }
    private _addHelpMenu() {
        if (this.isAnyMenuOpen()) return

        let element = document.createElement("help-menu")
        element.setAttribute("id", "help-menu")
        this.componentEditorElement.appendChild(element)
        this.helpMenuElement = element as HelpMenu.CustomElement
        this.helpMenuElement.addEventListener("closehelpmenu", this._onCloseHelpMenu.bind(this))
    }
    private _onOpenConfirmPlacementMenu() {
        if (this.isAnyMenuOpen()) return

        let element = document.createElement("confirm-placement-menu")
        element.setAttribute("id", "confirm-placement-menu")
        this.componentEditorElement.appendChild(element)
        this.confirmPlacementMenuElement = element as ConfirmPlacementMenu.CustomElement
        this.confirmPlacementMenuElement.addEventListener("nopressed", this._onConfirmPlacementMenuNoPressed.bind(this))
        this.confirmPlacementMenuElement.addEventListener("yespressed", this._onConfirmPlacementMenuYesPressed.bind(this))
    }
    private _addQuitMenu() {
        if (this.isAnyMenuOpen()) return

        let element = document.createElement("quit-menu")
        element.setAttribute("id", "quit-menu")
        this.componentEditorElement.appendChild(element)
        this.quitMenuElement = element as QuitMenu.CustomElement
        this.quitMenuElement.addEventListener("savepressed", this._onQuitMenuSavePressed.bind(this))
        this.quitMenuElement.addEventListener("notsavepressed", this._onQuitMenuNotSavePressed.bind(this))
        this.quitMenuElement.addEventListener("cancelpressed", this._onQuitMenuCancelPressed.bind(this))
    }
    private _onConfirmPlacementMenuYesPressed() {
        this.robotVisualizerElement.onPlaceAnywayClicked()
        this.confirmPlacementMenuElement?.remove()
        this.confirmPlacementMenuElement = undefined
    }
    private _onConfirmPlacementMenuNoPressed() {
        this.confirmPlacementMenuElement?.remove()
        this.confirmPlacementMenuElement = undefined
    }
    private _onQuitMenuCancelPressed() {
        this.quitMenuElement?.remove()
        this.quitMenuElement = undefined
    }
    private _onCloseHelpMenu() {
        this.helpMenuElement?.remove()
        this.helpMenuElement = undefined
    }
    private _onInvalidRobotMenuOkPressed() {
        this.invalidRobotMenuElement?.remove()
        this.invalidRobotMenuElement = undefined
    }
    private _onQuitMenuNotSavePressed() {
        this.dispatchEvent(this.onComponentEditorClose)
    }
    private _onQuitMenuSavePressed() {
        this.quitMenuElement?.remove()
        this.quitMenuElement = undefined
        if (this.robotVisualizerElement.hasRedRobotComponents) {
            this._addInvalidRobotMenu()
            this.invalidRobotMenuElement?.setRed()
            return
        }
        if (this.robotVisualizerElement.hasBlueRobotComponents) {
            this._addInvalidRobotMenu()
            this.invalidRobotMenuElement?.setBlue()
            return
        }
        this.serializeAndSendRobotComponents(this.robotVisualizerElement.robotComponents)
        this.dispatchEvent(this.onComponentEditorClose)
    }
    private _onToolbarItemSelected(event: any) {
        this.robotVisualizerElement.updateMode(event.detail.mode)
    }
    private _onComponentSelectorItemSelected(event: any) {
        this.robotVisualizerElement.updateSelectedRobotComponentType(event.detail.robotComponentType)
    }
    private _onQuitClicked() {
        this._addQuitMenu()
    }
    private _onComponentRemoved(event: any) {
        this.componentSelectorElement.onComponentRemoved(event.detail.robotComponentType)
    }
    private _onComponentPlaced() {
        this.componentSelectorElement.onComponentPlaced()
    }
}


