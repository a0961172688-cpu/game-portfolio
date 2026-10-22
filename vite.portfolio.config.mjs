import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
import {existsSync, unlinkSync} from 'node:fs';
const mediaEntry=existsSync(resolve('src/App.tsx'))&&existsSync(resolve('src/main.tsx'));
// Keep the user's local alternate entry optional in clean source checkouts.
function omitUnusedExports(){
  return {name:'portfolio-omit-unused-exports',closeBundle(){
    for(const file of ['assets/resume-before-url-update.pdf','assets/resume-li-benyan-game-dev.docx','portfolio/paper-botanical.png']){
      const output=resolve('dist',file);
      if(existsSync(output))unlinkSync(output);
    }
  }};
}
function compressedBuildHeaders(){
  const install=server=>{server.middlewares.use((req,res,next)=>{
    const p=(req.url||'').split('?')[0];
    if(p.startsWith('/play/')&&p.endsWith('.gz')){
      res.setHeader('Content-Encoding','gzip');
      if(p.endsWith('.wasm.gz'))res.setHeader('Content-Type','application/wasm');
      else if(p.endsWith('.js.gz'))res.setHeader('Content-Type','application/javascript');
    }
    next();
  });};
  return {name:'portfolio-compressed-builds',configureServer:install,configurePreviewServer:install};
}
export default defineConfig({
  plugins:[react(),compressedBuildHeaders(),omitUnusedExports()],
  server:{host:'127.0.0.1',port:5174,strictPort:true},
  preview:{host:'127.0.0.1',port:4174,strictPort:true},
  build:{rollupOptions:{input:{main:resolve('index.html'),...(mediaEntry?{media:resolve('new-media.html')}:{})}}},
});
