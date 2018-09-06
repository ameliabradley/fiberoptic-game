/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/client/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client/index.ts":
/*!*****************************!*\
  !*** ./src/client/index.ts ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _shared_keyboard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/keyboard */ \"./src/shared/keyboard.ts\");\n\n\"use strict\";\n// Set up the canvas with a 2D rendering context\nvar cnv = document.getElementsByTagName(\"canvas\")[0];\nvar ctx = cnv.getContext(\"2d\");\nvar width = 50;\nvar height = 50;\ncnv.width = width;\ncnv.height = height;\ncnv.style = \"\\nimage-rendering: optimizeSpeed;\\nimage-rendering: -moz-crisp-edges;\\nimage-rendering: -webkit-optimize-contrast;\\nimage-rendering: -o-crisp-edges;\\nimage-rendering: optimize-contrast;\\nimage-rendering: crisp-edges;\\nimage-rendering: pixelated;\\n-ms-interpolation-mode: nearest-neighbor;\\n\";\nctx.imageSmoothingEnabled = false;\nvar size = height * width;\nvar canvasByteSize = (size + size) << 2; // 4b per pixel (X << N is the same as X * 2 ^ N)\n// TODO: Update this on release to the number of bytes we expect the internal memory to take up\nvar memByteSize = 500;\nvar totalPages = (memByteSize + ((canvasByteSize + 0xffff) & ~0xffff)) >>> 16;\nconsole.log(\"Memory Allocated: \" + totalPages * 6.4 + \" KiB\");\nvar memory = new WebAssembly.Memory({\n    initial: totalPages\n});\nvar char = 0;\nfunction charFromKey(key) {\n    switch (key) {\n        case \"w\":\n        case \"ArrowUp\":\n            return _shared_keyboard__WEBPACK_IMPORTED_MODULE_0__[\"FLAG_UP\"];\n        case \"s\":\n        case \"ArrowDown\":\n            return _shared_keyboard__WEBPACK_IMPORTED_MODULE_0__[\"FLAG_DOWN\"];\n        case \"a\":\n        case \"ArrowLeft\":\n            return _shared_keyboard__WEBPACK_IMPORTED_MODULE_0__[\"FLAG_LEFT\"];\n        case \"d\":\n        case \"ArrowRight\":\n            return _shared_keyboard__WEBPACK_IMPORTED_MODULE_0__[\"FLAG_RIGHT\"];\n        case \" \":\n        case \"Space\":\n            return _shared_keyboard__WEBPACK_IMPORTED_MODULE_0__[\"FLAG_SPACE\"];\n    }\n    return 0;\n}\nvar exports;\nwindow.addEventListener(\"keydown\", function (e) {\n    char = char | charFromKey(e.key);\n    exports.setKeys(char);\n});\nwindow.addEventListener(\"keyup\", function (e) {\n    char = char & ~charFromKey(e.key);\n    exports.setKeys(char);\n});\nfetch(\"module.untouched.wasm\")\n    .then(function (response) { return response.arrayBuffer(); })\n    .then(function (bytes) {\n    return WebAssembly.instantiate(bytes, {\n        env: { memory: memory },\n        JSMath: Math,\n        console: {\n            logi: function (value) { return console.log(\"logi: \", value); },\n            logf: function (value) { return console.log(\"logf: \", value); }\n        },\n        tools: {\n            time: function () { return Math.floor(performance.now()); }\n        }\n    });\n})\n    .then(function (results) {\n    exports = results.instance.exports;\n    exports.setupWorld(8, 8, height, width);\n    var offsetCanvas = exports.getOffsetCanvas();\n    var mem = new Uint32Array(memory.buffer, offsetCanvas);\n    // Keep rendering the output at [size, 2*size]\n    var imageData = ctx.createImageData(width, height);\n    var argb = new Uint32Array(imageData.data.buffer);\n    (function render() {\n        requestAnimationFrame(render);\n        exports.step(width, height, Math.floor(performance.now()));\n        argb.set(mem.subarray(0, size)); // copy output to image buffer\n        ctx.putImageData(imageData, 0, 0); // apply image buffer\n    })();\n});\n\n\n//# sourceURL=webpack:///./src/client/index.ts?");

/***/ }),

/***/ "./src/shared/keyboard.ts":
/*!********************************!*\
  !*** ./src/shared/keyboard.ts ***!
  \********************************/
/*! exports provided: FLAG_UP, FLAG_DOWN, FLAG_LEFT, FLAG_RIGHT, FLAG_SPACE */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FLAG_UP\", function() { return FLAG_UP; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FLAG_DOWN\", function() { return FLAG_DOWN; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FLAG_LEFT\", function() { return FLAG_LEFT; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FLAG_RIGHT\", function() { return FLAG_RIGHT; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"FLAG_SPACE\", function() { return FLAG_SPACE; });\nvar FLAG_UP = 1 << 1;\nvar FLAG_DOWN = 1 << 2;\nvar FLAG_LEFT = 1 << 3;\nvar FLAG_RIGHT = 1 << 4;\nvar FLAG_SPACE = 1 << 5;\n\n\n//# sourceURL=webpack:///./src/shared/keyboard.ts?");

/***/ })

/******/ });