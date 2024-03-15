import * as Mat from "./math"

export function replaceRange(
    str: string,
    start: number,
    end: number,
    substituteCallback: (v: string) => string
) {
    let substitute = substituteCallback(str.substring(start, end))
    return str.substring(0, start) + substitute + str.substring(end);
}
export const newUid = () => Mat.getRandomNumberInclusive(0, 4_294_967_294);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export class AssetFetchCache {
    static cachedAssets: Map<string, any> = new Map();
    static async fetch(assetName: string): Promise<any> {
        let asset = this.cachedAssets.get(assetName)
        if (asset == undefined) {
            let fetchedAsset = await (await fetch("assets/" + assetName)).blob()
            this.cachedAssets.set(assetName, fetchedAsset)
            return fetchedAsset
        }
        return asset
    }
}
export class GraphElement {
    id: number
    siblingElements: GraphElement[]
    constructor(newId: number) {
        this.id = newId
        this.siblingElements = []
    }
}
export class Graph {
    elements: GraphElement[]
    islands: number[][]

    private alreadyVisitedElements: number[]
    private currentIsland: number[]

    constructor() {
        this.elements = []
        this.islands = []
        this.alreadyVisitedElements = []
        this.currentIsland = []
    }
    removeElementSibling(elementId: number, siblingId: number) {
        for (let e of this.elements) {
            if (e.id == elementId) {
                for (let [sEI, sE] of e.siblingElements.entries()) {
                    if (sE.id == siblingId) {
                        e.siblingElements.splice(sEI, 1)
                    }
                }
            }
        }
    }
    addElementSibling(elementId: number, siblingId: number) {
        let siblingElement: GraphElement | undefined = undefined
        let targetElement: GraphElement | undefined = undefined

        for (let e of this.elements) {
            if (e.id == elementId) {
                targetElement = e
            }
            if (e.id == siblingId) {
                siblingElement = e
            }
        }
        if (siblingElement == undefined || targetElement == undefined) {
            console.log("???????????")
            return
        }
        targetElement.siblingElements.push(siblingElement)
    }
    createElement(elementId: number) {
        this.elements.push(new GraphElement(elementId))
    }
    removeElement(elementId: number) {
        for (let [eI, e] of this.elements.entries()) {
            for (let [sI, s] of e.siblingElements.entries()) {
                if (s.id == elementId) {
                    e.siblingElements.splice(sI, 1)
                    break;
                }
            }
            if (e.id == elementId) {
                this.elements.splice(eI, 1)
            }
        }
    }
    private recursiveSearch(element: GraphElement) {
        for (let aVE of this.alreadyVisitedElements) {
            if (aVE == element.id) {
                return
            }
        }
        this.alreadyVisitedElements.push(element.id)
        this.currentIsland.push(element.id)
        for (let s of element.siblingElements) {
            this.recursiveSearch(s)
        }
    }
    updateIslands() {
        this.alreadyVisitedElements = []
        this.islands = []

        for (let e of this.elements) {
            this.currentIsland = []
            this.recursiveSearch(e)
            if (this.currentIsland.length > 0) {
                this.islands.push(this.currentIsland)
            }
        }
    }
}
