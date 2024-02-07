import html from "./main.html"
import css from "./main.css"
import * as Ser from "../../../serialization"
import * as InputField from "./input-field/main"
import * as NumberLine from "./number-line/main"
import * as ErrorLine from "./error-line/main"
import * as RobotComponentsGrid from "./robot-components-grid/main"
import * as Terminal from "./terminal/main"
import * as CoolButton from "../shared/cool-button/main"

export class CustomElement extends HTMLElement {
    onCodeEditorClose: CustomEvent
    private inputFieldElement: InputField.CustomElement
    private numberLineElement: NumberLine.CustomElement
    private errorLineElement: ErrorLine.CustomElement
    private robotComponentsGridElement: RobotComponentsGrid.CustomElement
    private terminalElement: Terminal.CustomElement
    private doneButtonElement: CoolButton.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.inputFieldElement = this.shadowRoot!.getElementById("input-field") as InputField.CustomElement
        this.numberLineElement = this.shadowRoot!.getElementById("number-line") as NumberLine.CustomElement
        this.errorLineElement = this.shadowRoot!.getElementById("error-line") as ErrorLine.CustomElement
        this.robotComponentsGridElement = this.shadowRoot!.getElementById("robot-components-grid") as RobotComponentsGrid.CustomElement
        this.terminalElement = this.shadowRoot!.getElementById("terminal") as Terminal.CustomElement
        this.doneButtonElement = this.shadowRoot!.getElementById("done-button") as CoolButton.CustomElement

        this.onCodeEditorClose = new CustomEvent("closecodeeditor", { bubbles: false, composed: true, cancelable: true })
    }
    connectedCallback() {
        this.doneButtonElement.addEventListener("clicked", this._onDoneClicked.bind(this))
        this.inputFieldElement.addEventListener("scroll", this._onInputFieldScroll.bind(this))
        this.inputFieldElement.addEventListener("codechange", this._onInputFieldChange.bind(this))
    }
    private _onDoneClicked() {
        this.dispatchEvent(this.onCodeEditorClose)
    }
    private _onInputFieldScroll(e: any) {
        let scroll = e.detail as Ser.Scroll
        this.numberLineElement.scrollNumberLine(scroll.scrollTop)
        this.errorLineElement.scrollErrorLine(scroll.scrollTop)
    }
    private _onInputFieldChange() {
        this.numberLineElement.updateNumbers(this.inputFieldElement.code)
        this.errorLineElement.errorLine = this.inputFieldElement?.syntaxError?.lineNumber
        this.errorLineElement.updateLine(this.inputFieldElement.code)
    }
}


