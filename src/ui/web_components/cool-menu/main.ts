import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private coolMenuElement: HTMLDivElement
    private buttonsElement: HTMLDivElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.coolMenuElement = this.shadowRoot!.getElementById("cool-menu") as HTMLDivElement
        this.buttonsElement = this.shadowRoot?.getElementById("buttons") as HTMLDivElement
    }
    connectedCallback() {
        this.setButtonsDirection() 
    }
    private setButtonsDirection() {
        let buttonsDirection = this.getAttribute("buttons-direction");
        if(buttonsDirection == "row") {
            this.buttonsElement.setAttribute("class", "row")
        }
        else {
            this.buttonsElement.setAttribute("class", "column")
        }
    }
}
