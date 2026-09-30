import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const mode = process.argv[2];
const urls = JSON.parse(fs.readFileSync(`tmp/about-reference/${mode === 'assets' ? 'assets' : 'resources'}.json`));
const directory = mode === 'assets' ? 'app/assets/images/pages/about' : 'tmp/about-reference/chunks';
fs.mkdirSync(directory,{recursive:true});
const manifest = {};
let index=0;
await Promise.all(Array.from({length:6},async()=>{
  while(index<urls.length){
    const original=urls[index++];
    let url=original;
    let name=path.basename(original.split('?')[0]);
    if(mode === 'assets') {
      if(!path.extname(name)) name += '.webp';
      url = original.replace('c_limit,w_1920/dpr_auto/f_auto/q_auto','c_limit,w_1200/f_webp/q_auto').replace('c_limit,w_1728/dpr_auto/f_auto/q_auto','c_limit,w_1000/f_webp/q_auto').replace('c_limit,w_375/dpr_auto/f_auto/q_auto','c_limit,w_375/f_webp/q_auto');
    } else url = 'https://r.jina.ai/https://www.bairesdev.com'+original;
    const file=path.join(directory,name);
    try {
      await exec('curl.exe',['-f','-sS','-L','--max-time','50',url,'-o',file]);
      let size=fs.statSync(file).size;
      if(mode !== 'assets') {
        let data=fs.readFileSync(file,'utf8');
        if(data.includes('Markdown Content:')) data=data.split('Markdown Content:').slice(1).join('Markdown Content:').trim();
        fs.writeFileSync(file,data);
      }
      manifest[original]=name;
      console.log(name,size);
    } catch(error) {console.error('FAILED',original,error.message);}
  }
}));
fs.writeFileSync(`tmp/about-reference/${mode}-manifest.json`,JSON.stringify(manifest,null,2));
