import html from "./main.html"
import css from "./main.css"
import * as CoolButton from "../../shared/cool-button/main"
import * as CoolMenu from "../../shared/cool-menu/main"

export class CustomElement extends HTMLElement {
    private invalidRobotMenuElement: CoolMenu.CustomElement
    private descriptionElement: HTMLElement
    private okButtonElement: CoolButton.CustomElement
    private onOkPressed: CustomEvent

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.invalidRobotMenuElement = this.shadowRoot!.getElementById("invalid-robot-menu") as CoolMenu.CustomElement
        this.okButtonElement = this.shadowRoot!.getElementById("ok-button") as CoolButton.CustomElement
        this.descriptionElement = this.shadowRoot!.getElementById("description") as HTMLElement
        this.onOkPressed = new CustomEvent("okpressed", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.okButtonElement.addEventListener("clicked", this._onOk.bind(this))
    }
    setRed() {
        this.descriptionElement.innerText = `There are red components, that means that they are overlapping each other, try moving them apart or removing any of the involved components.`
    }
    setBlue() {
        this.descriptionElement.innerText = `There are blue components, that means that they are too far from the other components, try bringing them closer or placing a component between to bridge them, you can remove the blue components too.`
    }
    private _onOk() {
        this.dispatchEvent(this.onOkPressed)
    }
}


