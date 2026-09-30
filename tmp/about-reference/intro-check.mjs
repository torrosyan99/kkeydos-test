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
const snapshot=()=>page.evaluate(()=>({
  locked:document.documentElement.classList.contains('about-intro-lock'),
  scroll:scrollY,
  hidden:getComputedStyle(document.querySelector('#our-story')).visibility==='hidden',
  dash:parseFloat(document.querySelector('[data-intro-curve]').style.strokeDashoffset),
  point:document.querySelector('[data-intro-ball]').style.transform,
  stroke:getComputedStyle(document.querySelector('[data-intro-curve]')).strokeWidth,
  line:getComputedStyle(document.querySelector('[data-story-line]')).width,
}));
const assert=(condition,message)=>{if(!condition)throw Error(message);};
for(const width of [1920,834,390]) {
  await page.setViewportSize({width,height:1080});
  await page.goto('http://127.0.0.1:4173/about/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.classList.contains('about-intro-lock'));
  const initial=await snapshot();
  assert(initial.hidden && initial.locked,`Initial state at ${width}`);
  await page.mouse.move(width/2,650);
  await page.mouse.wheel(0,700);
  await page.keyboard.press('PageDown');
  const touchBlocked=await page.evaluate(()=>!document.dispatchEvent(new Event('touchmove',{cancelable:true,bubbles:true})));
  await page.waitForTimeout(650);
  const during=await snapshot();
  assert(during.scroll===0 && during.locked && touchBlocked,`Scroll lock at ${width}`);
  assert(during.point!==initial.point && during.dash===initial.dash,`Dot moves before line at ${width}`);
  assert(during.stroke==='12px' && during.line==='12px',`Line thickness at ${width}`);
  await page.waitForTimeout(400);
  await page.screenshot({path:`tmp/about-reference/intro-auto-${width}.png`});
  await page.waitForFunction(()=>{
    const curve=document.querySelector('[data-intro-curve]');
    const dash=parseFloat(curve.style.strokeDashoffset);
    return dash>0 && dash<curve.getTotalLength()-1;
  });
  const drawing=await snapshot();
  assert(drawing.locked && drawing.hidden && drawing.scroll===0,`Line draws while scroll stays locked at ${width}`);
  await page.waitForFunction(()=>!document.documentElement.classList.contains('about-intro-lock'),{timeout:6000});
  await page.waitForTimeout(100);
  const complete=await snapshot();
  assert(complete.hidden && complete.dash===0,`Story waits for scroll at ${width}`);
  await page.waitForTimeout(350);
  assert((await snapshot()).hidden,`Story remains hidden without scrolling at ${width}`);
  await page.mouse.wheel(0,600);
  await page.waitForTimeout(250);
  const after=await snapshot();
  assert(after.scroll>0 && !after.hidden,`Scroll restores and reveals story at ${width}`);
  await page.waitForTimeout(700);
  await page.screenshot({path:`tmp/about-reference/intro-scrolled-${width}.png`});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(100);
  const returned=await snapshot();
  assert(!returned.locked && !returned.hidden && returned.dash===0,`No replay at ${width}`);
  results.push({width,initial,during,drawing,touchBlocked,complete,scrollAfter:after.scroll});
}
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:4173/about/',{waitUntil:'networkidle'});
const reduced=await snapshot();
assert(!reduced.locked&&!reduced.hidden,'Reduced motion stays accessible');
results.push({reduced});
await page.emulateMedia({reducedMotion:'no-preference'});
await page.goto('http://127.0.0.1:4173/about/#our-story',{waitUntil:'networkidle'});
const anchor=await snapshot();
assert(!anchor.locked&&!anchor.hidden&&anchor.scroll>0,'Direct section link remains accessible');
results.push({anchor});
assert(errors.length===0,`Browser errors: ${errors.join(', ')}`);
console.log(JSON.stringify({results,errors},null,2));
fs.writeFileSync('tmp/about-reference/intro-results.json',JSON.stringify({results,errors},null,2));
await browser.close();server.close();
