import { useEffect, useState } from 'react';
import { scenarios, type Scenario, type Track } from './catalog';
import { emptyWorksheet, fields, reviewDesign, type Worksheet } from './review';
import type { Graph, Result } from '../types';
const DRAFTS_KEY='archarena-practice-worksheets-v1';
function readWorksheets():Record<string,Worksheet> {
  try {
    const raw=JSON.parse(localStorage.getItem(DRAFTS_KEY)||'{}');
    return Object.fromEntries(scenarios.filter(s=>raw?.[s.id]&&typeof raw[s.id]==='object').map(s=>[s.id,Object.fromEntries(fields.map(([id])=>[id,typeof raw[s.id][id]==='string'?raw[s.id][id].slice(0,4000):''])) as Worksheet]));
  } catch { return {}; }
}
export function PracticeGuide({scenario,onScenario,track,onTrack,graph,result}:{scenario:Scenario;onScenario:(s:Scenario)=>void;track:Track;onTrack:(t:Track)=>void;graph:Graph;result:Result|null}) {
  const [drafts,setDrafts]=useState<Record<string,Worksheet>>(readWorksheets);
  const [storageError,setStorageError]=useState(false);
  useEffect(()=>{try{localStorage.setItem(DRAFTS_KEY,JSON.stringify(drafts));setStorageError(false);}catch{setStorageError(true);}},[drafts]);
  const [reviewed,setReviewed]=useState(false);
  const worksheet=drafts[scenario.id]??emptyWorksheet();
  const [candidate,setCandidate]=useState(scenario.id);
  const selected=scenarios.find(s=>s.id===candidate)!;
  function update(id:keyof Worksheet,value:string){setDrafts({...drafts,[scenario.id]:{...worksheet,[id]:value}});setReviewed(false);}
  return <section className={`practice-guide practice-${track}`} aria-label="System design practice guide">
    <div className="scenario-picker"><div><span className="eyebrow">20 COMPANY-INSPIRED SCENARIOS</span><h2>Choose a system to design.</h2><p>Original interview exercises, not verified company blueprints, endorsements or a company ranking.</p></div><label>Practice scenario<select value={candidate} onChange={e=>setCandidate(e.target.value)}>{scenarios.map(s=><option key={s.id} value={s.id}>{s.company} · {s.title}</option>)}</select></label><button className="secondary" onClick={()=>{onScenario(selected);setReviewed(false);}}>Start selected scenario</button></div>
    <p className="content-status">Starting replaces the current canvas with a minimal starter, not a solution. Save your graph first if needed. Worksheets are browser-local, separate per scenario; backend saves/export contain the graph and model only. Do not enter secrets or personal customer data.</p>
    {storageError&&<p role="status">Browser storage unavailable. Worksheets remain in memory for this visit only.</p>}
    <div className="scenario-mission"><h3>Mission · {scenario.company}-inspired</h3><p>{scenario.mission}</p><ul>{scenario.requirements.map(r=><li key={r}>{r}</li>)}</ul><p><strong>Invariant to defend:</strong> {scenario.invariant}</p><p>Traffic, retention and latency targets are your exercise assumptions. The virtual model traffic does not represent this company’s workload.</p></div>
    <div className="design-switch" role="group" aria-label="Practice design view"><button aria-pressed={track==='hld'} onClick={()=>onTrack('hld')}>HLD · Architecture canvas</button><button aria-pressed={track==='lld'} onClick={()=>onTrack('lld')}>LLD · Java contracts</button></div>
    <div className="worksheet"><div><span className="eyebrow">{track==='hld'?'SYSTEM BOUNDARIES':'JAVA RESPONSIBILITIES'}</span><h3>{track==='hld'?'Make the architecture explainable.':'Turn decisions into contracts.'}</h3>{track==='lld'&&<pre className="java-blueprint">{`// Suggested operations, not an implementation\n${scenario.contract}\n\nWrite types, errors, ownership and transaction boundaries below.`}</pre>}<p>{track==='hld'?'Use the canvas below for bounded request-flow experiments. Document domain flows separately when they exceed the model.':'The HLD simulator is hidden in this view. Java text is a design artifact: it is not compiled, executed or graded for semantic correctness.'}</p></div>
    {fields.filter(([id])=>track==='hld'?['scope','scale','data','failure','tradeoff'].includes(id):['api','invariant','tests'].includes(id)).map(([id,label,hint])=><div className="worksheet-field" key={id}><label htmlFor={`worksheet-${id}`}>{label}</label><textarea id={`worksheet-${id}`} value={worksheet[id]} placeholder={hint} maxLength={4000} rows={3} onChange={e=>update(id,e.target.value)}/></div>)}</div>
    <button className="primary" onClick={()=>setReviewed(true)}>Review my design</button><p className="content-status">Rule-based coach · AI disabled · No overall score. Missing decisions are flagged; supplied prose requires human review. Feedback updates against the current canvas and inputs.</p>
    {reviewed&&<section className="design-review" aria-label="Rule-based design feedback" aria-live="polite"><h3>Design review · next improvements</h3><ol>{reviewDesign(graph,worksheet,scenario,result).map(r=><li key={r.id} className={`review-${r.state}`}><strong>{r.state==='missing'?'Action needed':r.state==='evidence'?'Model evidence':'Manual review'}</strong><p>{r.text}</p></li>)}</ol><p>This engine does not simulate geospatial discovery, exclusive driver assignment, payment correctness, message ordering or Java execution. A successful queueing run is not proof of a complete system design.</p></section>}
  </section>;
}
