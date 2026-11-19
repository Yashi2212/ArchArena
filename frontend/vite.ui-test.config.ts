import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Separate loopback UI test server. Never included in the app build or production config.
export default defineConfig({
  plugins: [react(), {
    name: 'native-http-export-fixture',
    configureServer(server) {
      server.middlewares.use((request,response,next)=>{
        if(request.url !== '/api/runs/00000000-0000-4000-8000-000000000042/export')return next();
        const body=Buffer.from('# UI test fixture\n\nNot an engine result. Seed 42.\n','utf8');
        response.writeHead(200,{'Content-Type':'text/markdown; charset=utf-8','Content-Disposition':'attachment; filename="ui-fixture.md"','Content-Length':body.length});
        response.end(body);
      });
    },
  }],
  server:{host:'127.0.0.1',port:5174,strictPort:true},
});
