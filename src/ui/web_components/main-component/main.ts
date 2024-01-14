import html from "./main.html"
import css from "./main.css"
import * as Ser from "../../../serialization"
import * as GameGraphics from "../game-graphics/main"
import * as GameInput from "../game-input/main"
import * as RobotMenu from "../robot-menu/main"
import * as CodeEditor from "../code-editor/main"

export class CustomElement extends HTMLElement {
    private mainComponentElement: HTMLDivElement
    private worker: Worker | undefined

    private gameGraphicsElement: GameGraphics.CustomElement | undefined
    private codeEditorElement: CodeEditor.CustomElement | undefined
    private gameInputElement: GameInput.CustomElement | undefined
    private robotMenuElement: RobotMenu.CustomElement | undefined

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.mainComponentElement = this.shadowRoot!.getElementById("main-component") as HTMLDivElement
    }
    private setupInitialElements() {
        this._addGameGraphicsElement()
        this._addGameInputElement()
        this._addRobotMenuElement()
    }

    private _onOpenCodeEditor() {
        this._addCodeEditorElement()
        this.gameInputElement?.remove()
        this.robotMenuElement?.remove()
    }
    private _onCloseCodeEditor() {
        this._addGameInputElement()
        this._addRobotMenuElement()
        this.codeEditorElement?.remove()
    }
    addWorker(newWorker: Worker) {
        this.worker = newWorker
        this.worker.onmessage = this._onWorkerMessage.bind(this)
        this.worker.postMessage(
            new Ser.Message(
                Ser.Messages.Start,
                new Ser.DOMData(window.innerWidth, window.innerHeight)
            ));
        this.setupInitialElements()
    }

    private _onWorkerMessage(data: any) {
        let msg = (data.data as Ser.Message)
        switch (msg.message) {
            case Ser.Messages.GraphicChanges: {
                this.gameGraphicsElement?.updateGraphics(msg.data as Ser.GraphicChanges)
            } break;
        }
    }
    private _addCodeEditorElement() {
        let element = document.createElement("code-editor")
        element.setAttribute("id", "code-editor")
        this.mainComponentElement.appendChild(element)
        this.codeEditorElement = element as CodeEditor.CustomElement
        this.codeEditorElement.addEventListener("closecodeeditor", this._onCloseCodeEditor.bind(this))
    }
    private _addRobotMenuElement() {
        let element = document.createElement("robot-menu")
        element.setAttribute("id", "robot-menu")
        this.mainComponentElement.appendChild(element)
        this.robotMenuElement = element as RobotMenu.CustomElement
        this.robotMenuElement.addEventListener("opencodeeditor", this._onOpenCodeEditor.bind(this))
    }
    private _addGameInputElement() {
        let element = document.createElement("game-input")
        element.setAttribute("id", "game-input")
        this.mainComponentElement.appendChild(element)
        this.gameInputElement = element as GameInput.CustomElement
        this.gameInputElement.addWorker(this.worker!)
    }
    private _addGameGraphicsElement() {
        let element = document.createElement("game-graphics")
        element.setAttribute("id", "game-graphics")
        this.mainComponentElement.appendChild(element)
        this.gameGraphicsElement = element as GameGraphics.CustomElement
    }
}

