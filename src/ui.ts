let numberLineElement = document.getElementById("number-line")
let textCodeElement: HTMLTextAreaElement = document.getElementById("text-code") as HTMLTextAreaElement
let visualCodeElement: HTMLDivElement = document.getElementById("visual-code") as HTMLDivElement

function updateNumberLine() {
    numberLineElement!.innerHTML = ""
    for (let n = 1; n <= textCodeElement.value.split(/\r\n|\r|\n/).length; n++) {
        numberLineElement!.insertAdjacentHTML("beforeend", `<div>${n}</div>`)
    }
}
function highlightCode(text: string): string {
    text = text.replace(/\bhello\b/g, "<span class='hello'>hello</span>")
    text = text.replace(/\bworld\b/g, "<span class='world'>world</span>")
    text = text.replace(/\b\d+\b/g, (v) => { return `<span class='number'>${v}</span>` })
    return text
}
function insertBr(text: string): string {
    return text.replace(/\r\n|\r|\n/g, "<br/><span class='empty'> </span>")
}
function updateVisualCode() {
    let codeText = textCodeElement.value
    codeText = highlightCode(codeText)
    codeText = insertBr(codeText)
    visualCodeElement.innerHTML = codeText
    console.log(textCodeElement.selectionEnd)
}
textCodeElement?.addEventListener("input", (_) => {
    updateNumberLine()
    updateVisualCode()
})
textCodeElement?.addEventListener("scroll", (_) => {
    numberLineElement!.scrollTop = textCodeElement.scrollTop
    visualCodeElement!.scrollLeft = textCodeElement.scrollLeft
    visualCodeElement!.scrollTop = textCodeElement.scrollTop
})
textCodeElement.value = ""
updateNumberLine()
updateVisualCode()
