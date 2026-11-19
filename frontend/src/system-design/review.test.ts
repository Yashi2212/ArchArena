import { describe, it, expect } from 'vitest';
import { reviewDesign, emptyWorksheet, fields } from './review';
import { scenarios, topics } from './catalog';
import type { Graph, Result } from '../types';
const graph:Graph={nodes:[{id:'c',type:'CLIENT',label:'Rider',config:{}},{id:'s',type:'SERVICE',label:'Matcher',config:{}},{id:'d',type:'DATABASE',label:'Trips',config:{}}],edges:[{id:'a',source:'c',target:'s'},{id:'b',source:'s',target:'d'}]};
const uber=scenarios.find(s=>s.id==='uber')!;
describe('design coaching boundaries',()=>{
  it('does not accept an empty design or infer domain correctness from component labels',()=>{
    const feedback=reviewDesign(graph,emptyWorksheet(),uber,null);
    expect(feedback.filter(r=>r.state==='missing')).toHaveLength(9);
    expect(feedback.find(r=>r.id==='domain')?.text).toContain('at most one active assigned trip');
    expect(feedback.find(r=>r.id==='domain')?.state).toBe('inspect');
  });
  it('marks supplied prose for human review rather than assigning keyword scores',()=>{
    const filled=Object.fromEntries(fields.map(([id])=>[id,'cache queue sharding'])) as ReturnType<typeof emptyWorksheet>;
    const feedback=reviewDesign(graph,filled,uber,null);
    expect(feedback.slice(0,8).every(r=>r.state==='inspect')).toBe(true);
    expect(feedback.find(r=>r.id==='run')?.state).toBe('missing');
  });
  it('catches disconnected nodes, missing edges, cycles and unsupported branching',()=>{
    const broken:Graph={nodes:[...graph.nodes,{id:'q',type:'QUEUE',label:'Orphan',config:{}}],edges:[...graph.edges,{id:'x',source:'s',target:'missing'},{id:'loop',source:'s',target:'s'}]};
    const text=reviewDesign(broken,emptyWorksheet(),uber,null).find(r=>r.id==='topology')!.text;
    for(const fragment of ['missing nodes','connect every component','cycles','only load balancers','terminate each'])expect(text).toContain(fragment);
  });
  it('uses explicit whole-run evidence without converting good performance into a business pass',()=>{
    const result={requests:100,successful:90,errors:7,rejected:3,p95Ms:180,seed:42,nodes:{s:{label:'Matcher',utilization:1.2}}} as unknown as Result;
    const review=reviewDesign(graph,emptyWorksheet(),uber,result);
    expect(review.find(r=>r.id==='run')?.text).toContain('90/100');
    expect(review.find(r=>r.id==='run')?.text).toContain('successful requests');
    expect(review.find(r=>r.id==='capacity')?.text).toContain('Matcher');
    expect(review.find(r=>r.id==='invariant')?.state).toBe('missing');
  });
  it('requires finite graph ownership and terminal database boundaries',()=>{
    const broken:Graph={...graph,nodes:[...graph.nodes,graph.nodes[0]],edges:[...graph.edges,{id:'back',source:'d',target:'s'}]};
    const text=reviewDesign(broken,emptyWorksheet(),uber,null).find(r=>r.id==='topology')!.text;
    expect(text).toContain('exactly one client');expect(text).toContain('unique');expect(text).toContain('databases must be terminal');
  });
});
describe('curriculum and scenario availability',()=>{
  it('offers exactly twenty distinct scenario exercises including ride matching',()=>{
    expect(scenarios).toHaveLength(20);expect(new Set(scenarios.map(s=>s.id)).size).toBe(20);
    expect(uber.requirements).toContain('Nearby candidate discovery and exclusive assignment');
    expect(scenarios.every(s=>s.requirements.length===3&&s.invariant&&s.contract&&s.deepDive)).toBe(true);
  });
  it('separates HLD and LLD, with all levels and only the five implemented lab links',()=>{
    expect(topics).toHaveLength(40);
    for(const track of ['hld','lld'])for(const level of ['Foundation','Intermediate','Advanced'])expect(topics.some(t=>t.track===track&&t.level===level)).toBe(true);
    expect(topics.filter(t=>t.lab).map(t=>t.lab).sort()).toEqual(['caching','load-balancing','queues','rate-limiting','replication']);
  });
});
