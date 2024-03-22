import html from "./main.html"
import css from "./main.css"
import * as Utils from "../../../../utils"
import * as Ser from "../../../../serialization"

export class CustomElement extends HTMLElement {
    private worker: Worker | undefined
    private updateInputInterval: any | undefined

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.worker = undefined
    }
    connectedCallback() {
        document.addEventListener("keyup", this.onKeyUp.bind(this),);
        document.addEventListener("keydown", this.onKeyDown.bind(this));
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
    }
    private sendKeyChange(key: Ser.Keys, isPressed: boolean) {
        if (this.worker == undefined) {
            return
        }
        this.worker.postMessage(
            new Ser.Message(
                Ser.Messages.Input,
                new Ser.Input(key, isPressed)))
    }
    private onKeyDown(event: KeyboardEvent) {
        if (event.repeat) return

        switch (event.code) {
            case "KeyW":
                this.sendKeyChange(Ser.Keys.W, true)
                break;

            case "KeyA":
                this.sendKeyChange(Ser.Keys.A, true)
                break;

            case "KeyS":
                this.sendKeyChange(Ser.Keys.S, true)
                break;

            case "KeyD":
                this.sendKeyChange(Ser.Keys.D, true)
                break;

            case "ArrowUp":
                this.sendKeyChange(Ser.Keys.Up, true)
                break;

            case "ArrowDown":
                this.sendKeyChange(Ser.Keys.Down, true)
                break;

            case "ArrowLeft":
                this.sendKeyChange(Ser.Keys.Left, true)
                break;

            case "ArrowRight":
                this.sendKeyChange(Ser.Keys.Right, true)
                break;

            case "Space":
                this.sendKeyChange(Ser.Keys.Space, true)
                break;
        }
    }
    private onKeyUp(event: KeyboardEvent) {
        if (event.repeat) return

        switch (event.code) {
            case "KeyW":
                this.sendKeyChange(Ser.Keys.W, false)
                break;

            case "KeyA":
                this.sendKeyChange(Ser.Keys.A, false)
                break;

            case "KeyS":
                this.sendKeyChange(Ser.Keys.S, false)
                break;

            case "KeyD":
                this.sendKeyChange(Ser.Keys.D, false)
                break;

            case "ArrowUp":
                this.sendKeyChange(Ser.Keys.Up, false)
                break;

            case "ArrowDown":
                this.sendKeyChange(Ser.Keys.Down, false)
                break;

            case "ArrowLeft":
                this.sendKeyChange(Ser.Keys.Left, false)
                break;

            case "ArrowRight":
                this.sendKeyChange(Ser.Keys.Right, false)
                break;

            case "Space":
                this.sendKeyChange(Ser.Keys.Space, false)
                break;
        }
    }
}

