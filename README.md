# asbundle

[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/WebReflection/donate)

A simple CommonJS bundler

- - -

This module is a perfect [ascjs](https://github.com/WebReflection/ascjs) companion to create CommonJS bundles.

Passing a single source file as path name, it will produce a lightweight, optimized, and minifier friendly bundle,
to consume right away without needing global `require` or runtime discovered CommonJS dependencies.

## How to

You can use _asbundle_ as binary utility or as module.

```sh
npm install -g asbundle

# to see what you can do
asbundle --help

```

As executable, you can use _asbundle_ to output, or save, a bundle entry point.
```sh
asbundle sourceFileName
asbundle sourceFileName bundleFileName
```

As module, you can require it and use it to obtain a bundle string.
```js
const asbundle = require('asbundle');

asbundle(sourceFileName);
```

### Features

  * extremely lightweight, based on [cherow](https://github.com/cherow/cherow) for performance and reliability, it transforms only imports/exports ignoring everything else
  * produces modern JavaScript, you are in charge of extra transformations if needed
  * indentation, spaces, semi or no-semi are preserved: beautiful source code remains beautiful
  * uses same [Babel](http://babeljs.io) convention, resolving `export default ...` intent as `exports.default`
  * you can finally write `.js` code and transform it for Node only before publishing on _npm_
  * you could write `.mjs` modules and transform them into CommonJS for [Browserify](http://browserify.org) or other bundlers as target

### Constrains

  * live bindings for exported values are not preserved. You need to delegate in scope eventual changes
  * dynamic `import(...)` is untouched. If you write that, let [Webpack](https://webpack.js.org) handle it for you later on
  * there is no magic whatsoever in module names resolution, what you write in ESM is what you get as CJS

### Example
This module can transform the following ES2015+ code
```js
import func, {a, b} from './module.js';
import * as tmp from 'other';

const val = 123;

export default function test() {
  console.log('asbundle');
};

export {func, val};
```
into the following one:
```js
'use strict';
const func = (m => m.__esModule ? m.default : m)(require('./module.js'));
const {a, b} = require('./module.js');
const tmp = require('other');

const val = 123;

function test() {
  console.log('asbundle');
}
Object.defineProperty(exports, '__esModule', {value: true}).default = test;

exports.func = func;
exports.val = val;
```