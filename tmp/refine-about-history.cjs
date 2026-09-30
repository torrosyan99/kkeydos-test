const fs = require('node:fs');
const file = 'app/about/index.html';
let html = fs.readFileSync(file, 'utf8');
const start = html.lastIndexOf('<section', html.indexOf('How our vision became reality'));
const end = html.indexOf('</section>', start) + '</section>'.length;
let section = html.slice(start, end);
section = section.replace('bg-primary max-middle:pt-16 max-middle:pb-24 pt-24 pb-40 text-white', 'bg-primary pt-12 pb-48 text-white max-md:pb-36');
const headingStart = section.indexOf('            <div class="max-middle:mb-10');
const scrollerStart = section.indexOf('            <div\n              class="about-history');
if (headingStart < 0 || scrollerStart < 0) throw new Error('History heading not found');
section = section.slice(0, headingStart) + `            <h2 class="mb-16 text-6xl font-medium max-notebook:text-5xl max-middle:text-4xl max-lg:mb-4">
              How our vision became reality
            </h2>
` + section.slice(scrollerStart);
section = section.replace('about-history max-notebook:gap-6 max-notebook:pb-16 max-middle:gap-4 max-middle:pb-10 flex snap-x snap-mandatory gap-8 overflow-x-auto p-4 pb-20', 'about-history flex w-full gap-8 overflow-x-auto p-4 pb-20 max-lg:gap-6 max-lg:pb-16 max-md:gap-4 max-md:pb-10');
section = section.replaceAll('group max-middle:w-64 w-1/4 shrink-0 snap-start max-xl:w-80', 'group basis-64 shrink-0 grow md:basis-80 xl:basis-1/4');
const marker = /<div class="from-brand-orange mb-8 h-px bg-linear-to-r to-transparent">\s*<span\s+class="bg-brand-orange ring-brand-orange\/20 relative -top-3 block size-6 rounded-full ring-8 transition-shadow group-hover:ring-12"\s+aria-hidden="true"\s*><\/span>\s*<\/div>/g;
let count = 0;
section = section.replace(marker, () => {
  count++;
  return `<div class="relative my-4 flex h-px items-center" aria-hidden="true">
                  <div class="from-brand-orange to-primary absolute inset-x-0 h-px bg-linear-to-r"></div>
                  <span class="bg-brand-orange ring-brand-orange/20 absolute top-1/2 left-0 size-7 -translate-y-1/2 rounded-full ring-8 group-hover:ring-0"></span>
                  <span class="bg-brand-orange absolute top-1/2 left-0 size-7 -translate-y-1/2 rounded-full motion-safe:group-hover:animate-ping"></span>
                </div>`;
});
if (count !== 15) throw new Error(`Expected 15 timeline markers, found ${count}`);
section = section.replaceAll('group-hover:text-brand-orange mb-4 text-3xl transition-colors', 'group-hover:text-brand-orange mt-8 mb-4 text-3xl transition-colors');
html = html.slice(0, start) + section + html.slice(end);
fs.writeFileSync(file, html);

const scriptFile = 'app/assets/scripts/pages/about.js';
let script = fs.readFileSync(scriptFile, 'utf8');
const scriptStart = script.indexOf("  const history = page.querySelector('[data-about-history]');");
const scriptEnd = script.indexOf('  const setMotion = () => {', scriptStart);
if (scriptStart < 0 || scriptEnd < 0) throw new Error('History controls not found');
script = script.slice(0, scriptStart) + script.slice(scriptEnd);
script = script.replace('  new ResizeObserver(() => {\n    measure();\n    updateHistory();\n  }).observe(page);', '  new ResizeObserver(measure).observe(page);');
script = script.replace('  updateHistory();\n', '');
fs.writeFileSync(scriptFile, script);
