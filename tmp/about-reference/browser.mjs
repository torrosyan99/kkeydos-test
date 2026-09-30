import { chromium } from '../about-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { load } from '../about-tools/node_modules/cheerio/dist/esm/index.js';
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
try {
  if(process.argv.includes('--static')) throw Error('Rendering cached reference');
  await page.goto('https://www.bairesdev.com/about/', {waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForTimeout(3000);
  console.log('Live title',await page.title());
  if(!(await page.title()).includes('BairesDev')) throw Error('Reference protected by Cloudflare');
  await page.screenshot({path:'tmp/about-reference/live.png'});
} catch(e) {
  console.log(e.message);
  const $=load(fs.readFileSync('tmp/about-reference/source.html','utf8'));
  $('script,link,header:not(main header),footer').remove();
  const manifest=JSON.parse(fs.readFileSync('tmp/about-reference/assets-manifest.json'));
  $('img').each((i,e)=>{const el=$(e),name=manifest[el.attr('src')];if(name)el.attr('src',`file://${process.cwd().replaceAll('\\','/')}/app/assets/images/pages/about/${name}`);el.removeAttr('srcset').removeAttr('sizes').attr('loading','eager');});
  $('head').append(`<style>${fs.readFileSync('tmp/about-reference/chunks/0_rphxyah9otm.css','utf8')} [style*="opacity:0"]{opacity:1!important} main{padding-top:100px} </style>`);
  fs.writeFileSync('tmp/about-reference/static.html',$.html());
  await page.goto(`file://${process.cwd().replaceAll('\\','/')}/tmp/about-reference/static.html`);
  await page.waitForTimeout(1500);
  await page.screenshot({path:'tmp/about-reference/reference-top.png'});
  console.log(await page.locator('h1,h2,h3').evaluateAll(es=>es.map(e=>({text:e.textContent.slice(0,110),x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,width:e.clientWidth,font:getComputedStyle(e).fontSize,line:getComputedStyle(e).lineHeight}))))
}
await browser.close();
