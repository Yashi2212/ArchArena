import { test,expect } from '@playwright/test';
import { resolve } from 'node:path';
import { readFileSync,writeFileSync } from 'node:fs';

test('actual local API and worker produce replayable v2 evidence',async({page})=>{
  test.skip(process.env.ARCHARENA_LIVE_TEST!=='1','Opt-in: requires the real local API, worker and frontend; submits one synthetic experiment.');
  test.setTimeout(180000);
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/^Practice/}).click();await page.getByRole('button',{name:'Load balancing',exact:true}).click();await expect(page.getByText('Engine connected',{exact:true})).toBeVisible({timeout:30000});
  await page.getByText('Resilience settings · bounded virtual model',{exact:true}).click();
  await page.getByLabel('Maximum retries',{exact:true}).fill('1');
  await page.getByLabel('Attempt timeout (ms)',{exact:true}).fill('500');
  await page.getByLabel('Failure injection',{exact:true}).selectOption('service-kill');
  await page.getByRole('textbox',{name:/If you double service replicas/}).fill('Synthetic live verification: retries may amplify pressure during the configured outage.');
  const completed=page.waitForResponse(async response=>{
    if(!/\/api\/runs\/[a-f0-9-]+$/.test(new URL(response.url()).pathname)||response.status()!==200)return false;
    return (await response.json()).status==='DONE';
  },{timeout:60000});
  await page.getByRole('button',{name:'Run experiment',exact:true}).click();
  const run=await (await completed).json();
  writeFileSync(resolve('../docs/evidence/library-studio-live-run.json'),JSON.stringify(run,null,2)+'\n');
  expect(run.result.engineVersion).toBe('2.0.0');expect(run.result.telemetry.nodeTimeline.length).toBeGreaterThan(0);
  expect(run.result.successful+run.result.errors+run.result.rejected).toBe(run.result.requests);
  await expect(page.getByText('● Seeded experiment',{exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:'Simulation replay'})).toBeVisible();
  await page.getByLabel('Virtual time',{exact:true}).focus();await page.keyboard.press('End');
  await expect(page.getByText('32.0 virtual seconds',{exact:true})).toBeVisible();
  const attachment=page.waitForEvent('download');await page.getByRole('link',{name:/Export experiment as Markdown/}).click();
  const file=await attachment;expect(await file.failure()).toBeNull();expect(readFileSync((await file.path())!,'utf8')).toContain('Resilience counters');
  await page.screenshot({path:resolve('../docs/evidence/library-studio-live-browser.png'),fullPage:true});
});
