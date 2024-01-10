import "./ui/web_components/components"
import * as MainComponent from "./ui/web_components/main-component/main"
import * as Ser from "./serialization"


let worker = new Worker(
    new URL('worker', import.meta.url),
    { type: "module" });

let mainComponentElement = document.getElementById("main-component") as MainComponent.CustomElement
mainComponentElement.addWorker(worker)

// disable right click
document.addEventListener('contextmenu', event => {
    event.preventDefault();
});
