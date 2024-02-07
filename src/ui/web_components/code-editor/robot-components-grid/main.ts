import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private gridElement: HTMLDivElement
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.gridElement = this.shadowRoot!.getElementById("grid") as HTMLDivElement
    }

    connectedCallback() {
        let componentTemplate = `<div class="item">
            <component-info>
                <span slot="title">front-left-wheel</span>
                <span slot="description">
                    <syntax-highlight scrollable="true">
                    sajdksaal
// go to a position
let hello = "helo"
motor.go(new Vector3(99,99,99))
d
a
aadjskaldsa
a
dsadsad
saadjskadkkkk
ds
ad
                    </syntax-highlight>
                    hello~
                    dsa
                    dsaaaaaaaaaaaaaaaaaaaaaaaaaaa
                    ds
                    a
                    ds
                    adsa
                </span>
            </component-info>
        </div>`
        this.gridElement.insertAdjacentHTML("beforeend", componentTemplate)
        this.gridElement.insertAdjacentHTML("beforeend", componentTemplate)
        this.gridElement.insertAdjacentHTML("beforeend", componentTemplate)
        this.gridElement.insertAdjacentHTML("beforeend", componentTemplate)
        this.gridElement.insertAdjacentHTML("beforeend", componentTemplate)
        this.gridElement.insertAdjacentHTML("beforeend", componentTemplate)
    }
}
