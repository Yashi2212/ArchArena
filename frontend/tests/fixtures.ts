import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';
import type { Experiment, Result, Design } from '../src/types';

// Presentation fixtures only. These numbers are not engine or benchmark evidence.
export const lessons = JSON.parse(readFileSync(resolve('../backend/src/main/resources/content/lessons.json'),'utf8'));
export const fixtureId = '00000000-0000-4000-8000-000000000042';
export function fixtureResult(request: Experiment, event: boolean): Result {
  return {
    engineVersion:'ui-fixture-1', assumptionsVersion:'ui-fixture-1', mode:event?'discrete-event':'analytic', seed:request.seed,
    requests:event?1200:0,successful:event?1180:0,errors:event?10:0,rejected:event?10:0,
    throughputRps:event?39.333:request.arrivalRate,p50Ms:55,p95Ms:event?180:12003.123,p99Ms:event?250:15000,
    nodes:Object.fromEntries(request.graph.nodes.map(node=>[node.id,{id:node.id,label:node.label,arrivalRate:40,utilization:node.type==='DATABASE'?2.4:0.5,meanLatencyMs:40,maxQueueDepth:node.type==='DATABASE'?18:0,visits:1200,dropped:node.type==='DATABASE'?10:0}])),
    timeline:event?Array.from({length:32},(_,i)=>({timeSeconds:i+1,throughputRps:i<30?36+(i%7):0,errorRate:0.02,queueDepth:i%6})):[],
    findings:[{severity:'critical',title:'Database demand exceeds capacity',detail:'Deterministic UI fixture: this is not a real engine result.',metric:'nodes.n3.utilization'}],
    assumptions:['Deterministic UI test fixture only. No real simulation or infrastructure was measured.'],roughCostPerHour:0.06,
  };
}

export async function mockApi(page: Page) {
  const designs: Design[]=[];
  let input: Experiment;
  const completed: string[]=[];
  await page.route('**/api/**',async route=>{
    const request=route.request();
    const path=new URL(request.url()).pathname;
    const method=request.method();
    const json=(body:unknown,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
    if(path==='/api/catalog')return json({lessons,completed,aiEnabled:false});
    if(path==='/api/preview')return json(fixtureResult(request.postDataJSON(),false));
    if(path==='/api/runs'&&method==='POST') {input=request.postDataJSON();return json({id:fixtureId,status:'QUEUED',request:input,result:null,error:null},202);}
    if(path===`/api/runs/${fixtureId}`)return json({id:fixtureId,status:'DONE',request:input,result:fixtureResult(input,true),error:null});
    if(path===`/api/runs/${fixtureId}/export`)return route.fallback(); // Let the isolated test server deliver a real HTTP attachment.
    if(path==='/api/designs'&&method==='GET')return json(designs);
    if(path==='/api/designs'&&method==='POST') {const body=request.postDataJSON();const design={id:'design-fixture-01',title:body.title,version:1,graph:body.graph};designs.push(design);return json(design);}
    if(path.startsWith('/api/lessons/')&&path.endsWith('/checkpoint')) {completed.push(path.split('/')[3]);return json({passed:true,completed});}
    if(path==='/api/practice/clarify')return json({mode:'scripted',answer:'Assume ten redirect reads per new URL. This is a UI test fixture.'});
    return json({detail:'Unimplemented test fixture route: '+path},404);
  });
}
