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

    private _gameGraphicsStringElement: string
    private _codeEditorStringElement: string
    private _gameInputStringElement: string
    private _robotMenuStringElement: string

    private gameGraphicsElement: GameGraphics.CustomElement | undefined
    private codeEditorElement: CodeEditor.CustomElement | undefined
    private gameInputElement: GameInput.CustomElement | undefined
    private robotMenuElement: RobotMenu.CustomElement | undefined
        
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.mainComponentElement = this.shadowRoot!.getElementById("main-component") as HTMLDivElement

        this._gameGraphicsStringElement =  '<game-graphics id="game-graphics"></game-graphics>'
        this._codeEditorStringElement =  '<code-editor id="code-editor"></code-editor>'
         this._gameInputStringElement= '<game-input id="game-input"></game-input>'
        this._robotMenuStringElement = '<robot-menu id="robot-menu"></robot-menu>'
    }
    private setupInitialElements() {
        this.mainComponentElement.insertAdjacentHTML(
        "beforeend", 
        this._gameInputStringElement +
        this._gameGraphicsStringElement +
        this._robotMenuStringElement) 

        this.gameGraphicsElement = this.shadowRoot!.getElementById("game-graphics") as GameGraphics.CustomElement
        this.gameInputElement = this.shadowRoot!.getElementById("game-input") as GameInput.CustomElement
        this.robotMenuElement = this.shadowRoot!.getElementById("robot-menu") as RobotMenu.CustomElement

        this.robotMenuElement.addEventListener("opencodeeditor", this._onOpenCodeEditor.bind(this))
        this.gameInputElement.addWorker(this.worker!)
    }
    private _onOpenCodeEditor() {
        this.mainComponentElement.insertAdjacentHTML(
        "beforeend", 
        this._codeEditorStringElement) 
        this.gameInputElement?.remove()
        this.robotMenuElement?.remove()
        this.codeEditorElement = this.shadowRoot!.getElementById("code-editor") as CodeEditor.CustomElement
        this.codeEditorElement.addEventListener("closecodeeditor", this._onCloseCodeEditor.bind(this))
    }
    private _onCloseCodeEditor() {
        this.mainComponentElement.insertAdjacentHTML(
        "beforeend", 
        this._gameInputStringElement +
        this._robotMenuStringElement
        ) 
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
                if(this.gameGraphicsElement != undefined) {
                    this.gameGraphicsElement.updateGraphics(msg.data as Ser.GraphicChanges)
                }
            } break;
        }
    }
    private _gameGraphicsStringElement: string
    private _codeEditorStringElement: string
    private _gameInputStringElement: string
    private _robotMenuStringElement: string

    private gameGraphicsElement: GameGraphics.CustomElement | undefined
    private codeEditorElement: CodeEditor.CustomElement | undefined
    private gameInputElement: GameInput.CustomElement | undefined
    private robotMenuElement: RobotMenu.CustomElement | undefined
        
    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.shadowRoot!.innerHTML = html + `<style>${css[0][1]}</style>`
        this.mainComponentElement = this.shadowRoot!.getElementById("main-component") as HTMLDivElement

        this._codeEditorStringElement =  '<code-editor id="code-editor"></code-editor>'
         this._gameInputStringElement= '<game-input id="game-input"></game-input>'
        this._robotMenuStringElement = '<robot-menu id="robot-menu"></robot-menu>'
    }
    addGameGraphicsElement() {
        let elementString =  '<game-graphics id="game-graphics"></game-graphics>'
        this.mainComponentElement.insertAdjacentHTML("beforeend", elementString)
    }
}

