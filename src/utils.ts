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

class Island {
    id: number
    elements: GraphElement[]
    siblingIslands: Island[]
    constructor(newId: number) {
        this.id = newId
        this.elements = []
        this.siblingIslands = []
    }

}
class GraphElement {
    id: number
    siblingElements: GraphElement[]
    stop: boolean
    constructor(newId: number) {
        this.id = newId
        this.siblingElements = []
        this.stop = false
    }
}
class IslandConnection {
    islandA: Island
    islandB: Island
    elementA: GraphElement
    elementB: GraphElement
    constructor(
        newIslandA: Island,
        newIslandB: Island,
        newElementA: GraphElement,
        newElementB: GraphElement
    ) {
        this.islandA = newIslandA
        this.islandB = newIslandB
        this.elementA = newElementA
        this.elementB = newElementB
    }
}
export class Graph {
    elements: GraphElement[]
    islands: GraphElement[][]
    private alreadyVisitedElements: GraphElement[]
    private currentIsland: GraphElement[]

    constructor() {
        this.elements = []
        this.islands = []
        this.alreadyVisitedElements = []
        this.currentIsland = []
    }
    removeSiblings(elementIdA: number, elementIdB: number) {
        for (let e of this.elements) {
            if (e.id == elementIdA) {
                for (let [i, sE] of e.siblingElements.entries()) {
                    if (sE.id == elementIdB) {
                        e.siblingElements.splice(i, 1)
                        break;
                    }
                }
            }
            if (e.id == elementIdB) {
                for (let [i, s] of e.siblingElements.entries()) {
                    if (s.id == elementIdA) {
                        e.siblingElements.splice(i, 1)
                        break;
                    }
                }
            }
        }
    }
    addSiblings(elementIdA: number, elementIdB: number) {
        let elementA: GraphElement | undefined
        let elementB: GraphElement | undefined

        for (let e of this.elements) {
            if (e.id == elementIdA) {
                elementA = e
            }
            if (e.id == elementIdB) {
                elementB = e
            }
        }
        if (elementA == undefined || elementB == undefined) {
            console.log("element does not exist")
            return
        }
        elementA.siblingElements.push(elementB)
        elementB.siblingElements.push(elementA)
    }
    createElement(elementId: number) {
        this.elements.push(new GraphElement(elementId))
    }
    setStopElement(isStopElement: boolean, elementId: number) {
        for (let e of this.elements) {
            if (e.id == elementId) {
                e.stop = isStopElement;
            }
        }
    }
    removeElement(elementId: number) {
        for (let [i0, e] of this.elements.entries()) {
            if (e.id != elementId) continue

            // siblings of target element
            for (let s0 of e.siblingElements) {

                // siblings of sibling
                for (let [i1, s1] of s0.siblingElements.entries()) {

                    // remove target element from siblings
                    if (s1.id == elementId) {
                        s0.siblingElements.splice(i1, 1)
                        break;
                    }
                }
            }

            // remove element from list
            this.elements.splice(i0, 1)
            break;
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
    private recursiveSearch(element: GraphElement) {
        for (let e of this.alreadyVisitedElements) {
            if (e.id == element.id) {
                return
            }
        }
        this.alreadyVisitedElements.push(element)
        if (element.stop) {
            this.islands.push([element])
            return
        }
        this.currentIsland.push(element)
        for (let s of element.siblingElements) {
            this.recursiveSearch(s)
        }
    }
}
