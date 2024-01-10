import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private numberLineElement: HTMLDivElement
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.numberLineElement = this.shadowRoot!.getElementById("number-line") as HTMLDivElement
    }
    scrollNumberLine(scrollTop: number) {
        this.numberLineElement.scrollTop = scrollTop
    }
    updateNumbers(code: string) {
        this.numberLineElement!.innerHTML = ""
        for (let n = 1; n <= code.split(/\r\n|\r|\n/).length; n++) {
            this.numberLineElement!.insertAdjacentHTML("beforeend", `<div>${n}</div>`)
        }
    }
}
