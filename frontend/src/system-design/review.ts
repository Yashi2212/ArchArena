import type { Graph, Result } from '../types';
import type { Scenario } from './catalog';
export const fields = [
  ['scope','Scope and requirements','Name the users, required actions and explicit exclusions.'],
  ['scale','Scale assumptions','State average/peak traffic, retention and a latency objective with units.'],
  ['api','API and Java contracts','Specify operations, request/response types, ownership and errors.'],
  ['data','Data and access patterns','Define entities, keys, important queries and retention.'],
  ['invariant','Invariant and concurrency','Explain the atomic boundary, conflict handling and duplicate requests.'],
  ['failure','Failure and recovery','Walk through a timeout, crash, retry and recovery.'],
  ['tradeoff','Trade-offs and evolution','Compare an alternative and explain what changes at 10× load.'],
  ['tests','Behavioral tests','Describe success, invalid input, unauthorized access and concurrent-request tests.'],
] as const;
export type Worksheet = Record<typeof fields[number][0],string>;
export const emptyWorksheet = ():Worksheet=>Object.fromEntries(fields.map(([id])=>[id,''])) as Worksheet;
export interface ReviewItem { id:string; state:'missing'|'inspect'|'evidence'; text:string }
export function reviewDesign(graph:Graph, worksheet:Worksheet, scenario:Scenario, result:Result|null):ReviewItem[] {
  const review:ReviewItem[] = fields.map(([id,label,hint])=>({id,state:worksheet[id].trim()?'inspect':'missing',text:worksheet[id].trim()?`${label}: supplied for manual review; correctness is not automatically assessed.`:`${label}: missing. ${hint}`}));
  const clients=graph.nodes.filter(n=>n.type==='CLIENT');
  const ids=new Set(graph.nodes.map(n=>n.id));
  const outgoing=(id:string)=>graph.edges.filter(e=>e.source===id).map(e=>e.target);
  const reached=new Set<string>();
  const active=new Set<string>();let cycle=false;
  const visit=(id:string)=>{if(active.has(id)){cycle=true;return;}if(reached.has(id))return;reached.add(id);active.add(id);outgoing(id).forEach(visit);active.delete(id);};
  clients.forEach(n=>visit(n.id));
  const problems:string[]=[];
  if(clients.length!==1)problems.push('use exactly one client');
  if(ids.size!==graph.nodes.length)problems.push('node identifiers must be unique');
  if(graph.edges.some(e=>!ids.has(e.source)||!ids.has(e.target)))problems.push('remove connections to missing nodes');
  if(graph.nodes.some(n=>!reached.has(n.id)))problems.push('connect every component to the client path');
  if(cycle)problems.push('remove cycles from this bounded simulation graph');
  if(graph.nodes.some(n=>outgoing(n.id).length>1&&n.type!=='LOAD_BALANCER'))problems.push('only load balancers can branch in this model');
  if(graph.nodes.some(n=>outgoing(n.id).length===0&&n.type!=='DATABASE'&&n.type!=='EXTERNAL_API'))problems.push('terminate each modeled path at a database or synthetic external API');
  if(graph.nodes.some(n=>(n.type==='DATABASE'||n.type==='EXTERNAL_API')&&outgoing(n.id).length))problems.push('databases must be terminal; synthetic external APIs must also be terminal in this model');
  review.push({id:'topology',state:problems.length?'missing':'inspect',text:problems.length?`Model topology: ${problems.join('; ')}. These are simulator restrictions, not universal architecture rules.`:'Basic topology checks found no issue. Backend validation still applies; this does not validate the business design.'});
  review.push({id:'domain',state:'inspect',text:`Scenario deep dive: ${scenario.deepDive} Defend this invariant: ${scenario.invariant} Neither labels nor the generic queueing engine prove it.`});
  if(result&&result.requests>0) {
    review.push({id:'run',state:'evidence',text:`Current modeled run: ${result.successful}/${result.requests} successful; ${result.errors} errors; ${result.rejected} policy rejections; p95 ${result.p95Ms.toFixed(1)} ms for successful requests. Seed ${result.seed}. Compare against your own objective; these are not production measurements.`});
    const saturated=Object.values(result.nodes).filter(n=>n.utilization>=1).map(n=>n.label);
    if(saturated.length)review.push({id:'capacity',state:'evidence',text:`Whole-run modeled demand reaches or exceeds capacity at: ${saturated.join(', ')}. Inspect those nodes, change one input and rerun with the same seed.`});
  } else review.push({id:'run',state:'missing',text:'No completed run matches the current graph and inputs. Run the experiment before using metric evidence.'});
  return review;
}
