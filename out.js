((cache, modules) => {
  const require = i => cache[i] || get(i);
  const get = i => {
    const exports = {};
    const module = {exports};
    modules[i].call(exports, window, require, module, exports);
    return (cache[i] = module.exports);
  };
  const main = require(0);
  return main.__esModule ? main.default : main;
})([],[function (global, require, module, exports) {
// test.js
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
}]);