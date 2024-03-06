export function replaceRange(
    str: string,
    start: number,
    end: number,
    substituteCallback: (v: string) => string
) {
    let substitute = substituteCallback(str.substring(start, end))
    return str.substring(0, start) + substitute + str.substring(end);
}

export const newUid = () => getRandomNumberInclusive(0, 4_294_967_294);
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
export function getRandomNumberInclusive(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    return Math.floor(Math.random() * (Math.floor(max) - minCeiled + 1) + minCeiled);
}
