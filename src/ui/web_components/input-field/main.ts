import html from "./main.html"
import css from "./main.css"

import * as esprima from "esprima"
import * as Utils from "../../../utils"

export class CustomElement extends HTMLElement {
    code: string
    syntaxError: any | undefined

    onScroll: CustomEvent
    onCodeChange: CustomEvent

    private textCodeElement: HTMLTextAreaElement
    private visualCodeElement: HTMLDivElement
    // private cursorPosition: number | undefined
    //    private checkCursorMovedInterval: any
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.textCodeElement = this.shadowRoot!.getElementById("text-code") as HTMLTextAreaElement
        this.visualCodeElement = this.shadowRoot!.getElementById("visual-code") as HTMLDivElement

        //       this.checkCursorMovedInterval = undefined
        this.code = ""
        //    this.cursorPosition = undefined
        this.onScroll = new CustomEvent(
            "scroll",
            { bubbles: true, cancelable: true, composed: true, detail: { scrollTop: 0, scrollLeft: 0 } })
        this.onCodeChange = new CustomEvent("codechange",
            { bubbles: true, cancelable: true, composed: true })
        this.syntaxError = undefined
    }
    connectedCallback() {
        this.textCodeElement.addEventListener("keydown", this._onKeyDown.bind(this))
        this.textCodeElement.addEventListener("input", this._onInput.bind(this))
        this.textCodeElement.addEventListener("scroll", this._onScroll.bind(this))
        //      this.checkCursorMovedInterval = setInterval(this.checkIfCursorMoved.bind(this), 100)
    }
    //  disconnectedCallback() {
    //      if (this.checkCursorMovedInterval != undefined) {
    //          clearInterval(this.checkCursorMovedInterval)
    //      }
    //  }
    private _onInput() {
        let codeText = this.textCodeElement.value
        this.code = codeText
        codeText = this.highlightCode(codeText)
        codeText = this.insertBrOnLineBreak(codeText)
        this.visualCodeElement.innerHTML = codeText
        this.dispatchEvent(this.onCodeChange)
    }
    private _onScroll() {
        this.onScroll.detail.scrollTop = this.textCodeElement.scrollTop
        this.onScroll.detail.scrollLeft = this.textCodeElement.scrollLeft
        this.visualCodeElement.scrollTop = this.textCodeElement.scrollTop
        this.visualCodeElement.scrollLeft = this.textCodeElement.scrollLeft
        this.dispatchEvent(this.onScroll)
    }
    // private checkIfCursorMoved() {
    //     if (this.cursorPosition == undefined) {
    //         this.cursorPosition = this.textCodeElement.selectionStart
    //     }
    //     if (this.cursorPosition != this.textCodeElement.selectionStart) {
    //         this.cursorPosition = this.textCodeElement.selectionStart
    //     }
    // }

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
    private insertBrOnLineBreak(text: string): string {
        return text.replace(/\r\n|\r|\n/g, "<br/><span class='void'> </span>")
    }
    private highlightCode(text: string): string {
        try {
            let syntax = esprima.tokenize(text, { range: true })

            this.syntaxError = undefined

            for (let wI = syntax.length - 1; wI >= 0; wI--) {
                let w = syntax[wI]
                // functions
                if (w.type == "Identifier" && !((syntax.length - 1) < (wI + 1)) && syntax[wI + 1] != undefined && syntax[wI + 1].value == "(") {
                    let range: number[] = (w as any).range
                    text = Utils.replaceRange(
                        text,
                        range[0],
                        range[1],
                        (v: string) => `<span class="function">${v}</span>`
                    )
                }
                else if (w.type == "Identifier") {
                    let range: number[] = (w as any).range
                    text = Utils.replaceRange(
                        text,
                        range[0],
                        range[1],
                        (v: string) => `<span class="identifier">${v}</span>`
                    )
                }
                if (w.type == "Punctuator") {
                    let range: number[] = (w as any).range
                    text = Utils.replaceRange(
                        text,
                        range[0],
                        range[1],
                        (v: string) => `<span class="punctuator">${v}</span>`
                    )
                }
                if (w.type == "Numeric") {
                    let range: number[] = (w as any).range
                    text = Utils.replaceRange(
                        text,
                        range[0],
                        range[1],
                        (v: string) => `<span class="numeric">${v}</span>`
                    )
                }
                if (w.type == "Keyword") {
                    let range: number[] = (w as any).range
                    text = Utils.replaceRange(
                        text,
                        range[0],
                        range[1],
                        (v: string) => `<span class="keyword">${v}</span>`
                    )
                }
                if (w.type == "String") {
                    let range: number[] = (w as any).range
                    text = Utils.replaceRange(
                        text,
                        range[0],
                        range[1],
                        (v: string) => `<span class="string">${v}</span>`
                    )
                }
            }
        } catch (e: any) {
            let error = {
                index: e.index,
                line: e.lineNumber,
                description: e.description
            }
            this.syntaxError = error
        }

        //        text = text.replace(/\bclass\b/g, (v) => `<span class='class'>${v}</span>`)
        //        text = text.replace(/\bvar\b/g, (v) => `<span class='var'>${v}</span>`)
        //        text = text.replace(/\bfunction\b/g, (v) => `<span class='function'>${v}</span>`)
        //        text = text.replace(/\blet\b/g, (v) => `<span class='let'>${v}</span>`)
        //        text = text.replace(/\b\d+\b/g, (v) => `<span class='number'>${v}</span>`)
        //        text = text.replace(/"(.*?)"/g, (v) => `<span class='quotes'>${v}</span>`)
        return text
    }
}
//let runCodeButtonElement: HTMLButtonElement = document.getElementById("run-code-button") as HTMLButtonElement
//
//export let code: string | undefined = undefined;
//
//function updateNumberLine() {
//    numberLineElement!.innerHTML = ""
//    for (let n = 1; n <= textCodeElement.value.split(/\r\n|\r|\n/).length; n++) {
//        numberLineElement!.insertAdjacentHTML("beforeend", `<div>${n}</div>`)
//    }
//}
//function highlightCode(text: string): string {
//    text = text.replace(/\bhello\b/g, "<span class='hello'>hello</span>")
//    text = text.replace(/\bworld\b/g, "<span class='world'>world</span>")
//    text = text.replace(/\b\d+\b/g, (v) => { return `<span class='number'>${v}</span>` })
//    return text
//}
//function insertBr(text: string): string {
//    return text.replace(/\r\n|\r|\n/g, "<br/><span class='empty'> </span>")
//}
//runCodeButtonElement.addEventListener("click", () => {
//    code = textCodeElement.value
//    try {
//        esprima.parseScript(code)
//    } catch (e: any) {
//        console.log({ e })
//        console.log(e.lineNumber)
//    }
//});
//function updateVisualCode() {
//
//
//
//
//}
//let characterToInsert: string | undefined = undefined
//textCodeElement?.addEventListener("keydown", (e) => {
//    if (e.key == "{") {
//        characterToInsert = "}"
//    }
//    if (e.key == "[") {
//        characterToInsert = "]"
//    }
//    if (e.key == "Tab") {
//        let tab = "  "
//        e.preventDefault();
//
//        let newTextCode = textCodeElement.value.slice(0, textCodeElement.selectionStart) +
//            tab + textCodeElement.value.slice(textCodeElement.selectionStart)
//        let prevPosition = textCodeElement.selectionEnd
//        textCodeElement.value = newTextCode
//        textCodeElement.selectionEnd = prevPosition + 2
//
//        console.log(textCodeElement.value)
//        updateNumberLine()
//        updateVisualCode()
//    }
//    if (characterToInsert == undefined) {
//        return
//    }
//})
//textCodeElement?.addEventListener("input", (_) => {
//    if (characterToInsert != undefined) {
//        let newTextCode = textCodeElement.value.slice(0, textCodeElement.selectionStart) +
//            characterToInsert + textCodeElement.value.slice(textCodeElement.selectionStart)
//        let prevPosition = textCodeElement.selectionEnd
//        textCodeElement.value = newTextCode
//        characterToInsert = undefined
//        textCodeElement.selectionEnd = prevPosition
//    }
//    updateNumberLine()
//    updateVisualCode()
//})
//textCodeElement?.addEventListener("scroll", (_) => {
//    numberLineElement!.scrollTop = textCodeElement.scrollTop
//    visualCodeElement!.scrollLeft = textCodeElement.scrollLeft
//    visualCodeElement!.scrollTop = textCodeElement.scrollTop
//})
