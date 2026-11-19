import { test, expect, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { lessons, mockApi } from './fixtures';

test.beforeEach(async({page})=>{await mockApi(page);});

async function ready(page:Page) {
  await page.goto('/');
  await expect(page.getByText('Engine connected',{exact:true})).toBeVisible();
  await expect(page.getByText('Demand is 2.4× capacity',{exact:true})).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
}

test('Learn foundation screenshot and responsive access',async({page},info)=>{
  const external:string[]=[];
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:5174'))external.push(request.url());});
  await ready(page);
  await expect(page.getByText('Modeled, not measured',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:/Saved designs/})).toBeVisible();
  await expect(page.getByRole('button',{name:'02 Caching',exact:true})).toBeVisible();
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,bodyFont:getComputedStyle(document.body).fontFamily,bodyColor:getComputedStyle(document.body).backgroundColor}));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width);
  expect(layout.bodyFont).toContain('Sora');
  expect(layout.bodyColor).toBe('rgb(16, 20, 17)');
  expect(external).toEqual([]);
  await expect(page).toHaveScreenshot('learn-foundations.png',{fullPage:true});
  if(['width-1440','width-390'].includes(info.project.name))await page.screenshot({path:resolve(`../docs/evidence/engine-v2-${info.project.name}.png`),fullPage:true});
  if(info.project.name==='width-1440')await page.screenshot({path:resolve('../docs/evidence/engine-v2-desktop-preview.png')});
});

test('all five lessons remain reachable',async({page})=>{
  await ready(page);
  for(const [index,lesson] of lessons.entries()) {
    await page.getByRole('button',{name:`0${index+1} ${lesson.title}`,exact:true}).click();
    await expect(page.getByRole('heading',{level:1})).toHaveText(lesson.title+'.');
  }
});

test('Practice and locked Studio preserve the model notice',async({page})=>{
  await ready(page);
  await page.getByRole('button',{name:/^Practice/}).click();
  await expect(page.getByRole('heading',{name:'Design a URL shortener.'})).toBeVisible();
  await expect(page.getByText('Modeled, not measured',{exact:true})).toBeVisible();
  await expect(page).toHaveScreenshot('practice-foundations.png',{fullPage:true});
  await page.getByRole('button',{name:/^Design Studio/}).click();
  await expect(page.getByRole('heading',{name:'Design Studio is locked.'})).toBeVisible();
  await expect(page.getByText('Modeled, not measured',{exact:true})).toBeVisible();
  await expect(page).toHaveScreenshot('studio-foundations.png',{fullPage:true});
});

test('save and open existing design actions survive the theme',async({page})=>{
  await ready(page);
  await page.getByRole('button',{name:'Save design',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Design saved as version 1');
  await page.getByRole('button',{name:/Saved designs/}).click();
  await expect(page.getByRole('dialog',{name:'Saved designs'})).toBeVisible();
  await page.getByRole('button',{name:/Load balancing design/}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('status')).toContainText('Loaded Load balancing design');
});

test('backend error is visible and disclosure remains present',async({page})=>{
  await page.route('**/api/catalog',route=>route.fulfill({status:503,contentType:'application/problem+json',body:JSON.stringify({detail:'Storage unavailable for UI fixture.'})}));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Backend unavailable');
  await expect(page.getByText('Modeled, not measured',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Run experiment',exact:true})).toBeDisabled();
});

test('reduced motion replaces animated edge motion with a static state',async({page})=>{
  await ready(page);
  const motion=await page.locator('.react-flow__edge-path').first().evaluate(element=>({animation:getComputedStyle(element).animationName,dashes:getComputedStyle(element).strokeDasharray}));
  expect(motion.animation).toBe('none');
  expect(motion.dashes).toBe('none');
});

async function tabTo(page:Page,target:Locator) {
  for(let count=0;count<120;count++) {
    if(await target.evaluate(element=>document.activeElement===element))return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Keyboard focus did not reach the expected control');
}

test('keyboard-only existing prediction run checkpoint and export flow',async({page})=>{
  test.setTimeout(90000); // Full Tab traversal on the local Windows runner; not a product latency target.
  await ready(page);
  const prediction=page.getByRole('textbox',{name:lessons[0].question,exact:true});
  await tabTo(page,prediction);
  await page.keyboard.type('I expect the database to constrain this modeled workload.');
  await tabTo(page,page.getByRole('button',{name:'Run experiment',exact:true}));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Seeded experiment complete');
  await expect(page.getByRole('article',{name:'Modeled p95 latency',exact:true})).toContainText('180 milliseconds');
  await tabTo(page,page.getByRole('button',{name:'Check my understanding →',exact:true}));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Checkpoint passed');
  const exportLink=page.getByRole('link',{name:'Export experiment as Markdown ↓',exact:true});
  await tabTo(page,exportLink);
  const download=page.waitForEvent('download');
  await page.keyboard.press('Enter');
  const file=await download;
  expect(readFileSync((await file.path())!,'utf8')).toContain('Not an engine result. Seed 42.');
});

test('real-browser axe checks Learn, saved dialog, Practice and locked Studio',async({page})=>{
  await ready(page);
  await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
  const check=async()=>{
    const violations=await page.evaluate(async()=>{
      const engine=(window as unknown as {axe:{run:()=>Promise<{violations:{id:string;nodes:unknown[]}[]}>}}).axe;
      return (await engine.run()).violations.map(v=>({id:v.id,nodes:v.nodes.length}));
    });
    expect(violations).toEqual([]);
  };
  await check();
  await page.getByRole('button',{name:/Saved designs/}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await check();
  await page.getByRole('button',{name:'Close saved designs'}).click();
  await page.getByRole('button',{name:/^Practice/}).click();
  await check();
  await page.getByRole('button',{name:/^Design Studio/}).click();
  await check();
});
