/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/input.ts":
/*!**********************!*\
  !*** ./src/input.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   KeyboardInput: () => (/* binding */ KeyboardInput)\n/* harmony export */ });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./src/utils.ts\");\n\nclass KeyboardInput {\n    constructor() {\n        this.up = false;\n        this.down = false;\n        this.left = false;\n        this.right = false;\n        let outer = this;\n        document.addEventListener(\"keyup\", (event) => {\n            outer.onKeyUp(event);\n        });\n        document.addEventListener(\"keydown\", (event) => {\n            outer.onKeyDown(event);\n        });\n        this.movementDirection = new _utils__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0);\n    }\n    onKeyDown(event) {\n        if (event.key == \"w\" || event.key == \"ArrowUp\")\n            this.up = true;\n        if (event.key == \"s\" || event.key == \"ArrowDown\")\n            this.down = true;\n        if (event.key == \"a\" || event.key == \"ArrowLeft\")\n            this.left = true;\n        if (event.key == \"d\" || event.key == \"ArrowRight\")\n            this.right = true;\n        this.setPlayerInput();\n    }\n    onKeyUp(event) {\n        if (event.key == \"w\" || event.key == \"ArrowUp\")\n            this.up = false;\n        if (event.key == \"s\" || event.key == \"ArrowDown\")\n            this.down = false;\n        if (event.key == \"a\" || event.key == \"ArrowLeft\")\n            this.left = false;\n        if (event.key == \"d\" || event.key == \"ArrowRight\")\n            this.right = false;\n        this.setPlayerInput();\n    }\n    setPlayerInput() {\n        this.movementDirection.x = 0;\n        this.movementDirection.y = 0;\n        if (this.down)\n            this.movementDirection.y--;\n        if (this.up)\n            this.movementDirection.y++;\n        if (this.left)\n            this.movementDirection.x--;\n        if (this.right)\n            this.movementDirection.x++;\n    }\n}\n\n\n//# sourceURL=webpack://strworld/./src/input.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _serialization__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./serialization */ \"./src/serialization.ts\");\n/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./input */ \"./src/input.ts\");\n\n\nlet keyboardInput = new _input__WEBPACK_IMPORTED_MODULE_1__.KeyboardInput();\nlet worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(\"src_worker_ts\"), __webpack_require__.b), { type: undefined });\nworker.postMessage(new _serialization__WEBPACK_IMPORTED_MODULE_0__.Message(_serialization__WEBPACK_IMPORTED_MODULE_0__.Messages.Start));\nworker.onmessage = onWorkerMessage;\nsetInterval(sendInputToWorker, 40);\nfunction sendInputToWorker() {\n    worker.postMessage(new _serialization__WEBPACK_IMPORTED_MODULE_0__.Message(_serialization__WEBPACK_IMPORTED_MODULE_0__.Messages.Input, new _serialization__WEBPACK_IMPORTED_MODULE_0__.Input(keyboardInput.movementDirection)));\n}\nfunction onWorkerMessage(data) {\n}\n//    let msg = (data.data as Ser.Message)\n//    let newData = msg.data as Ser.GraphicChanges\n//\n//    switch (msg.message) {\n//        case Ser.Messages.GraphicChanges:\n//            for (let cAI of newData.changedGraphicProperties) {\n//                let cCE = cAI as Comps.GraphicProperties\n//                for (let dO of documentObjects) {\n//                    if (cCE.componentUid != dO.componentUid) continue\n//\n//                    if (cCE.isColorChanged)\n//                        dO.setColor(cCE.color)\n//\n//                    if (cCE.isDisplayElementChanged)\n//                        dO.setDisplayElement(cCE.displayElement)\n//\n//                    if (cCE.isTranslateXChanged)\n//                        dO.setTranslateX(cCE.translateX)\n//\n//                    if (cCE.isTranslateYChanged)\n//                        dO.setTranslateY(cCE.translateY)\n//\n//                    if (cCE.isZIndexChanged)\n//                        dO.setZIndex(cCE.zIndex)\n//\n//                    if (cCE.addedClasses.size != 0)\n//                        dO.addClasses(Array.from(cCE.addedClasses.values()))\n//\n//                    if (cCE.removedClasses.size != 0)\n//                        dO.removeClasses(Array.from(cCE.removedClasses.values()))\n//\n//                    break;\n//                }\n//            }\n//\n//            for (let cAI of newData.addedGraphicProperties) {\n//                let nCE = cAI as Comps.GraphicProperties\n//                let documentObject = new DocumentObject(nCE.componentUid)\n//                documentObject.addClasses(Array.from(nCE.classes.values()))\n//                documentObject.setColor(nCE.color)\n//                documentObject.setDisplayElement(nCE.displayElement)\n//                documentObject.setTranslateX(nCE.translateX)\n//                documentObject.setTranslateY(nCE.translateY)\n//                documentObject.setZIndex(nCE.zIndex)\n//\n//                documentObjects.push(documentObject)\n//            }\n//            for (let cAI of newData.removedComputedElements) {\n//                let rCE = cAI.component as Comps.GraphicProperties\n//\n//                for (let dOI = documentObjects.length - 1; dOI >= 0; dOI--) {\n//                    if (rCE.componentUid == documentObjects[dOI].componentUid) {\n//                        documentObjects[dOI].dispose()\n//                        documentObjects.splice(dOI, 1)\n//                    }\n//                }\n//            }\n//            break;\n//\n//\n//    }\n//}\n\n\n//# sourceURL=webpack://strworld/./src/main.ts?");

