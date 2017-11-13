const ascjs = require('ascjs');
const parser = require('babylon');
const defaultOptions = {
  sourceType: 'module',
  plugins: [
    'estree',
    'jsx',
    'flow',
    'typescript',
    'doExpressions',
    'objectRestSpread',
    'decorators',
    'decorators2',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'exportExtensions',
    'asyncGenerators',
    'functionBind',
    'functionSent',
    'dynamicImport',
    'numericSeparator',
    'optionalChaining',
    'importMeta',
    'bigInt',
    'optionalCatchBinding',
    'throwExpressions',
    'pipelineOperator',
    'nullishCoalescingOperator'
  ]
};

const fs = require('fs');
const path = require('path');
const CGJS = process.argv.some(arg => arg === '--cgjs');
const IMPORT = 'require.I';
const EXPORT = 'require.E(exports)';
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
  let output = `
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
  if (CGJS) {
    output = output.replace(
      'cache[i] || get(i)',
      'typeof i === "string" ? window.require(i) : (cache[i] || get(i))'
    );
  }
  if (output.includes('require.E(exports)')) {
    output = output.replace(
      'var main =',
      'require.E = exports => Object.defineProperty(exports, \'__esModule\', {value: true});\n  var main ='
    );
  }
  if (output.includes(IMPORT)) {
    output = output.replace(
      'var main =',
      IMPORT + ' = m => m.__esModule ? m.default : m;\n  var main ='
    ).replace(
      'var main = require(0);\n  return main.__esModule ? main.default : main;',
      'return require.I(require(0));'
    );
  }
  return output;
};

const parse = (options, base, file, cache, modules) => {
  const out = [];
  const chunks = [];
  let code = fs.readFileSync(file).toString();
  if (/^(?:import|export)\s+/m.test(code)) code = ascjs(code, {IMPORT, EXPORT});
  const addChunk = (module, name) => {
    const i = cache.indexOf(name);
    chunks.push({
      start: module.start,
      end: module.end,
      value: i < 0 ? (cache.push(name) - 1) : i
    });
    if (i < 0) {
      modules[cache.length - 1] = parse(options, path.dirname(name), name, cache, modules);
    }
  };
  const findRequire = item => {
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
      } else if (!/^[A-Z]/.test(module.value)) {
        process.chdir(base);
        const name = require.resolve(module.value);
        if (name !== module.value) addChunk(module, name);
        else if (!CGJS) throw `unable to find "${name}" via file://${file}\n`;
      }
    } else {
      for (let key in item) {
        if (typeof item[key] === 'object') {
          findRequire(item[key] || {});
        }
      }
    }
  };
  const parsed = parser.parse(code, options);
  parsed.program.body.forEach(findRequire);
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
