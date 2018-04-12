(function (cache, modules) {
  function require(i) { return cache[i] || get(i); }
  function get(i) {
    var exports = {}, module = {exports: exports};
    modules[i].call(exports, window, require, module, exports);
    return (cache[i] = module.exports);
  }
  require.E = function (exports) { return Object.defineProperty(exports, '__esModule', {value: true}); };
  require.I = function (m) { return m.__esModule ? m.default : m; };
  return require.I(require(0));
}([],[function (global, require, module, exports) {
// main.js
'use strict';
const func = require.I(require(1));
const {a, b} = require(1);
const val = 123;
function test() {
  console.log('asbundle');
}
require.E(exports).default = test;
exports.func = func;
exports.val = val;
(null);
(null);
},function (global, require, module, exports) {
// module.js
'use strict';
const a = 1, b = 2;
exports.a = a;
exports.b = b;
require.E(exports).default = function () {
  console.log('module');
};
}]));