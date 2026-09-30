import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from '../about-tools/node_modules/playwright/index.mjs';
const root=path.resolve('app');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const results=[];
await page.goto('http://127.0.0.1:4173/about/',{waitUntil:'networkidle'});
await page.screenshot({path:'tmp/about-reference/desktop-top.png'});
for(const width of [1920,1440,1280,1024,834,768,390,375]) {
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(150);
  for(const id of ['our-story','our-team','client-stories','awards','in-the-news','our-people']) {
    await page.locator('#'+id).scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
  }
  results.push(await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,brokenImages:[...document.querySelectorAll('main img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)})));
}
await page.setViewportSize({width:1440,height:1000});
for(const id of ['our-story','our-team','client-stories','awards','in-the-news','our-people']) {
  await page.locator('#'+id).evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-160,behavior:'instant'}));
  await page.waitForTimeout(900);
  await page.screenshot({path:`tmp/about-reference/desktop-${id}.png`});
}
const accordion=page.locator('#in-the-news [data-accordion-trigger]');
await accordion.nth(1).click();
await page.waitForTimeout(400);
results.push({accordion:await accordion.evaluateAll(es=>es.map(e=>e.getAttribute('aria-expanded')))});
await page.locator('[data-quote-next]').click();
results.push({quotes:await page.locator('[data-quote-card]').evaluateAll(es=>es.map(e=>e.getAttribute('aria-hidden')))});
await page.locator('[data-history-next]').click();
await page.waitForTimeout(700);
results.push({history:await page.locator('[data-about-history]').evaluate(e=>({left:e.scrollLeft,width:e.scrollWidth,visible:e.clientWidth}))});
await page.setViewportSize({width:390,height:844});
await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
await page.waitForTimeout(300);
await page.screenshot({path:'tmp/about-reference/mobile-top.png'});
await page.locator('#menu-button').click();
results.push({mobileMenu:await page.locator('#menu-button').getAttribute('aria-expanded')});
await page.locator('#menu-button').click();
await page.emulateMedia({reducedMotion:'reduce'});
await page.waitForTimeout(150);
results.push({reducedMotion:await page.evaluate(()=>({hidden:[...document.querySelectorAll('[data-about-reveal]')].filter(e=>getComputedStyle(e).opacity==='0').length,running:document.getAnimations().filter(a=>a.playState==='running').length}))});
console.log(JSON.stringify({results,errors},null,2));
fs.writeFileSync('tmp/about-reference/check-results.json',JSON.stringify({results,errors},null,2));
await browser.close();
server.close();
