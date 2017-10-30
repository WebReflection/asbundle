const ascjs = require('ascjs');
const esprima = require('esprima');
const defaultOptions = {
  sourceType: 'module',
  jsx: true,
  range: true,
  tolerant: true
};

const fs = require('fs');
const path = require('path');

const bundle = (main, options) => {
  let base = path.dirname(main);
  main = path.resolve(base, main);
  base = path.dirname(main);
  const cache = [main];
  const modules = [];
  modules[0] = parse(
    Object.assign(
      {},
      defaultOptions,
      options
    ),
    base,
    main,
    cache,
    modules
  );
  return `
(function (cache, modules) {
  function require(i) { return cache[i] || get(i); }
  function get(i) {
    var exports = {}, module = {exports: exports};
    modules[i].call(exports, window, require, module, exports);
    return (cache[i] = module.exports);
  }
  var main = require(0);
  return main.__esModule ? main.default : main;
}([],[${modules.map((code, i) => `function (global, require, module, exports) {
// ${path.relative(base, cache[i])}
${code}
}
`.trim()).join(',')}]));
  `.trim();
};

const parse = (options, base, file, cache, modules) => {
  const out = [];
  const chunks = [];
  let code = fs.readFileSync(file).toString();
  if (/^(?:import|export)\s+/m.test(code)) code = ascjs(code);
  const addChunk = (module, name) => {
    const i = cache.indexOf(name);
    chunks.push({
      start: module.range[0],
      end: module.range[1],
      value: i < 0 ? (cache.push(name) - 1) : i
    });
    if (i < 0) {
      modules[cache.length - 1] = parse(options, path.dirname(name), name, cache, modules);
    }
  };
  esprima.parse(
    code,
    options,
    item => {
      if (item.type === 'CallExpression' && item.callee.name === 'require') {
        const module = item.arguments[0];
        if (/^[./]/.test(module.value)) {
          const name = require.resolve(path.resolve(base, module.value));
          if (/\.m?js$/.test(name)) addChunk(module, name);
          else {
            const i = cache.indexOf(name);
            if (i < 0) cache.push(name);
            addChunk(module, name);
            if (i < 0) {
              modules[cache.length - 1] = `module.exports = ${JSON.stringify(require(name))};`;
            }
          }
        } else {
          process.chdir(base);
          const name = require.resolve(name);
          if (name === module.value)
            throw `unable to find "${name}" via file://${file}\n`;
          addChunk(module, name);
        }
      }
    }
  );
  const length = chunks.length;
  let c = 0;
  for (let i = 0; i < length; i++) {
    out.push(
      code.slice(c, chunks[i].start),
      chunks[i].value
    );
    c = chunks[i].end;
  }
  out.push(length ? code.slice(c) : code);
  return out.join('');
};

module.exports = bundle;
