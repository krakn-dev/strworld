import html from "./main.html"
import css from "./main.css"

export class CustomElement extends HTMLElement {
    private logsElement: HTMLPreElement
    private clearButtonElement: HTMLButtonElement
    private emptyTerminalAscii: string[]
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.clearButtonElement = this.shadowRoot!.getElementById("clear-button") as HTMLButtonElement
        this.logsElement = this.shadowRoot!.getElementById("logs") as HTMLPreElement
        this.emptyTerminalAscii = [
            `  //)_
<('  /  nothing to show
  ""

      _(\\\\
      \\  ')>
        "" `,
            `          _________
         /         \\  nothing to show
        |           |
        |  _    _   |
        |           |           .'.
         \\         /    _      /_ _\\
         /         |   '. \\   ___|___
        -|          \\   / |---\\_____/---
   _---' /   __      |_/  /
 .- - -| |  | .\\ / \\     /
       |.|  -  |/   '---
      |/ /  |  \\.
     '   \\ /
          /`]
    }

    getRandomAscii(): string {
        let randomAscii =
            this.emptyTerminalAscii[Math.floor(Math.random() * this.emptyTerminalAscii.length)];
        return `<span id="ascii-dimmed">${randomAscii}</span>`
    }
    connectedCallback() {
        this.clearButtonElement.addEventListener(
            "click",
            () => {
                this.logsElement.innerHTML = this.getRandomAscii()
            })
        this.logsElement.innerHTML = this.getRandomAscii()
    }

    addLogs(log: string) {
        if (
            this.logsElement.innerHTML == `<span id="ascii-dimmed">${this.emptyTerminalAscii[0]}</span>` ||
            this.logsElement.innerHTML == `<span id="ascii-dimmed">${this.emptyTerminalAscii[1]}</span>`
        ) {
            this.logsElement.innerHTML = ""
        }
        this.logsElement.insertAdjacentHTML("beforeend", `\n${log}`)
    }
}
