import { test,expect } from '@playwright/test';
import { mockApi } from './fixtures';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
test.beforeEach(async({page})=>{await mockApi(page);await page.goto('/');await expect(page.getByRole('heading',{name:'System design library.'})).toBeVisible();});
test('company study separates context, proposals and practice',async({page})=>{
 await page.getByRole('button',{name:'Companies',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Company study index'}).getByRole('button')).toHaveCount(20);
 await expect(page.getByRole('heading',{name:'Documented context · separate from our proposal'})).toBeVisible();
 await expect(page.getByRole('link',{name:/Uber Engineering: H3/})).toHaveAttribute('href','https://www.uber.com/blog/h3/');
 await expect(page.locator('main')).toContainText('A spatial index narrows candidates; it does not establish ownership.');
 await expect(page.locator('main input, main textarea, .react-flow')).toHaveCount(0);
 await page.getByRole('button',{name:'Open Uber playground →'}).click();
 await expect(page.getByRole('heading',{name:'Design a ride-hailing service.'})).toBeVisible();
 await page.getByLabel('Scope and requirements',{exact:true}).fill('One city; exclusive driver assignment.');
 await page.getByRole('button',{name:'Review my design',exact:true}).click();
 await expect(page.getByRole('region',{name:'Rule-based design feedback'})).toContainText('manual review');
});
test('Studio persists artifacts, captures a graph and exports a bundle',async({page})=>{
 await page.getByRole('button',{name:/^Design Studio/}).click();
 await expect(page.getByRole('navigation',{name:'Design artifact stages'}).getByRole('button')).toHaveCount(6);
 await page.getByLabel('Requirements decisions').fill('One city; one active trip per driver.');
 await page.getByRole('button',{name:/02\s*Capacity/}).click();
 await page.getByLabel('Operations per day').fill('86400');
 await page.getByLabel('Peak multiplier').fill('3');
 await expect(page.locator('.studio-capacity')).toContainText('Average 1.00 operations/s · assumed peak 3.00 operations/s');
 await page.getByRole('button',{name:/03\s*HLD/}).click();
 await page.getByRole('button',{name:'Capture current Practice graph'}).click();
 await expect(page.locator('.studio-snapshot')).toContainText('4 nodes · 3 connections');
 await page.getByRole('button',{name:'Review artifact coverage'}).click();
 await expect(page.locator('.studio-artifact aside')).toContainText('Missing — add a decision');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export design bundle ↓'}).click();
 const file=await download;const bundle=JSON.parse(readFileSync((await file.path())!,'utf8'));
 expect(bundle.artifacts.requirements).toContain('one active trip');expect(bundle.graph.nodes).toHaveLength(4);expect(bundle.daily).toBe(86400);
 await page.reload();await page.getByRole('button',{name:/^Design Studio/}).click();
 await expect(page.getByLabel('Requirements decisions')).toHaveValue('One city; one active trip per driver.');
});
test('self-hosted tutorial decodes, plays and exposes captions and chapters',async({page})=>{
 test.setTimeout(60000);
 const video=page.getByLabel('How ArchArena works',{exact:true});
 await expect(video).toBeVisible();
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>Number.isFinite(v.duration)?v.duration:0)).toBeCloseTo(72,0);
 expect(await video.evaluate((v:HTMLVideoElement)=>v.videoWidth)).toBe(1280);
 await video.evaluate((v:HTMLVideoElement)=>{v.muted=true;return v.play();});
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(0.2);
 await video.evaluate((v:HTMLVideoElement)=>v.pause());
 await page.getByRole('button',{name:'00:48 · Inspect failure and replay'}).click();
 expect(await video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeCloseTo(48,0);
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.textTracks[0]?.cues?.length||0)).toBeGreaterThan(0);
 await page.getByText('Read the video transcript',{exact:true}).click();
 await expect(page.locator('.intro-video')).toContainText('does not prove payment correctness');
});
test('company library and Studio have no axe violations or horizontal overflow',async({page},info)=>{
 test.setTimeout(90000);
 await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
 for(const view of ['Companies','Design Studio']){
  await page.getByRole('button',{name:view==='Companies'?view:/^Design Studio/,exact:view==='Companies'}).click();
  const scan=await page.evaluate(async()=>await (window as unknown as {axe:{run:()=>Promise<{violations:unknown[]}>}}).axe.run());
  expect(scan.violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(['width-1440','width-390'].includes(info.project.name))await page.screenshot({path:resolve(`../docs/evidence/library-studio-${view.replace(' ','-')}-${info.project.name}.png`),fullPage:true});
 }
});
