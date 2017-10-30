# asbundle

[![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate) [![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC) [![Build Status](https://travis-ci.org/WebReflection/asbundle.svg?branch=master)](https://travis-ci.org/WebReflection/asbundle) [![Greenkeeper badge](https://badges.greenkeeper.io/WebReflection/asbundle.svg)](https://greenkeeper.io/)

A minimalistic CommonJS bundler

- - -

This module is a perfect [ascjs](https://github.com/WebReflection/ascjs) companion to create CommonJS bundles.

Passing a single ESM/CJS source file as path name, it will produce a lightweight, optimized, and minifier friendly bundle,
to consume right away without needing global `require` or runtime discovered CommonJS dependencies.

### Goals
  * be as simple as possible, but not simpler
  * make creation of small modules written in ESM a no brainer
  * enable `.js` files as ESM everywhere, following a simple folder convention
  * produce files compatible with most common bundlers and tools (Babel, Webpack, UglifyJS, etc)

**Example** of a basic module based on _ascjs_ and _asbundle_.

<img src="https://github.com/WebReflection/asbundle/raw/master/module-structure.png" width="307">

### Non-Goals
  * replace Babel, Webpack, Rollup, or any other tool. Let them do complicated things when needed
  * transpile anything else than ESM import/export declarations

## How to

You can use _asbundle_ as binary utility or as module.

```sh
npm install -g asbundle

# to see what you can do
asbundle --help

```

As executable, you can use _asbundle_ to output, or save, a bundle entry point.
```sh
asbundle source-file.js           # writes bundle contents to STDOUT
asbundle source-file.js bundle.js # outputs to bundle.js
```

As module, you can require it and use it to obtain a bundle string.
```js
const asbundle = require('asbundle');

asbundle(sourceFileName);
```

### Features

  * extremely lightweight, based on [babylon](https://github.com/babel/babylon) for performance and reliability
  * it uses _ascjs_ to automatically transform, when needed, ES2015+ modules into CommonJS code
  * understands both relative files and installed packages too (based on `require.resolve(...)`)
  * reproduces a modern and minimalistic CommonJS environments ideal for browsers
  * compatible with [Babel](http://babeljs.io) `__esModule` and `.default` convention

### Constrains

  * same constrains of [ascjs](https://github.com/WebReflection/ascjs#constrains)
  * Node core modules are not brought to the bundle, if a module cannot be resolved as file name it throws

### Example
This module can transform `main.js` entry file via `asbundle main.js out.js`:
```js
// main.js
import func, {a, b} from './module.js';
const val = 123;
export default function test() {
  console.log('asbundle');
};
export {func, val};

// module.js
export const a = 1, b = 2;
export default function () {
  console.log('module');
};
```
into the following bundle:
```js
// out.js => 266 bytes minified & gzipped
(function (cache, modules) {
  function require(i) { return cache[i] || get(i); }
  function get(i) {
    var exports = {}, module = {exports: exports};
    modules[i].call(exports, window, require, module, exports);
    return (cache[i] = module.exports);
  }
  var main = require(0);
  return main.__esModule ? main.default : main;
}([],[function (global, require, module, exports) {
// main.js
'use strict';
const func = (m => m.__esModule ? m.default : m)(require(1));
const {a, b} = require(1);
const val = 123;
function test() {
  console.log('asbundle');
}
Object.defineProperty(exports, '__esModule', {value: true}).default = test;
exports.func = func;
exports.val = val;
},function (global, require, module, exports) {
// module.js
'use strict';
const a = 1, b = 2;
exports.a = a;
exports.b = b;
Object.defineProperty(exports, '__esModule', {value: true}).default = function () {
  console.log('module');
};
}]));
```

The main module is returned and executed as default entry so it becomes easy to publish as global variable for Web purposes too.

Add a `const myModule = ` prefix to the bundled code and use it right away.
