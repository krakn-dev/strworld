import html from "./main.html"
import css from "./main.css"
import * as esprima from "esprima"
import * as Utils from "../../../../utils"
import * as Ser from "../../../../serialization"

export class CustomElement extends HTMLElement {
    syntaxError: Ser.CodeError | undefined
    private syntaxHightlightElement: HTMLDivElement
    private slotElement: HTMLSlotElement
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.syntaxHightlightElement = this.shadowRoot!.getElementById("syntax-highlight") as HTMLDivElement
        this.slotElement = this.shadowRoot!.getElementById("slot") as HTMLSlotElement
        this.syntaxError = undefined
    }
    connectedCallback() {
        if (this.slotElement.assignedNodes().length != 0) {
            let code = (this.slotElement.assignedNodes()[0] as any).data
            if (code != undefined) {
                this.updateCode(code)
            }
        }
    }
    updateCode(code: string) {
        code = this.highlightCode(code)
        code = this.insertBrOnLineBreak(code)
        this.syntaxHightlightElement.innerHTML = code
    }
    updateScroll(scroll: Ser.Scroll) {
        this.syntaxHightlightElement.scrollTop = scroll.scrollTop
        this.syntaxHightlightElement.scrollLeft = scroll.scrollLeft
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
            this.syntaxError = new Ser.CodeError(false, e.description, e.lineNumber)
        }
        return text
    }
}
