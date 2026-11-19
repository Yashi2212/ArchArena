// Loopback QA server for the built GitHub project-site path; never a backend proxy.
import http from 'node:http';
import { createReadStream,statSync } from 'node:fs';
import { resolve,sep,extname } from 'node:path';
const root=resolve('dist'),base='/ArchArena/';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.mp4':'video/mp4','.jpg':'image/jpeg','.vtt':'text/vtt','.md':'text/plain'};
http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith(base)){res.writeHead(404).end();return;}
  const part=decodeURIComponent(url.pathname.slice(base.length))||'index.html';
  const file=resolve(root,part);if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  const size=statSync(file).size;res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');
  const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;if(start>end||start>=size){res.writeHead(416).end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});createReadStream(file,{start,end}).pipe(res);}
  else{res.writeHead(200,{'Content-Length':size});createReadStream(file).pipe(res);}
 }catch{res.writeHead(404).end();}
}).listen(5175,'127.0.0.1',()=>process.stdout.write('Static Pages QA: http://127.0.0.1:5175/ArchArena/\n'));
