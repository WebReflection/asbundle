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