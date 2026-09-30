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
