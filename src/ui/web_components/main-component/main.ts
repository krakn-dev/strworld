import html from "./main.html"
import css from "./main.css"
import * as Ser from "../../../serialization"
import * as GameGraphics from "../game-graphics/main"
import * as GameInput from "../game-input/main"

export class CustomElement extends HTMLElement {
    private worker: Worker | undefined
    private mainComponentElement: HTMLDivElement
    private gameGraphicsElement: GameGraphics.CustomElement
    private gameInputElement: GameInput.CustomElement

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.mainComponentElement = this.shadowRoot!.getElementById("main-component") as HTMLDivElement
        this.gameGraphicsElement = this.shadowRoot!.getElementById("game-graphics") as GameGraphics.CustomElement
        this.gameInputElement = this.shadowRoot!.getElementById("game-input") as GameInput.CustomElement
        this.worker = undefined
    }
    connectedCallback() {
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
        this.gameInputElement.addWorker(newWorker)


        this.worker.onmessage = this._onWorkerMessage.bind(this)
        this.worker.postMessage(
            new Ser.Message(
                Ser.Messages.Start,
                new Ser.DOMData(window.innerWidth, window.innerHeight)
            ));
    }
    _onWorkerMessage(data: any) {
        let msg = (data.data as Ser.Message)
        switch (msg.message) {
            case Ser.Messages.GraphicChanges: {
                this.gameGraphicsElement.updateGraphics(msg.data as Ser.GraphicChanges)
            } break;
        }
    }
}

