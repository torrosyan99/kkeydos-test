import fs from 'node:fs';
const setup=fs.readFileSync('tmp/about-reference/check.mjs','utf8').split('const results=[];')[0];
fs.writeFileSync('tmp/about-reference/intro-check.mjs',setup+fs.readFileSync('tmp/about-reference/intro-check-tail.mjs','utf8'));