/***/ }),

/***/ "./src/serialization.ts":
/*!******************************!*\
  !*** ./src/serialization.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GraphicChanges: () => (/* binding */ GraphicChanges),\n/* harmony export */   Input: () => (/* binding */ Input),\n/* harmony export */   Message: () => (/* binding */ Message),\n/* harmony export */   Messages: () => (/* binding */ Messages),\n/* harmony export */   Options: () => (/* binding */ Options)\n/* harmony export */ });\nclass Options {\n    constructor(newIsShadowsEnabled, newIsSetNight, newIsEnablePhysics, newIsEnableFreeCamera) {\n        this.isShadowsEnabled = newIsShadowsEnabled;\n        this.isSetNight = newIsSetNight;\n        this.isEnablePhysics = newIsEnablePhysics;\n        this.isEnableFreeCamera = newIsEnableFreeCamera;\n    }\n}\nclass Input {\n    constructor(newMovementDirection) {\n        this.movementDirection = newMovementDirection;\n    }\n}\nclass GraphicChanges {\n    constructor() {\n        this.changedGraphicProperties = [];\n        this.addedGraphicProperties = [];\n        this.removedGraphicProperties = [];\n    }\n}\nvar Messages;\n(function (Messages) {\n    Messages[Messages[\"Start\"] = 0] = \"Start\";\n    Messages[Messages[\"Input\"] = 1] = \"Input\";\n    Messages[Messages[\"Options\"] = 2] = \"Options\";\n    Messages[Messages[\"GraphicChanges\"] = 3] = \"GraphicChanges\";\n})(Messages || (Messages = {}));\nclass Message {\n    constructor(newMessage, newData = null) {\n        this.message = newMessage;\n        this.data = newData;\n    }\n}\n\n\n//# sourceURL=webpack://strworld/./src/serialization.ts?");

/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AssetFetchCache: () => (/* binding */ AssetFetchCache),\n/* harmony export */   Vector2: () => (/* binding */ Vector2),\n/* harmony export */   Vector3: () => (/* binding */ Vector3),\n/* harmony export */   newUid: () => (/* binding */ newUid),\n/* harmony export */   randomNumber: () => (/* binding */ randomNumber),\n/* harmony export */   sleep: () => (/* binding */ sleep)\n/* harmony export */ });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nconst randomNumber = (max) => Math.floor(Math.random() * max) + 1;\nconst newUid = () => randomNumber(100000000);\nconst sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nclass AssetFetchCache {\n    static fetch(assetName) {\n        return __awaiter(this, void 0, void 0, function* () {\n            let asset = this.cachedAssets.get(assetName);\n            if (asset == undefined) {\n                let fetchedAsset = yield (yield fetch(\"assets/\" + assetName)).blob();\n                this.cachedAssets.set(assetName, fetchedAsset);\n                return fetchedAsset;\n            }\n            return asset;\n        });\n    }\n}\nAssetFetchCache.cachedAssets = new Map();\nclass Vector2 {\n    constructor(newX, newY) {\n        this.x = newX;\n        this.y = newY;\n    }\n}\nclass Vector3 {\n    constructor(newX, newY, newZ) {\n        this.x = newX;\n        this.y = newY;\n        this.z = newZ;\n    }\n}\n\n\n//# sourceURL=webpack://strworld/./src/utils.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;