import fs from 'node:fs';
const setup=fs.readFileSync('tmp/about-reference/check.mjs','utf8').split('const results=[];')[0];
fs.writeFileSync('tmp/about-reference/responsive-check.mjs',setup+fs.readFileSync('tmp/about-reference/responsive-check-tail.mjs','utf8'));
