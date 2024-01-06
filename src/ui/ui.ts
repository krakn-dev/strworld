import * as esprima from "esprima"
import "./web_components/components"

//let numberLineElement = document.getElementById("number-line")
//let textCodeElement: HTMLTextAreaElement = document.getElementById("text-code") as HTMLTextAreaElement
//let visualCodeElement: HTMLDivElement = document.getElementById("visual-code") as HTMLDivElement
//let runCodeButtonElement: HTMLButtonElement = document.getElementById("run-code-button") as HTMLButtonElement
//
//export let code: string | undefined = undefined;
//
//function updateNumberLine() {
//    numberLineElement!.innerHTML = ""
//    for (let n = 1; n <= textCodeElement.value.split(/\r\n|\r|\n/).length; n++) {
//        numberLineElement!.insertAdjacentHTML("beforeend", `<div>${n}</div>`)
//    }
//}
//function highlightCode(text: string): string {
//    text = text.replace(/\bhello\b/g, "<span class='hello'>hello</span>")
//    text = text.replace(/\bworld\b/g, "<span class='world'>world</span>")
//    text = text.replace(/\b\d+\b/g, (v) => { return `<span class='number'>${v}</span>` })
//    return text
//}
//function insertBr(text: string): string {
//    return text.replace(/\r\n|\r|\n/g, "<br/><span class='empty'> </span>")
//}
//runCodeButtonElement.addEventListener("click", () => {
//    code = textCodeElement.value
//    try {
//        esprima.parseScript(code)
//    } catch (e: any) {
//        console.log({ e })
//        console.log(e.lineNumber)
//    }
//});
//function updateVisualCode() {
//    let codeText = textCodeElement.value
//    codeText = highlightCode(codeText)
//    codeText = insertBr(codeText)
//    visualCodeElement.innerHTML = codeText
//}
//let characterToInsert: string | undefined = undefined
//textCodeElement?.addEventListener("keydown", (e) => {
//    if (e.key == "{") {
//        characterToInsert = "}"
//    }
//    if (e.key == "[") {
//        characterToInsert = "]"
//    }
//    if (e.key == "Tab") {
//        let tab = "  "
//        e.preventDefault();
//
//        let newTextCode = textCodeElement.value.slice(0, textCodeElement.selectionStart) +
//            tab + textCodeElement.value.slice(textCodeElement.selectionStart)
//        let prevPosition = textCodeElement.selectionEnd
//        textCodeElement.value = newTextCode
//        textCodeElement.selectionEnd = prevPosition + 2
//
//        console.log(textCodeElement.value)
//        updateNumberLine()
//        updateVisualCode()
//    }
//    if (characterToInsert == undefined) {
//        return
//    }
//})
//textCodeElement?.addEventListener("input", (_) => {
//    if (characterToInsert != undefined) {
//        let newTextCode = textCodeElement.value.slice(0, textCodeElement.selectionStart) +
//            characterToInsert + textCodeElement.value.slice(textCodeElement.selectionStart)
//        let prevPosition = textCodeElement.selectionEnd
//        textCodeElement.value = newTextCode
//        characterToInsert = undefined
//        textCodeElement.selectionEnd = prevPosition
//    }
//    updateNumberLine()
//    updateVisualCode()
//})
//textCodeElement?.addEventListener("scroll", (_) => {
//    numberLineElement!.scrollTop = textCodeElement.scrollTop
//    visualCodeElement!.scrollLeft = textCodeElement.scrollLeft
//    visualCodeElement!.scrollTop = textCodeElement.scrollTop
//})
//textCodeElement.value = ""
//updateNumberLine()
//updateVisualCode()
