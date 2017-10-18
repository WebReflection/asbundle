const cherow = require('cherow');

const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');

const bundle = (main) => {
  let base = path.dirname(main);
  main = path.resolve(base, main);
  base = path.dirname(main);
  const cache = [main];
  const modules = [];
  modules[0] = parse(base, main, cache, modules);
  return `
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
})([],[${modules.map((code, i) => `function (global, require, module, exports) {
// ${path.relative(base, cache[i])}
${code}
}
`.trim()).join(',')}]);
  `.trim();
};

const parse = (base, file, cache, modules) => {
  const out = [];
  const chunks = [];
  const code = fs.readFileSync(file).toString();
  const addChunk = (module, name) => {
    const i = cache.indexOf(name);
    chunks.push({
      start: module.start,
      end: module.end,
      value: i < 0 ? (cache.push(name) - 1) : i
    });
    if (i < 0) {
      modules[cache.indexOf(name)] = parse(path.dirname(name), name, cache, modules);
    }
  };
  const findRequire = item => {
    if (item.type === 'CallExpression' && item.callee.name === 'require') {
      const module = item.arguments[0];
      if (/^[./]/.test(module.value)) {
        let name = path.resolve(base, module.value);
        addChunk(module, /\.js$/.test(name) ? name : (name + '.js'));
      } else {
        let name = execSync(
          `node -e 'console.log(require.resolve(${
            JSON.stringify(module.value)
          }))'`,
          {cwd: base}
        ).toString().trim();
        if (name === module.value) {
          throw `unable to find "${name}" via file://${file}\n`;
        }
        addChunk(module, name);
      }
    } else {
      for (let key in item) {
        if (typeof item[key] === 'object') {
          findRequire(item[key] || {});
        }
      }
    }
  };
  cherow.parseModule(code, bundle.options).body.forEach(findRequire);
  const length = chunks.length;
  for (let c = 0, i = 0; i < length; i++) {
    out.push(
      code.slice(c, chunks[i].start),
      chunks[i].value
    );
    c = chunks[i].end;
  }
  out.push(length ? code.slice(chunks[length - 1].end) : code);
  return out.join('');
};

bundle.options = {
  jsx: true,
  next: true,
  ranges: true,
  v8: true
};

module.exports = bundle;
