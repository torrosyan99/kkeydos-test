import fs from 'node:fs';
import { load } from '../about-tools/node_modules/cheerio/dist/esm/index.js';
const file='app/about/index.html';
let html=fs.readFileSync(file,'utf8');
html=html.replace('src="./assets/images/logo.png"','src="../assets/images/logo.png"');
html=html.replace('content="Kkeydos | Custom Software Development & AI Solutions"','content="About Us | KKEYDOS"');
html=html.replaceAll('icons.svg#home','icons.svg#breadcrumbs-home').replaceAll('icons.svg#chevron-down','icons.svg#chevron-bottom');
html=html.replace(/<svg class="size-5 shrink-0" aria-hidden="true">\s*<use href="..\/assets\/images\/icons.svg#arrow-left"><\/use>/g,'<svg class="size-5 shrink-0 rotate-180" aria-hidden="true"><use href="../assets/images/icons.svg#arrow-right"></use>');
// Keep the reference's desktop text/card arrangement with the existing button styles.
const $=load(html);
const quote=$('#client-stories');
const heading=quote.children('h2');
const stack=quote.children('[data-about-quotes]');
const controls=quote.children('div').last();
heading.attr('class','max-w-130 font-medium');
stack.attr('class','relative mx-auto h-136 w-full max-w-128 max-md:h-144');
quote.append(`<div class="grid grid-cols-2 gap-20 max-xl:gap-10 max-lg:grid-cols-1 max-lg:gap-12">${$.html(heading)}<div class="min-w-0">${$.html(stack)}${$.html(controls)}</div></div>`);
heading.remove(); stack.remove(); controls.remove();
const finalCta=$('main > section').last().children('div');
finalCta.attr('class','page-container flex max-w-7xl flex-row-reverse items-center gap-20 max-lg:gap-10 max-md:flex-col max-md:items-start');
finalCta.children('img').attr('class','-mt-32 w-120 shrink-0 rounded-xl object-contain max-xl:w-96 max-md:-mt-28 max-md:w-full');
finalCta.find('h2').attr('class','mb-8 text-4xl font-medium max-md:text-3xl');
html=$.html();
fs.writeFileSync(file,html);
for (const [file,href] of [['app/index.html','about/'],['app/industries/industry.html','../about/'],['app/technologies/technology.html','../about/'],['app/about/index.html','./']]) {
  let source=fs.readFileSync(file,'utf8');
  source=source.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g,anchor=>{
    const text=load(anchor).text().trim();
    if(['About','About KKEYDOS','About Us','Explore more about us'].includes(text)) return anchor.replace(/href="[^"]*"/,`href="${href}"`);
    return anchor;
  });
  fs.writeFileSync(file,source);
}
