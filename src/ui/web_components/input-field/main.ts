import html from "./main.html"
import css from "./main.css"
import * as SyntaxHighlight from "../syntax-highlight/main"
import * as Ser from "../../../serialization"

export class CustomElement extends HTMLElement {
    code: string
    get syntaxError(): Ser.CodeError | undefined {
        return this.syntaxHighlightElement.syntaxError
    }

    onScroll: CustomEvent
    onCodeChange: CustomEvent

    private textCodeElement: HTMLTextAreaElement
    private syntaxHighlightElement: SyntaxHighlight.CustomElement
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.textCodeElement = this.shadowRoot!.getElementById("text-code") as HTMLTextAreaElement
        this.syntaxHighlightElement = this.shadowRoot!.getElementById("syntax-highlight") as SyntaxHighlight.CustomElement
        this.code = ""
        this.onScroll = new CustomEvent(
            "scroll",
            { bubbles: true, cancelable: true, composed: true, detail: {} })
        this.onCodeChange = new CustomEvent("codechange",
            { bubbles: true, cancelable: true, composed: true })
    }
    connectedCallback() {
        this.textCodeElement.addEventListener("keydown", this._onKeyDown.bind(this))
        this.textCodeElement.addEventListener("input", this._onInput.bind(this))
        this.textCodeElement.addEventListener("scroll", this._onScroll.bind(this))
    }
    private _onInput() {
        this.code = this.textCodeElement.value
        this.syntaxHighlightElement.updateCode(this.code)
        this.dispatchEvent(this.onCodeChange)
    }
    private _onScroll() {
        let scroll = new Ser.Scroll(
            this.textCodeElement.scrollLeft,
            this.textCodeElement.scrollTop
        )
        this.onScroll.detail.data = scroll
        this.syntaxHighlightElement.updateScroll(scroll)
        this.dispatchEvent(this.onScroll)
    }
    private _onKeyDown(e: KeyboardEvent) {
        if (e.key == "Backspace") {
            this.removeOpeningBrace(e)
        }
        if (e.key == "Tab") {
            e.preventDefault();
            this.insertTab()
        }
        if (e.key == "Enter") {
            if (this.indentOnNewLineBetweenBraces()) {
                e.preventDefault();
            }
            else if (this.indentOnNewLine()) {
                e.preventDefault();
            }
        }
        this.insertClosingBrace(e)
    }

    private indentOnNewLine(): boolean {
        let numberOfSpaces = 0
        let startToCurrentPosition = this.textCodeElement.value.slice(0, this.textCodeElement.selectionStart).split("")
        for (let cI = startToCurrentPosition.length - 1; cI >= 0; cI--) {
            if (startToCurrentPosition[cI].match(/\r\n|\r|\n/)) {
                break
            }
            if (startToCurrentPosition[cI] == " ") {
                numberOfSpaces += 1
            } else {
                numberOfSpaces = 0
            }
        }
        let currentIndentLevel = Math.trunc(numberOfSpaces / 4)
        if (currentIndentLevel == 0) return false

        let newTextCode = this.textCodeElement.value.slice(0, this.textCodeElement.selectionStart) +
            "\n" + "    ".repeat(currentIndentLevel) + this.textCodeElement.value.slice(this.textCodeElement.selectionStart)
        let prevPosition = this.textCodeElement.selectionEnd
        this.textCodeElement.value = newTextCode
        this.textCodeElement.selectionEnd = prevPosition + 1 + numberOfSpaces

        this._onInput()
        return true

    }
    private indentOnNewLineBetweenBraces(): boolean {
        if (this.textCodeElement.value[this.textCodeElement.selectionStart - 1] == "{" &&
            this.textCodeElement.value[this.textCodeElement.selectionStart] == "}"
        ) {
            let numberOfSpaces = 0
            let startToCurrentPosition = this.textCodeElement.value.slice(0, this.textCodeElement.selectionStart).split("")
            for (let cI = startToCurrentPosition.length - 1; cI >= 0; cI--) {
                if (startToCurrentPosition[cI].match(/\r\n|\r|\n/)) {
                    break
                }
                if (startToCurrentPosition[cI] == " ") {
                    numberOfSpaces += 1
                } else {
                    numberOfSpaces = 0
                }
            }
            let currentIndentLevel = Math.trunc(numberOfSpaces / 4)
            let newTextCode = this.textCodeElement.value.slice(0, this.textCodeElement.selectionStart) +
                "\n" + "    ".repeat(Math.trunc(numberOfSpaces + 5) / 4) + "\n" + "    ".repeat(currentIndentLevel) + this.textCodeElement.value.slice(this.textCodeElement.selectionStart)
            let prevPosition = this.textCodeElement.selectionEnd
            this.textCodeElement.value = newTextCode
            this.textCodeElement.selectionEnd = prevPosition + (numberOfSpaces + 5)

            this._onInput()
            return true
        }
        return false
    }
    private removeOpeningBrace(key: KeyboardEvent) {
        let shouldRemoveFrontCharacter = false
        switch (this.textCodeElement.value[this.textCodeElement.selectionStart - 1]) {
            case ("{"): {
                if ("}" == this.textCodeElement.value[this.textCodeElement.selectionStart]) {
                    shouldRemoveFrontCharacter = true
                }
            } break;
            case ("("): {
                if (")" == this.textCodeElement.value[this.textCodeElement.selectionStart]) {
                    shouldRemoveFrontCharacter = true
                }
            } break;
            case ("["): {
                if ("]" == this.textCodeElement.value[this.textCodeElement.selectionStart]) {
                    shouldRemoveFrontCharacter = true
                }
            } break;
            case ('"'): {
                if ('"' == this.textCodeElement.value[this.textCodeElement.selectionStart]) {
                    shouldRemoveFrontCharacter = true
                }
            } break;
            case ("'"): {
                if ("'" == this.textCodeElement.value[this.textCodeElement.selectionStart]) {
                    shouldRemoveFrontCharacter = true
                }
            } break;
        }
        if (!shouldRemoveFrontCharacter) {
            return
        }
        let newTextCode = this.textCodeElement.value.slice(0, this.textCodeElement.selectionStart) +
            this.textCodeElement.value.slice(this.textCodeElement.selectionStart + 1)
        let prevPosition = this.textCodeElement.selectionEnd
        this.textCodeElement.value = newTextCode
        this.textCodeElement.selectionEnd = prevPosition
    }
    private insertClosingBrace(key: KeyboardEvent) {
        let characterToInsert: string | undefined = undefined
        switch (key.key) {
            case ("{"): {
                characterToInsert = "}"
            } break;
            case ("("): {
                characterToInsert = ")"
            } break;
            case ("["): {
                characterToInsert = "]"
            } break;
            case ('"'): {
                characterToInsert = '"'
            } break;
            case ("'"): {
                characterToInsert = "'"
            } break;
        }
        if (characterToInsert == undefined) {
            return
        }
        let newTextCode = this.textCodeElement.value.slice(0, this.textCodeElement.selectionStart) +
            characterToInsert + this.textCodeElement.value.slice(this.textCodeElement.selectionStart)
        let prevPosition = this.textCodeElement.selectionEnd
        this.textCodeElement.value = newTextCode
        this.textCodeElement.selectionEnd = prevPosition
        characterToInsert = undefined
    }
    private insertTab() {
        let tab = "    "
        let newTextCode = this.textCodeElement.value.slice(0, this.textCodeElement.selectionStart) +
            tab + this.textCodeElement.value.slice(this.textCodeElement.selectionStart)
        let prevPosition = this.textCodeElement.selectionEnd
        this.textCodeElement.value = newTextCode
        this.textCodeElement.selectionEnd = prevPosition + 4
        this._onInput()
    }
}
