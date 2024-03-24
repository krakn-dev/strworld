import html from "./main.html"
import css from "./main.css"
import * as Utils from "../../../../utils"
import * as Mat from "../../../../math"
import * as Ser from "../../../../serialization"

export class CustomElement extends HTMLElement {
    private worker: Worker | undefined

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.worker = undefined
    }
    connectedCallback() {
        document.addEventListener("keyup", this.onKeyboardPressEvent.bind(this),);
        document.addEventListener("keydown", this.onKeyboardPressEvent.bind(this));
        document.addEventListener("mouseup", this.onMousePressEvent.bind(this));
        document.addEventListener("mousedown", this.onMousePressEvent.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
    }
    private onMousePressEvent(event: MouseEvent) {
        this.requestPointerLock();
        let isButtonPressed: boolean
        let button: Ser.Buttons | undefined

        if (event.type == "mousedown") {
            isButtonPressed = true
        } else {
            isButtonPressed = false
        }

        if (event.button == 0) {
            button = Ser.Buttons.LMB
        }
        else if (event.button == 2) {
            button = Ser.Buttons.RMB
        }

        if (button == undefined) return
        this.sendButtonChange(button, isButtonPressed)
    }
    private onMouseMove(event: MouseEvent) {
        if (this.worker == undefined) return
        this.worker.postMessage(
            new Ser.Message(
                Ser.Messages.MouseMovement,
                new Mat.Vector2(event.movementX, event.movementY)))
    }
    private onKeyboardPressEvent(event: KeyboardEvent) {
        if (event.repeat) return
        let isButtonPressed: boolean
        let button: Ser.Buttons | undefined

        if (event.type == "keydown") {
            isButtonPressed = true
        } else {
            isButtonPressed = false
        }

        switch (event.code) {
            case "KeyE": button = Ser.Buttons.E; break;
            case "KeyW": button = Ser.Buttons.W; break;
            case "KeyA": button = Ser.Buttons.A; break;
            case "KeyS": button = Ser.Buttons.S; break
            case "KeyD": button = Ser.Buttons.D; break;
            case "ArrowUp": button = Ser.Buttons.Up; break;
            case "ArrowDown": button = Ser.Buttons.Down; break;
            case "ArrowLeft": button = Ser.Buttons.Left; break;
            case "ArrowRight": button = Ser.Buttons.Right; break;
            case "Space": button = Ser.Buttons.Space; break;
        }
        if (button == undefined) return
        this.sendButtonChange(button, isButtonPressed)
    }
    private sendButtonChange(button: Ser.Buttons, isPressed: boolean) {
        if (this.worker == undefined) {
            return
        }
        this.worker.postMessage(
            new Ser.Message(
                Ser.Messages.ButtonPress,
                new Ser.ButtonPress(button, isPressed)))
    }
}

