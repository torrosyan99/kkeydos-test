import fs from 'node:fs';
import { load } from '../about-tools/node_modules/cheerio/dist/esm/index.js';
for (const [file,href] of [['app/index.html','about/'],['app/industries/industry.html','../about/'],['app/technologies/technology.html','../about/']]) {
  let source=fs.readFileSync(file,'utf8');
  source=source.replace(/<a\b[^>]*>[\s\S]*?<\/a\s*>/g,anchor=>{
    const text=load(anchor).text().trim();
    if(['About','About KKEYDOS'].includes(text)) return anchor.replace(/href="[^"]*"/,`href="${href}"`);
    return anchor;
  });
  fs.writeFileSync(file,source);
}
const file='app/about/index.html';
const $=load(fs.readFileSync(file,'utf8'));
// Check every local asset and symbol, including the shared header and footer.
const missing=[];
const sprite=fs.readFileSync('app/assets/images/icons.svg','utf8');
$('[src], use[href], link[href]').each((i,e)=>{
  const value=$(e).attr('src') || $(e).attr('href');
  if(!value?.startsWith('../assets/')) return;
  const [asset,symbol]=value.split('#');
  if(!fs.existsSync('app/'+asset.slice(3))) missing.push(asset);
  if(symbol&&!new RegExp(`id=["']${symbol}["']`).test(sprite)) missing.push(symbol);
});
console.log('Missing local assets / symbols:',[...new Set(missing)]);
console.log('New page:', $('main section').length,'sections;', $('main img').length,'images');
const used=new Set($('main img').map((i,e)=>$(e).attr('src').split('/').pop()).get());
const directory='app/assets/images/pages/about';
for(const name of fs.readdirSync(directory)) {
  if(!used.has(name)) fs.unlinkSync(`${directory}/${name}`);
}
console.log('Local images:',used.size);
