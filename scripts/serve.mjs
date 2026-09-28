import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
const server=http.createServer(async(req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const match=path.match(/^\/ebook\/chapter(\d+)\/p(\d+)\/?$/);
 let file=path==='/'?'index.html':match?`pages/chapter${Number(match[1])}-p${Number(match[2])}.html`:path.replace(/^\//,'');
 if(path.startsWith('/ebook')&&!match) file='unavailable.html';
 if(/^\/practice(?:\/(?:setup|question|feedback|mistakes|history))?\/?$/.test(path)) file='practice/index.html';
 if(/^\/workbook\/?$/.test(path))file='workbook/index.html';
 if(/^\/workbook\/(?:[1-9]|10)-(?:[1-9]|10)\/?$/.test(path))file=path.replace(/^\//,'').replace(/\/$/,'')+'.html';
 const full=resolve(root,file);
 if(!full.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 try{
  const data=await readFile(full);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'})[extname(full)]||'application/octet-stream'});res.end(data);
 }catch{if(path.startsWith('/ebook/')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(resolve(root,'unavailable.html')));}else{res.writeHead(404);res.end('Not found');}}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
