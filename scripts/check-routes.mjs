import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const base=process.argv[2];
if(!base) throw new Error('Pass the deployed site URL');
const manifest=JSON.parse(await readFile(new URL('../dist/manifest.json',import.meta.url),'utf8'));
const results=[];
for(let i=0;i<manifest.length;i+=8){
 const batch=await Promise.all(manifest.slice(i,i+8).map(async p=>{
  const response=await fetch(base+p.url,{redirect:'manual'});
  const html=await response.text();
  assert.equal(response.status,200,p.url);
  assert.ok(html.includes(`data-chapter="${p.chapter}"`),`${p.url} wrong chapter`);
  assert.ok(html.includes(`data-page="${p.page}"`),`${p.url} wrong page`);
  assert.ok(html.includes(`Textbook page ${p.printed}`),`${p.url} wrong textbook page`);
  assert.ok(html.includes(`src="${p.asset}"`),`${p.url} wrong image`);
  return {path:p.url,status:response.status,page:p.page,textbookPage:p.printed};
 }));
 results.push(...batch);
}
for(const asset of ['/assets/styles.css','/assets/site.css','/assets/site-shell.mjs','/assets/reader.js',...new Set(manifest.map(p=>p.asset))]){
 const response=await fetch(base+asset,{method:'HEAD'});assert.equal(response.status,200,asset);
}
const homepage=await fetch(base+'/',{redirect:'follow'});
assert.equal(homepage.status,200);
assert.equal(new URL(homepage.url).pathname,'/');
assert.ok((await homepage.text()).includes('Explore the course'));
const trailing=await fetch(base+'/ebook/chapter1/p25/');assert.equal(trailing.status,200);assert.ok((await trailing.text()).includes('data-page="25"'));
await writeFile(new URL('../verification/public-routes.json',import.meta.url),JSON.stringify({base,verifiedAt:new Date().toISOString(),total:results.length,results},null,2));
console.log(`PASS: ${results.length} public routes return HTTP 200 with the exact page and matching textbook image. All ${new Set(manifest.map(p=>p.asset)).size} images and shared reader assets return HTTP 200. Homepage and trailing-slash links also work.`);
