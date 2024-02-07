import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private errorLineElement: HTMLDivElement
    errorLine: number | undefined
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.errorLineElement = this.shadowRoot!.getElementById("error-line") as HTMLDivElement
        this.errorLine = undefined
    }
    scrollErrorLine(scrollTop: number) {
        this.errorLineElement.scrollTop = scrollTop
    }
    updateLine(code: string) {
        this.errorLineElement.innerHTML = ""
        if (this.errorLine == undefined) {
            for (let n = 0; n <= code.split(/\r\n|\r|\n/).length; n++) {
                this.errorLineElement!.insertAdjacentHTML("beforeend", `<span class="void">a</span>\n`)
            }
        } else {
            for (let n = 0; n <= code.split(/\r\n|\r|\n/).length; n++) {
                if (n + 1 == this.errorLine) {
                    this.errorLineElement!.insertAdjacentHTML("beforeend", `<span>×</span>\n`)
                } else {
                    this.errorLineElement!.insertAdjacentHTML("beforeend", `<span class="void">a</span>\n`)
                }
            }
        }
    }
}
