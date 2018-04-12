import func, {a, b} from './module.js';
const val = 123;
export default function test() {
  console.log('asbundle');
};
export {func, val};
require('m1');
require('m2');