import fs from 'node:fs';
import {load} from '../about-tools/node_modules/cheerio/dist/esm/index.js';
const file='app/about/index.html';
const $=load(fs.readFileSync(file,'utf8'));
$('main').addClass('overflow-clip');
$('[class=""]').removeAttr('class');
$('[data-orbit-member]').each((i,e)=>$(e).addClass(`max-middle:order-${[4,3,1,2,5][i]}`));
$('[data-quote-card]').each((i,e)=>$(e).attr('class',$(e).attr('class').replace('max-notebook:h-113','max-notebook:h-auto').replace('max-middle:h-128','max-middle:min-h-128 max-middle:w-66.5')));
$('#our-clients > div').addClass('pb-180 max-notebook:pb-0');
const stage=$('#client-stories > div');
const layout=stage.attr('class');
stage.attr('class','relative -mt-180 h-360 max-notebook:mt-0 max-notebook:h-auto').attr('data-quote-stage','');
stage.wrapInner(`<div class="sticky top-1/2 ${layout} max-notebook:static"></div>`);
stage.find('h2').addClass('h-180 -translate-y-6 max-notebook:h-auto max-notebook:translate-y-0');
const cardGrid=$('#our-people > div > div').last();
cardGrid.attr('class','relative isolate flex w-1/2 flex-wrap items-end justify-end gap-4 max-xl:mx-auto max-xl:w-full max-xl:max-w-180 max-sm:justify-center');
const items=cardGrid.children('img,blockquote');
const classes=[
  'order-1 mr-6 h-36 w-35 rounded-2xl object-cover max-notebook:mr-0 max-notebook:h-33.5 max-sm:h-37.5 max-sm:w-31',
  'bg-brand-teal order-2 flex-1 rounded-2xl p-6 text-lg text-white max-notebook:px-8 max-sm:order-1 max-sm:p-4 max-sm:text-sm',
  'order-2 h-44 w-44 rounded-2xl object-cover max-xl:order-3 max-sm:h-34 max-sm:w-40',
  'order-3 h-34 w-28 self-center rounded-2xl object-cover max-xl:order-2 max-sm:order-3',
  'bg-primary order-3 mr-6 flex-1 rounded-2xl p-6 text-lg text-white max-xl:order-3 max-xl:mr-0 max-sm:order-2 max-sm:p-4 max-sm:text-base',
  'bg-brand-teal order-4 flex-1 self-start rounded-2xl p-6 text-lg text-white max-xl:order-4 max-sm:p-4 max-sm:text-base',
  'order-4 h-53.5 w-45 self-start rounded-2xl object-cover max-notebook:h-44 max-notebook:w-44 max-sm:order-5 max-sm:h-40 max-sm:w-28',
  'bg-brand-light order-4 flex-1 self-start rounded-2xl p-6 text-lg max-xl:order-5 max-sm:p-4 max-sm:text-base',
];
items.each((i,e)=>$(e).attr('class',classes[i]));
cardGrid.append('<div class="order-1 basis-full max-xl:order-2 max-sm:order-1" aria-hidden="true"></div><div class="order-2 basis-full max-xl:order-3 max-sm:order-2" aria-hidden="true"></div><div class="order-3 basis-full max-xl:order-4 max-sm:order-3" aria-hidden="true"></div><div class="order-4 hidden basis-full max-sm:block" aria-hidden="true"></div>');
fs.writeFileSync(file,$.html());
