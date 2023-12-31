import html from "./main.html"
import css from "./main.css"
import * as InputField from "../input-field/main"
import * as NumberLine from "../number-line/main"
import * as ErrorLine from "../error-line/main"
import * as RobotComponets from "../robot-components/main"

export class CustomElement extends HTMLElement {
    inputFieldElement: InputField.CustomElement
    numberLineElement: NumberLine.CustomElement
    errorLineElement: ErrorLine.CustomElement
    robotComponentsElement: RobotComponets.CustomElement
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.inputFieldElement = this.shadowRoot!.getElementById("input-field") as InputField.CustomElement
        this.numberLineElement = this.shadowRoot!.getElementById("number-line") as NumberLine.CustomElement
        this.errorLineElement = this.shadowRoot!.getElementById("error-line") as ErrorLine.CustomElement
        this.robotComponentsElement = this.shadowRoot!.getElementById("robot-components") as RobotComponets.CustomElement
    }
    connectedCallback() {
        this.inputFieldElement.addEventListener("scroll", this._onInputFieldScroll.bind(this))
        this.inputFieldElement.addEventListener("codechange", this._onInputFieldChange.bind(this))
    }
    private _onInputFieldScroll(e: any) {
        this.numberLineElement.scrollNumberLine(e.detail.scrollTop)
        this.errorLineElement.scrollErrorLine(e.detail.scrollTop)
    }
    private _onInputFieldChange() {
        this.numberLineElement.updateNumbers(this.inputFieldElement.code)
        this.errorLineElement.errorLine = this.inputFieldElement?.syntaxError?.line
        this.errorLineElement.updateLine(this.inputFieldElement.code)
    }
}


