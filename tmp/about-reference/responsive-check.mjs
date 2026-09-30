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
for(const width of [1920,1728,1512,1440,1280,1024,834,833,640,639,390,375]) {
  await page.setViewportSize({width,height:1000});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(200);
  results.push(await page.evaluate(()=>{
    const container=document.querySelector('main .page-container');
    const bounds=container.getBoundingClientRect();
    const heading=getComputedStyle(document.querySelector('h1'));
    const first=document.querySelector('#our-story');
    return {
      width:innerWidth,container:{x:bounds.x,width:bounds.width},font:heading.fontSize,line:heading.lineHeight,
      firstHidden:getComputedStyle(first).visibility==='hidden',
      wrapped:[...document.querySelectorAll('.page-container')].every(e=>e.children.length===1&&e.firstElementChild.tagName==='DIV'),
      orbit:getComputedStyle(document.querySelector('[data-about-orbit]')).display,
      quotes:getComputedStyle(document.querySelector('[data-about-quotes]')).display,
    };
  }));
  for (const id of ['our-story','our-team','client-stories','our-people']) {
    await page.locator('#'+id).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-160,behavior:'instant'}));
    await page.waitForTimeout(100);
  }
}
await page.setViewportSize({width:1920,height:1080});
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.waitForTimeout(200);
await page.screenshot({path:'tmp/about-reference/revised-initial.png'});
const introEnd=await page.locator('#our-story .about-stop').evaluate(e=>e.getBoundingClientRect().top+scrollY+16-innerHeight*.52);
for(const progress of [.4,.8,1]) {
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),introEnd*progress);
  await page.waitForTimeout(750);
  results.push({progress,firstShown:await page.locator('#our-story').evaluate(e=>getComputedStyle(e).visibility==='visible')});
  await page.screenshot({path:`tmp/about-reference/revised-line-${progress}.png`});
}
for(const width of [1920,834,390]) {
  await page.setViewportSize({width,height:1000});
  for(const selector of ['#our-story','#our-team','#client-stories','#our-people','[data-about-giveback]']) {
    await page.locator(selector).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-120,behavior:'instant'}));
    await page.waitForTimeout(850);
    await page.screenshot({path:`tmp/about-reference/revised-${width}-${selector.replace(/[^a-z-]/g,'')}.png`});
  }
}
await page.setViewportSize({width:1920,height:1000});
const stage=page.locator('[data-quote-stage]');
const stageStart=await stage.evaluate(e=>e.getBoundingClientRect().top+scrollY-innerHeight/2);
for(const shift of [0,300,600]) {
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),stageStart+shift);
  await page.waitForTimeout(80);
  results.push({quoteScroll:shift,active:await page.locator('[data-quote-card][aria-hidden="false"]').innerText()});
}
await page.setViewportSize({width:390,height:844});
await page.locator('[data-quote-next]').click();
await page.waitForTimeout(700);
results.push({mobileQuoteScroll:await page.locator('[data-about-quotes]').evaluate(e=>e.scrollLeft)});
await page.emulateMedia({reducedMotion:'reduce'});
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.waitForTimeout(200);
results.push({reducedMotion:await page.evaluate(()=>({firstVisible:getComputedStyle(document.querySelector('#our-story')).visibility,running:document.getAnimations().filter(a=>a.playState==='running').length}))});
console.log(JSON.stringify({results,errors},null,2));
fs.writeFileSync('tmp/about-reference/responsive-results.json',JSON.stringify({results,errors},null,2));
await browser.close();server.close();
