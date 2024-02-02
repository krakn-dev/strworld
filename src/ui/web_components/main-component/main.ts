import html from "./main.html"
import css from "./main.css"
import * as Ser from "../../../serialization"
import * as ComponentEditor from "../component-editor/main"
import * as GameGraphics from "../game-graphics/main"
import * as CodeEditor from "../code-editor/main"
import * as GameInput from "../game-input/main"
import * as RobotMenu from "../robot-menu/main"

export class CustomElement extends HTMLElement {
    private mainComponentElement: HTMLDivElement
    private worker: Worker | undefined

    private componentEditorElement: ComponentEditor.CustomElement | undefined
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
        //this._addGameGraphicsElement()
        //this._addGameInputElement()
        //this._addRobotMenuElement()
        this._addComponentEditorElement()
    }

    private _onCloseComponentEditor() {
        this._addGameInputElement()
        this._addRobotMenuElement()
        this._addGameGraphicsElement()
        this.componentEditorElement?.remove()
    }
    private _onCloseCodeEditor() {
        this._addGameInputElement()
        this._addRobotMenuElement()
        this.codeEditorElement?.remove()
    }
    private _onOpenComponentEditor() {
        this._addComponentEditorElement()
        this.gameGraphicsElement?.remove()
        this.gameInputElement?.remove()
        this.robotMenuElement?.remove()
    }
    private _onOpenCodeEditor() {
        this._addCodeEditorElement()
        this.gameInputElement?.remove()
        this.robotMenuElement?.remove()
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
            case Ser.Messages.AvailableRobotComponents: {
                this.componentEditorElement?.addAvailableRobotComponents(msg.data as Ser.AvailableRobotComponents)
            } break;
        }
    }
    private _addComponentEditorElement() {
        let element = document.createElement("component-editor")
        element.setAttribute("id", "component-editor")
        this.mainComponentElement.appendChild(element)
        this.componentEditorElement = element as ComponentEditor.CustomElement
        this.componentEditorElement.addWorker(this.worker!)
        this.componentEditorElement.addEventListener("closecomponenteditor", this._onCloseComponentEditor.bind(this))
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
        this.robotMenuElement.addEventListener("opencomponenteditor", this._onOpenComponentEditor.bind(this))
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
        this.gameGraphicsElement.addWorker(this.worker!)
    }
}

