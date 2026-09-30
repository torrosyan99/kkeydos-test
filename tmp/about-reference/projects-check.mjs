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
const assert=(condition,message)=>{if(!condition)throw Error(message);};
for(const width of [1920,1440,834,640,390]) {
  await page.setViewportSize({width,height:1000});
  await page.goto('http://127.0.0.1:4173/about/#our-projects',{waitUntil:'networkidle'});
  const section=page.locator('#our-projects');
  const top=await section.evaluate(el=>el.getBoundingClientRect().top+scrollY);
  const samples=[];
  for(const offset of [-700,-300,100]) {
    await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top+offset);
    await page.waitForTimeout(100);
    samples.push(await section.evaluate(el=>{
      const photo=el.querySelector('[data-projects-photo]');
      if(!photo)return {missing:true};
      const rect=photo.getBoundingClientRect();
      const image=photo.querySelector('img');
      const imageRect=image.getBoundingClientRect();
      return {position:getComputedStyle(image).transform,width:rect.width,height:rect.height,top:rect.top+scrollY,covered:imageRect.top<=rect.top&&imageRect.bottom>=rect.bottom&&imageRect.left<=rect.left&&imageRect.right>=rect.right,overflow:document.documentElement.scrollWidth>innerWidth};
    }));
  }
  assert(samples.every(sample=>!sample.missing&&!sample.overflow),`Photo and overflow at ${width}`);
  assert(new Set(samples.map(sample=>sample.position)).size>1,`Photo responds to scroll at ${width}`);
  assert(new Set(samples.map(sample=>sample.top)).size===1,`Frame stays fixed in section at ${width}`);
  assert(samples.every(sample=>sample.covered),`No empty edges at ${width}`);
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top-700);
  await page.waitForTimeout(100);
  const reversed=await section.locator('img').evaluate(el=>getComputedStyle(el).transform);
  assert(reversed===samples[0].position,`Scroll animation reverses at ${width}`);
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),top-300);
  await page.waitForTimeout(200);
  await page.screenshot({path:`tmp/about-reference/projects-${width}.png`});
  results.push({width,samples});
}
await page.emulateMedia({reducedMotion:'reduce'});
await page.evaluate(()=>scrollBy({top:-300,behavior:'instant'}));
await page.waitForTimeout(100);
const reduced=await page.locator('[data-projects-photo] img').evaluate(el=>getComputedStyle(el).transform);
assert(reduced==='none','Reduced motion uses static photo');
assert(errors.length===0,errors.join(', '));
console.log(JSON.stringify({results,reduced,errors},null,2));
await browser.close();server.close();
