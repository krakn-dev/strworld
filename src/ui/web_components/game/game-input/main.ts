import html from "./main.html"
import css from "./main.css"
import * as Utils from "../../../../utils"
import * as Ser from "../../../../serialization"

export class CustomElement extends HTMLElement {
    private worker: Worker | undefined
    private movementDirection: Utils.Vector2
    private updateInputInterval: any | undefined
    private up = false
    private down = false
    private left = false
    private right = false

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.movementDirection = new Utils.Vector2(0, 0)
        this.worker = undefined
    }
    connectedCallback() {
        document.addEventListener("keyup", this.onKeyUp.bind(this),);
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        this.updateInputInterval = setInterval(this.sendInputToWorker.bind(this), 30)
    }
    disconnectedCallback() {
        if (this.updateInputInterval != undefined) {
            clearInterval(this.updateInputInterval)
        }
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
    }
    private sendInputToWorker() {
        if (this.worker == undefined) {
            return
        }
        this.worker.postMessage(
            new Ser.Message(
                Ser.Messages.Input,
                new Ser.Input(
                    this.movementDirection,
                )
            )
        )
    }
    private onKeyDown(event: any) {
        if (event.key == "w" || event.key == "ArrowUp")
            this.up = true

        if (event.key == "s" || event.key == "ArrowDown")
            this.down = true

        if (event.key == "a" || event.key == "ArrowLeft")
            this.left = true

        if (event.key == "d" || event.key == "ArrowRight")
            this.right = true

        this.setPlayerInput()
    }
    private onKeyUp(event: any) {

        if (event.key == "w" || event.key == "ArrowUp")
            this.up = false

        if (event.key == "s" || event.key == "ArrowDown")
            this.down = false

        if (event.key == "a" || event.key == "ArrowLeft")
            this.left = false

        if (event.key == "d" || event.key == "ArrowRight")
            this.right = false

        this.setPlayerInput()
    }

    private setPlayerInput() {
        this.movementDirection.x = 0
        this.movementDirection.y = 0

        if (this.down)
            this.movementDirection.y--

        if (this.up)
            this.movementDirection.y++

        if (this.left)
            this.movementDirection.x--

        if (this.right)
            this.movementDirection.x++
    }
}

