import fs from 'node:fs';
import {load} from '../about-tools/node_modules/cheerio/dist/esm/index.js';
const file='app/about/index.html';
const $=load(fs.readFileSync(file,'utf8'));
$('main [class]').each((i,e)=>$(e).attr('class',$(e).attr('class').replaceAll('max-md:','max-middle:')));
$('[data-about-history]').prev().find('h2').removeClass('about-title').addClass('about-history-title');
$('main > section').last().find('h2').removeClass('about-title').addClass('about-cta-text');
$('#our-story p.text-brand-gray, #our-people p.text-brand-gray, [data-about-giveback] p').each((i,e)=>{
  $(e).removeClass('text-xl max-middle:text-base').addClass('about-copy');
});
fs.writeFileSync(file,$.html());
