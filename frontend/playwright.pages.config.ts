import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./pages-tests',workers:1,timeout:60000,
 use:{baseURL:process.env.ARCHARENA_PAGES_URL||'http://127.0.0.1:5175/ArchArena/',browserName:'chromium',channel:process.platform==='win32'?'msedge':undefined,headless:true,reducedMotion:'reduce'},
 projects:[1440,390].map(width=>({name:`width-${width}`,use:{viewport:{width,height:1000}}})),
 webServer:process.env.ARCHARENA_PAGES_URL?undefined:{command:'node ../scripts/serve-pages.mjs',url:'http://127.0.0.1:5175/ArchArena/',reuseExistingServer:!process.env.CI,timeout:30000},
 reporter:[['list'],['json',{outputFile:process.env.ARCHARENA_PAGES_REPORT||'../docs/evidence/pages-browser-results.json'}]],
});
