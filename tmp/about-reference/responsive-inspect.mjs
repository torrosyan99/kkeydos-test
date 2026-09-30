import fs from 'node:fs';
import {load} from '../about-tools/node_modules/cheerio/dist/esm/index.js';
const css=fs.readFileSync('tmp/about-reference/chunks/0_rphxyah9otm.css','utf8');
console.log('Breakpoints',css.match(/--breakpoint[^;}]+/g));
console.log('Media', [...new Set(css.match(/@media[^\{]+/g))]);
console.log('Typography',css.match(/\.site-display-(?:l|xl|2xl|3xl)[^{]*\{[^}]+/g)?.slice(0,20));
for(const m of css.matchAll(/\.site-display-l\{/g)) console.log(css.slice(Math.max(0,m.index-120),m.index+170));
for(const key of ['mdS\\:mx-6','lgS\\:flex-row','lg\\:mx-','xl\\:mx-','clip-next-section']) { const i=css.indexOf(key); console.log(key,css.slice(i-100,i+250)); }
const $=load(fs.readFileSync('tmp/about-reference/source.html','utf8'));
const main=$('main');
main.find('img').removeAttr('srcset').removeAttr('sizes');
main.find('script').remove();
fs.writeFileSync('tmp/about-reference/responsive-structure.html',main.html().replace(/></g,'>\n<'));
console.log(fs.readFileSync('tmp/about-reference/animation-source.txt','utf8'));
