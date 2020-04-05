#!/usr/bin/env node

const asbundle = require('./index.js');
const argv = process.argv.filter(arg => !/^-/.test(arg));

let source = argv[2];
if (!source) {
  const info = require('./package.json');
  console.log(`
\x1B[1masbundle\x1B[0m v${info.version}
${'-'.repeat(info.description.length)}
${info.description}
${'-'.repeat(info.description.length)}

asbundle sourceFile
asbundle sourceFile destFile

${'-'.repeat(info.description.length)}
${' '.repeat(info.description.length)
      .slice(0, -(3 + info.author.length))}by ${info.author}
`);
} else {
  const fs = require('fs');
  const path = require('path');
  let dest = argv.filter(arg => !/^-/.test(arg))[3];
  source = path.resolve(process.cwd(), source);
  if (dest) {
    dest = path.resolve(process.cwd(), dest)
  }
  fs.stat(source, (err, stat) => {
    if (err) throw err;
    if (!stat.isFile()) throw `unknown file ${source}`;
    const result = asbundle(source);
    if (dest) {
      fs.writeFileSync(dest, result);
    }
    else process.stdout.write(result);
  });
}
