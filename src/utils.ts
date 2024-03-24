import { Utils } from "utils/Utils";
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
export class Island {
    id: number
    elements: GraphElement[]
    constructor() {
        this.id = newUid()
        this.elements = [];
    }

}
export class Graph {
    elements: GraphElement[]
    islands: Island[]
    islandConnections: IslandConnection[]
    private currentIsland: Island | undefined
    private isAlreadyVisited: Map<number, undefined>

    constructor() {
        this.elements = []
        this.islands = []
        this.isAlreadyVisited = new Map()
        this.currentIsland = undefined
        this.islandConnections = [];
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
        for (let s of elementA.siblingElements) {
            if (s.id == elementIdB) {
                console.log("alread")
                return
            }
        }
        for (let s of elementB.siblingElements) {
            if (s.id == elementIdA) {
                console.log("alread")
                return
            }
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
    updateIslandConnections() {
        this.isAlreadyVisited.clear()
        this.islandConnections = []

        for (let island of this.islands) {
            for (let e of island.elements) {
                this.recursiveGetIslandConnections(e, island)
            }
        }
    }
    private recursiveGetIslandConnections(element: GraphElement, islandA: Island): Island | undefined {
        if (this.isAlreadyVisited.has(element.id)) return
        this.isAlreadyVisited.set(element.id, undefined);

        for (let s of element.siblingElements) {
            if (this.isAlreadyVisited.has(s.id)) continue

            let islandB = this.getElementIsland(s.id)
            if (islandA.id != islandB!.id) {
                this.islandConnections.push(
                    new IslandConnection(islandA, islandB!, element, s))
            }
            this.recursiveGetIslandConnections(s, islandB!)
        }
    }
    getElementIsland(elementId: number): Island | undefined {
        for (let island of this.islands) {
            for (let e of island.elements) {
                if (e.id == elementId) {
                    return island
                }
            }
        }
        return undefined
    }
    updateIslands() {
        this.isAlreadyVisited.clear()
        this.islands = []

        for (let e of this.elements) {
            this.currentIsland = new Island()
            this.recursiveFindIslands(e)
            if (this.currentIsland.elements.length > 0) {
                this.islands.push(this.currentIsland)
            }
        }
    }
    private recursiveFindIslands(element: GraphElement) {
        if (this.isAlreadyVisited.has(element.id)) return
        this.isAlreadyVisited.set(element.id, undefined)

        if (element.stop) {
            let newIsland = new Island()
            newIsland.elements.push(element)
            this.islands.push(newIsland)
            return
        }
        this.currentIsland!.elements.push(element)
        for (let s of element.siblingElements) {
            this.recursiveFindIslands(s)
        }
    }
}
