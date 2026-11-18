import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, addEdge, type Node as FlowNode, type Edge as FlowEdge, type NodeProps, type Connection, type NodeChangeset, type EdgeChangeset } from '@xyflow/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, names, symbols, stableRequest, type Design, type Experiment, type Graph, type Lesson, type NodeType, type Result, type Run } from './types';

type NodeData = { label: string; kind: NodeType; config: Record<string, number>; utilization?: number };
type ArchitectureNode = FlowNode<NodeData, 'architecture'>;
type Canvas = { nodes: ArchitectureNode[]; edges: FlowEdge[] };
const DRAFT = 'archarena-draft-v1';
const defaults = (type: NodeType): Record<string,number> => ({ replicas: 1, serviceMs: type === 'DATABASE' ? 35 : type === 'SERVICE' ? 20 : type === 'QUEUE' ? 60 : type === 'CACHE' ? 2 : 0.5, concurrency: type === 'SERVICE' ? 4 : 1, hitRatio: 0, readRatio: 0.9, rate: 25, burst: 10, queueLimit: 200 });
function canvasFromGraph(graph: Graph): Canvas {
  return { nodes: graph.nodes.map((n,i) => ({ id:n.id, type:'architecture', position:{x:i*215+30,y:i%2===0?140:190}, data:{label:n.label,kind:n.type,config:n.config} })), edges:graph.edges.map(e => ({...e,animated:true,type:'smoothstep'})) };
}
function preset(id: string): Canvas {
  const types: NodeType[] = id === 'caching' ? ['CLIENT','LOAD_BALANCER','SERVICE','CACHE','DATABASE'] : id === 'queues' ? ['CLIENT','LOAD_BALANCER','QUEUE','DATABASE'] : id === 'rate-limiting' ? ['CLIENT','RATE_LIMITER','SERVICE','DATABASE'] : ['CLIENT','LOAD_BALANCER','SERVICE','DATABASE'];
  const nodes=types.map((type,i) => ({id:`n${i}`,type,label:names[type],config:defaults(type)}));
  if(id==='load-balancing') {const n=nodes.find(n=>n.type==='SERVICE')!;n.config.concurrency=1;n.config.serviceMs=60;}
  if(id==='caching') nodes.find(n=>n.type==='DATABASE')!.config.serviceMs=50;
  if(id==='replication') nodes.find(n=>n.type==='DATABASE')!.config.serviceMs=50;
  return canvasFromGraph({nodes,edges:nodes.slice(1).map((n,i)=>({id:`e${i}`,source:nodes[i].id,target:n.id}))});
}
function readDraft(): Canvas {
  try {const saved=JSON.parse(localStorage.getItem(DRAFT)||'null');if(saved?.canvas?.nodes?.length&&Array.isArray(saved.canvas.edges))return saved.canvas;} catch { /* Invalid browser drafts never prevent startup. */ }
  return preset('load-balancing');
}
function ArchitectureCard({data,selected}: NodeProps<ArchitectureNode>) {
  const u=data.utilization;
  return <div className={`architecture-card ${selected?'selected':''} kind-${data.kind.toLowerCase()}`}>
    <Handle type="target" position={Position.Left} isConnectable={data.kind!=='CLIENT'} />
    <div className="node-top"><span className="node-symbol" aria-hidden="true">{symbols[data.kind]}</span><span className={`node-dot ${u!==undefined&&u>=1?'hot':''}`} /></div>
    <strong>{data.label}</strong><small>{data.kind==='SERVICE'?`${data.config.replicas||1} replicas · Spring Boot`:data.kind==='DATABASE'?`${data.config.replicas||1} read pools · SQL`:data.kind==='CACHE'?`${Math.round((data.config.hitRatio||0)*100)}% read hits`:data.kind==='QUEUE'?`${data.config.concurrency||1} workers`:data.kind==='RATE_LIMITER'?`${data.config.rate||25} requests/s`:'Request routing'}</small>
    <div className="node-bottom"><span>{u===undefined?'Ready to model':`${Math.round(u*100)}% utilization`}</span><span aria-hidden="true">↗</span></div>
    <Handle type="source" position={Position.Right} isConnectable={data.kind!=='DATABASE'} />
  </div>;
}
const nodeTypes = { architecture: ArchitectureCard };
const number = (n: number, digits=0) => Number.isFinite(n) ? n.toLocaleString(undefined,{maximumFractionDigits:digits}) : '—';

export function App() {
  const [mode,setMode]=useState<'learn'|'practice'|'studio'>('learn');
  const [lessons,setLessons]=useState<Lesson[]>([]);
  const [completed,setCompleted]=useState<string[]>([]);
  const [lessonId,setLessonId]=useState(()=>{try{return JSON.parse(localStorage.getItem(DRAFT)||'null')?.lessonId||'load-balancing';}catch{return 'load-balancing';}});
  const [canvas,setCanvas]=useState<Canvas>(readDraft);
  const [selected,setSelected]=useState<string|null>(null);
  const [traffic,setTraffic]=useState(40);
  const [seed,setSeed]=useState(42);
  const [profile,setProfile]=useState('steady');
  const [failure,setFailure]=useState('none');
  const [prediction,setPrediction]=useState('');
  const [preview,setPreview]=useState<Result|null>(null);
  const [result,setResult]=useState<Result|null>(null);
  const [resultKey,setResultKey]=useState('');
  const [completedRunId,setCompletedRunId]=useState<string|null>(null);
  const [runId,setRunId]=useState<string|null>(()=>{try{return localStorage.getItem('archarena-last-run');}catch{return null;}});
  const [running,setRunning]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');
  const [online,setOnline]=useState(false);
  const [previewing,setPreviewing]=useState(false);
  const [baseline,setBaseline]=useState<Result|null>(null);
  const [revision,setRevision]=useState(0);
  const [saved,setSaved]=useState<Design|null>(null);
  const [designs,setDesigns]=useState<Design[]|null>(null);
  const [crossTab,setCrossTab]=useState(false);
  const [question,setQuestion]=useState('What is the read-to-write ratio?');
  const [answer,setAnswer]=useState('');
  const [daily,setDaily]=useState(100000000);
  const [ratio,setRatio]=useState(10);
  const [recordBytes,setRecordBytes]=useState(512);
  const [scorecard,setScorecard]=useState<{dimensions:{name:string;status:string;score?:number;evidence:string}[]}|null>(null);
  const history=useRef<Canvas[]>([]),future=useRef<Canvas[]>([]),requestRevision=useRef(0),runKey=useRef('');
  const lesson=lessons.find(l=>l.id===lessonId);
  const graph: Graph = useMemo(()=>({nodes:canvas.nodes.map(n=>({id:n.id,type:n.data.kind,label:n.data.label,config:n.data.config})),edges:canvas.edges.map(e=>({id:e.id,source:e.source,target:e.target}))}),[canvas]);
  const experiment: Experiment=useMemo(()=>({graph,arrivalRate:traffic,durationSeconds:30,seed,profile,failure}),[graph,traffic,seed,profile,failure]);
  const key=stableRequest(experiment);
  const isCurrent=result!==null&&resultKey===key;
  const shown=isCurrent?result:preview;
  const target=canvas.nodes.find(n=>n.data.kind===lesson?.nodeType);

  useEffect(()=>{let live=true;api<{lessons:Lesson[];completed:string[]}>('/catalog').then(c=>{if(live){setLessons(c.lessons);setCompleted(c.completed);setOnline(true);}}).catch(e=>{if(live)setError(`Backend unavailable. Start the API and worker using howtorun.md. ${e.message}`);});return()=>{live=false;};},[]);
  useEffect(()=>{if(crossTab)return;const timer=setTimeout(()=>{try{localStorage.setItem(DRAFT,JSON.stringify({canvas,lessonId,savedAt:Date.now()}));}catch{setNotice('Browser storage is unavailable. Save a design to the backend to keep it.');}},500);return()=>clearTimeout(timer);},[canvas,crossTab,lessonId]);
  useEffect(()=>{const onStorage=(event:StorageEvent)=>{if(event.key===DRAFT){setCrossTab(true);setNotice('Another tab changed the draft. Your current canvas is preserved; reload that draft explicitly.');}};window.addEventListener('storage',onStorage);return()=>window.removeEventListener('storage',onStorage);},[]);
  useEffect(()=>{
    if(!online||mode==='studio')return;
    const current=++requestRevision.current;
    const controller=new AbortController();
    const timer=setTimeout(()=>{setPreviewing(true);api<Result>('/preview',{method:'POST',body:JSON.stringify(experiment),signal:controller.signal}).then(r=>{if(current===requestRevision.current){setPreview(r);setError('');}}).catch(e=>{if(e.name!=='AbortError'&&current===requestRevision.current){setError(e.message);setPreview(null);}}).finally(()=>{if(current===requestRevision.current)setPreviewing(false);});},400);
    return()=>{clearTimeout(timer);controller.abort();};
  },[key,online,mode]);
  useEffect(()=>{
    if(!runId||!online)return;
    let stopped=false,timer:ReturnType<typeof setTimeout>,polls=0;
    const controller=new AbortController();
    const poll=async()=>{
      try {const run=await api<Run>(`/runs/${runId}`,{signal:controller.signal});if(stopped)return;
        if(run.status==='DONE'&&run.result){setResult(run.result);setCompletedRunId(run.id);setResultKey(stableRequest(run.request));setRunning(false);setNotice('Seeded experiment complete. Metrics describe this model, not real infrastructure.');}
        else if(['FAILED','TIMED_OUT'].includes(run.status)){setRunning(false);setError(run.error||'Experiment failed');}
        else if(++polls<60){setRunning(true);timer=setTimeout(poll,750);}
        else {setRunning(false);setNotice('The job is still pending. Refresh to resume checking its saved status.');}
      } catch(e){if(!stopped){setRunning(false);setError((e as Error).message);}}
    };
    poll();return()=>{stopped=true;clearTimeout(timer);controller.abort();};
  },[runId,online]);
  const commit=useCallback((next:Canvas)=>{history.current=[...history.current.slice(-29),canvas];future.current=[];setCanvas(next);setRevision(r=>r+1);setScorecard(null);},[canvas]);
  function undo(){const previous=history.current.pop();if(previous){future.current.push(canvas);setCanvas(previous);setRevision(r=>r+1);}}
  function redo(){const next=future.current.pop();if(next){history.current.push(canvas);setCanvas(next);setRevision(r=>r+1);}}
  function chooseLesson(id:string){setLessonId(id);commit(preset(id));setPrediction('');setSaved(null);setSelected(null);setError('');}
  function changeNode(id:string,key:string,value:number){commit({...canvas,nodes:canvas.nodes.map(n=>n.id===id?{...n,data:{...n.data,config:{...n.data.config,[key]:value}}}:n)});}
  async function execute(){setError('');setRunning(true);try{runKey.current=crypto.randomUUID();const run=await api<Run>('/runs',{method:'POST',headers:{'Idempotency-Key':runKey.current},body:JSON.stringify(experiment)});setRunId(run.id);localStorage.setItem('archarena-last-run',run.id);}catch(e){setError((e as Error).message);setRunning(false);}}
  async function save(){setError('');try{const body={title:saved?.title||`${mode==='practice'?'URL shortener':lesson?.title||'Architecture'} design`,version:saved?.version,graph};const d=await api<Design>(saved?`/designs/${saved.id}`:'/designs',{method:saved?'PUT':'POST',body:JSON.stringify(body)});setSaved(d);setNotice(`Design saved as version ${d.version}. Graph snapshots are retained by the backend.`);}catch(e){setError((e as Error).message);}}
  async function checkpoint(){if(!runId||!isCurrent)return;try{const response=await api<{passed:boolean;completed:string[]}>(`/lessons/${lessonId}/checkpoint`,{method:'POST',body:JSON.stringify({runId})});setCompleted(response.completed);setNotice(response.passed?'Checkpoint passed — completion verified by the backend.':'Checkpoint not passed yet. Review the challenge and try a different design.');}catch(e){setError((e as Error).message);}}
  async function ask(){try{const r=await api<{answer:string}>('/practice/clarify',{method:'POST',body:JSON.stringify({question})});setAnswer(r.answer);}catch(e){setError((e as Error).message);}}
  async function grade(){if(runId)try{setScorecard(await api(`/runs/${runId}/scorecard`));}catch(e){setError((e as Error).message);}}
  function addNode(kind:NodeType){if(canvas.nodes.length>=30){setError('The model supports at most 30 nodes.');return;}const id=`node-${crypto.randomUUID().slice(0,8)}`;commit({...canvas,nodes:[...canvas.nodes,{id,type:'architecture',position:{x:180+canvas.nodes.length*50,y:330},data:{label:names[kind],kind,config:defaults(kind)}}]});setSelected(id);}
  const visualNodes=canvas.nodes.map(n=>({...n,data:{...n.data,utilization:shown?.nodes[n.id]?.utilization}}));
  const onNodesChange=(changes:NodeChangeset<ArchitectureNode>)=>{const next=changes.applyTo(canvas.nodes);if([...changes].some(c=>c.type==='remove'))commit({...canvas,nodes:next,edges:canvas.edges.filter(e=>next.some(n=>n.id===e.source)&&next.some(n=>n.id===e.target))});else setCanvas({...canvas,nodes:next});};
  const onEdgesChange=(changes:EdgeChangeset<FlowEdge>)=>{const next=changes.applyTo(canvas.edges);if([...changes].some(c=>c.type==='remove'))commit({...canvas,edges:next});else setCanvas({...canvas,edges:next});};
  const onConnect=(connection:Connection)=>commit({...canvas,edges:addEdge({...connection,id:`edge-${crypto.randomUUID().slice(0,8)}`,animated:true,type:'smoothstep'},canvas.edges)});
  const selectedNode=canvas.nodes.find(n=>n.id===selected);
  const failed=shown&&shown.requests?((shown.errors+shown.rejected)/shown.requests*100):0;

  return <div className="app-shell">
    <a className="skip-link" href="#workspace">Skip to workbench</a>
    <aside className="sidebar">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();setMode('learn');}}><span className="brand-mark">a<span>↗</span></span><span>ArchArena<span className="brand-caption">THE SYSTEM DESIGN LAB</span></span></a>
      <div className="workspace-label">YOUR WORKSPACE <span>01</span></div>
      <nav aria-label="Workspace modes"><button className={mode==='learn'?'nav-item active':'nav-item'} onClick={()=>setMode('learn')}><span>▧</span> Learn <small>05</small></button><button className={mode==='practice'?'nav-item active':'nav-item'} onClick={()=>{setMode('practice');setScorecard(null);}}><span>⌁</span> Practice <small>01</small></button><button className={mode==='studio'?'nav-item active':'nav-item'} onClick={()=>setMode('studio')}><span>◇</span> Design Studio <small>Later</small></button></nav>
      <div className="sidebar-divider" />
      <div className="workspace-label">FOUNDATIONS <span>↘</span></div>
      <nav className="lesson-nav" aria-label="Lessons">{lessons.map((l,i)=><button key={l.id} className={`lesson-link ${lessonId===l.id&&mode==='learn'?'current':''}`} onClick={()=>{setMode('learn');chooseLesson(l.id);}}><span className={completed.includes(l.id)?'lesson-number complete':'lesson-number'}>{completed.includes(l.id)?'✓':`0${i+1}`}</span><span>{l.title}</span>{lessonId===l.id&&mode==='learn'&&<span className="current-dot" />}</button>)}</nav>
      <div className="sidebar-bottom"><div className="progress-label"><span>Foundation progress</span><strong>{completed.length}/5</strong></div><div className="progress-track"><span style={{width:`${completed.length/5*100}%`}} /></div><button className="saved-designs" onClick={async()=>{try{setDesigns(await api<Design[]>('/designs'));}catch(e){setError((e as Error).message);}}}>▤ Saved designs <span>↗</span></button><div className="owner"><span className="avatar">YS</span><div><strong>Your learning space</strong><small>Personal portfolio demo</small></div><span className="owner-dot" /></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>{mode==='learn'?'Learn':mode==='practice'?'Practice':'Design Studio'}</strong></div><div className="topbar-right"><span className="local-badge"><i /> LOCAL LAB</span><a href="https://github.com" target="_blank" rel="noreferrer" className="text-link">Build. Break. Understand.</a><span className="mini-avatar">YS</span></div></header>
      <main id="workspace">
        {mode==='studio'?<section className="studio-panel"><span className="eyebrow">THE NEXT CHAPTER</span><h1>From requirements<br/>to a coherent design.</h1><p>Design Studio is a planned milestone. The first release focuses on Learn and one Practice workflow.</p><div className="studio-steps">Requirements → Capacity → HLD → API → Data model → LLD</div><p>Future consistency checks will link contradictions to versioned artifacts. They are not implemented in this demo.</p><button className="primary" onClick={()=>setMode('learn')}>Back to the learning lab →</button></section>:<>
        <div className="page-heading"><div><span className="eyebrow">{mode==='learn'?`FOUNDATIONS / LESSON ${String(Math.max(0,lessons.findIndex(l=>l.id===lessonId))+1).padStart(2,'0')}`:'PRACTICE / SYSTEM DESIGN 01'}</span><h1>{mode==='learn'?lesson?.title||'Your system design lab':'Design a URL shortener'}<span className="heading-dot">.</span></h1><p>{mode==='learn'?lesson?.subtitle||'Predict. Experiment. Explain.':'100 million new URLs a day. Every architecture decision has a consequence.'}</p></div><div className="heading-tools"><span className={`engine-status ${online?'connected':''}`}><i />{online?'Engine connected':'Connecting to engine'}</span><button className="secondary" onClick={save} disabled={!online}>▤ Save design</button></div></div>
        {error&&<div className="banner error" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={()=>setError('')}>×</button></div>}
        {notice&&<div className="banner notice" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={()=>setNotice('')}>×</button></div>}
        {crossTab&&<button className="secondary" onClick={()=>{setCanvas(readDraft());setCrossTab(false);setSaved(null);}}>Load draft from other tab</button>}
        {mode==='practice'&&<section className="practice-intro"><div><span className="eyebrow">01 / CLARIFY THE PROBLEM</span><h2>Start with the right questions.</h2><label htmlFor="clarification">Ask about reads, peaks, retention or availability</label><div className="question-row"><input id="clarification" value={question} maxLength={1000} onChange={e=>setQuestion(e.target.value)} /><button className="secondary" onClick={ask} disabled={!online||!question.trim()}>Ask →</button></div>{answer&&<p className="scripted-answer">{answer}</p>}<small>Scripted problem facts · AI disabled · No solution is supplied</small></div><div><span className="eyebrow">02 / ESTIMATE CAPACITY</span><div className="capacity-inputs"><label>New URLs/day<input type="number" min="1" max="1000000000" value={daily} onChange={e=>setDaily(Math.max(1,Math.min(1e9,Number(e.target.value)||1)))} /></label><label>Reads per write<input type="number" min="0" max="100" value={ratio} onChange={e=>setRatio(Math.max(0,Math.min(100,Number(e.target.value)||0)))} /></label><label>Bytes per record<input type="number" min="1" max="100000" value={recordBytes} onChange={e=>setRecordBytes(Math.max(1,Math.min(100000,Number(e.target.value)||1)))} /></label></div><div className="capacity-results"><span><strong>{number(daily/86400,1)}</strong> create QPS</span><span><strong>{number(daily/86400*ratio,1)}</strong> read QPS</span><span><strong>{number(daily*recordBytes/1e9,2)} GB</strong> raw/day</span></div><small>QPS = daily volume ÷ 86,400. Storage excludes indexes, backups and replication. Virtual traffic below is separately bounded.</small></div></section>}
        <div className="lab-grid"><section className="canvas-panel" aria-label="Architecture workbench"><div className="panel-heading"><div><span className="panel-icon">◇</span><strong>Your architecture</strong><span className="pill">{canvas.nodes.length} nodes</span></div><div className="canvas-tools"><button aria-label="Undo architecture change" onClick={undo} disabled={!history.current.length}>↶</button><button aria-label="Redo architecture change" onClick={redo} disabled={!future.current.length}>↷</button><span className="tool-separator" /><button onClick={()=>commit(preset(lessonId))}>Reset ↺</button></div></div><div className="canvas-legend"><span><i className="legend-dot green" /> Healthy</span><span><i className="legend-dot amber" /> Near capacity</span><span><i className="legend-dot red" /> Saturated</span><span className="canvas-autosave">{crossTab?'Draft conflict':`Browser draft · ${revision} edits`}</span></div>
          <div className="flow-container"><ReactFlow nodes={visualNodes} edges={canvas.edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_,node)=>setSelected(node.id)} onPaneClick={()=>setSelected(null)} fitView minZoom={0.25} maxZoom={1.5} deleteKeyCode={['Backspace','Delete']} aria-label="Architecture canvas"><Background gap={22} size={1} color="#d8ddcf"/><Controls showInteractive={false}/></ReactFlow></div>
          <div className="canvas-footer"><span>Drag nodes to arrange · Connect handles to route requests</span><label className="add-component">+ Add component<select aria-label="Add architecture component" value="" onChange={e=>{if(e.target.value)addNode(e.target.value as NodeType);}}><option value="">Choose component</option>{Object.entries(names).filter(([k])=>k!=='CLIENT').map(([k,n])=><option key={k} value={k}>{n}</option>)}</select></label></div>
        </section>
        <aside className="experiment-panel"><div className="panel-heading"><strong><span className="panel-icon">⚗</span> Experiment controls</strong><span className="pill">LIVE</span></div><div className="experiment-content"><span className="eyebrow">CHANGE ONE THING. SEE WHAT HAPPENS.</span><label className="control-title" htmlFor="lesson-control">{lesson?.unit||'Service replicas'}<strong>{target?number(target.data.config[lesson?.control||'replicas']??1,2):'—'}</strong></label><input id="lesson-control" type="range" min={lesson?.min??1} max={lesson?.max??8} step={lesson?.step??1} value={target?.data.config[lesson?.control||'replicas']??1} disabled={!target} onChange={e=>target&&changeNode(target.id,lesson?.control||'replicas',Number(e.target.value))}/><div className="range-labels"><span>{lesson?.min??1}</span><span>{lesson?.max??8}</span></div>
          <label className="control-title" htmlFor="traffic">Virtual arrival rate<strong>{traffic} <small>req/s</small></strong></label><input id="traffic" type="range" min="5" max={profile==='spike'?120:200} step="5" value={traffic} onChange={e=>setTraffic(Number(e.target.value))}/><div className="range-labels"><span>5 req/s</span><span>{profile==='spike'?120:200} req/s</span></div>
          <div className="two-controls"><label>Traffic profile<select value={profile} onChange={e=>{setProfile(e.target.value);if(e.target.value==='spike')setTraffic(t=>Math.min(t,120));}}><option value="steady">Steady load</option><option value="spike">10× spike</option></select></label><label>Seed<input aria-label="Simulation seed" type="number" value={seed} min="0" max="999999" onChange={e=>setSeed(Math.max(0,Math.min(999999,Math.trunc(Number(e.target.value)||0))))}/></label></div><label className="field-label">Failure injection<select value={failure} onChange={e=>setFailure(e.target.value)}><option value="none">None — healthy dependencies</option><option value="service-kill">Reject service arrivals for 5s</option><option value="cache-flush">Flush cache hits for 5s</option></select></label>
          <button className="primary run-button" onClick={execute} disabled={!online||running||(mode==='learn'&&!prediction.trim())}>{running?<><span className="spinner"/> Running seeded model…</>:<>Run experiment <span>→</span></>}</button><div className="run-details"><span>30 virtual seconds</span><span>Server-side · Seed {seed}</span></div></div></aside></div>
        {selectedNode&&<section className="node-inspector"><div><strong>Configure {selectedNode.data.label}</strong><small>Delete a selected node with Backspace. Unsupported graph paths are rejected by the backend.</small></div><label>Label<input maxLength={80} value={selectedNode.data.label} onChange={e=>commit({...canvas,nodes:canvas.nodes.map(n=>n.id===selected?{...n,data:{...n.data,label:e.target.value}}:n)})}/></label>{(['replicas','concurrency','serviceMs','queueLimit'] as const).map(param=><label key={param}>{param}<input type="number" min={param==='queueLimit'?0:param==='serviceMs'?0.1:1} max={param==='queueLimit'?2000:param==='serviceMs'?1000:param==='replicas'?16:128} step={param==='serviceMs'?0.1:1} value={selectedNode.data.config[param]} onChange={e=>changeNode(selectedNode.id,param,Number(e.target.value))}/></label>)}</section>}
        <section className="prediction-panel"><div className="prediction-number">?</div><div><span className="eyebrow">{mode==='learn'?'PREDICT BEFORE YOU RUN':'03 / EXPLAIN YOUR DESIGN'}</span><label htmlFor="prediction">{mode==='learn'?lesson?.question:'What bottleneck do you expect, and what trade-off does your design make?'}</label><input id="prediction" placeholder="Write your prediction or reasoning…" maxLength={2000} value={prediction} onChange={e=>setPrediction(e.target.value)}/></div><span className="prediction-tag">Think like an engineer ↗</span></section>
        <div className="results-heading"><div><span className="eyebrow">OBSERVE THE CONSEQUENCES</span><h2>Every decision leaves a signal.</h2></div><span className={`result-mode ${isCurrent?'event':''}`}>{previewing?'Updating estimate…':isCurrent?'● Seeded experiment':result?'◌ Design changed · showing analytic preview':'◌ Analytic estimate'}</span></div>
        <section className="metrics-grid" aria-label="Simulation metrics"><Metric label="THROUGHPUT" value={shown?number(shown.throughputRps,1):'—'} unit="req/s" detail={isCurrent?`${number(shown?.successful||0)} successful requests`:'Steady-state arrival demand'} spark="↗"/><Metric label="P95 LATENCY" value={shown?number(shown.p95Ms,1):'—'} unit="ms" detail={isCurrent?'Successful requests only':'Rough approximation, not a quantile'} spark="⌁"/><Metric label="ERRORS + REJECTIONS" value={shown&&isCurrent?number(failed,1):'—'} unit="%" detail={isCurrent?`${shown?.errors} errors · ${shown?.rejected} policy rejections`:'Run the event model to measure'} spark="◴"/><Metric label="ILLUSTRATIVE COST" value={shown?`$${number(shown.roughCostPerHour,3)}`:'—'} unit="/hr" detail="Model weights · not an AWS quote" spark="↘"/></section>
        <div className="insights-grid"><section className="chart-panel"><div className="panel-heading"><strong>Throughput over virtual time</strong><span className="chart-key"><i/>Successful req/s</span></div>{result?.timeline.length?<><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={result.timeline} margin={{top:18,right:20,bottom:0,left:-15}}><defs><linearGradient id="throughput" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8aab44" stopOpacity={0.28}/><stop offset="100%" stopColor="#8aab44" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9ece3"/><XAxis dataKey="timeSeconds" tickLine={false} axisLine={false} tick={{fontSize:11}} unit="s"/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11}}/><Tooltip contentStyle={{borderRadius:10,border:'1px solid #dfe5d5'}}/><Area type="monotone" dataKey="throughputRps" name="Successful req/s" stroke="#769d35" fill="url(#throughput)" strokeWidth={2} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div><div className="chart-caption">Seed {result.seed} · {result.engineVersion} · {isCurrent?'Current design':'Previous design — rerun for current graph'} · Includes drain buckets</div></>:<div className="chart-empty"><span>⌁</span><strong>Your experiment starts here.</strong><p>Write a prediction, then run the seeded model<br/>to see the request time series.</p></div>}</section>
        <section className="findings-panel"><div className="panel-heading"><strong>What the model is telling you</strong><span className="pill">RULES</span></div><div className="findings-list">{shown?.findings.map((f,i)=><div className={`finding ${f.severity}`} key={i}><span>{f.severity==='critical'?'!':f.severity==='warning'?'↗':'✓'}</span><div><strong>{f.title}</strong><p>{f.detail}</p><small>Evidence: {f.metric}</small></div></div>)||<p className="muted">Connect the backend to inspect model findings.</p>}</div></section></div>
        <section className="explanation-panel"><div><span className="eyebrow">THE IDEA BEHIND THE EXPERIMENT</span><h2>{mode==='learn'?`Understand ${lesson?.title.toLowerCase()||'the trade-off'}`:'Defend your choices with evidence.'}</h2><p>{lesson?.explanation}</p>{mode==='learn'&&<p><strong>Checkpoint:</strong> {lesson?.challenge}</p>}</div><div className="experiment-actions"><button className="secondary" disabled={!isCurrent||!runId||running} onClick={mode==='learn'?checkpoint:grade}>{mode==='learn'?'Check my understanding →':'Review scorecard →'}</button><button className="text-button" disabled={!result} onClick={()=>{setBaseline(result);setNotice('Baseline captured. Change one thing and rerun with the same seed and profile.');}}>Pin result as baseline ↗</button>{baseline&&result&&<p>Baseline p95 {number(baseline.p95Ms,1)} ms → latest {number(result.p95Ms,1)} ms. {baseline.seed!==result.seed?'Seeds differ; use a matched seed for comparison.':''}</p>}{completedRunId&&result&&<a className="text-link" href={`/api/runs/${completedRunId}/export`} download>Export experiment as Markdown ↓</a>}</div></section>
        {scorecard&&<section className="scorecard"><h2>Evidence-backed scorecard</h2><p>AI is disabled. Unimplemented grading dimensions are explicitly unassessed.</p><div className="scorecard-grid">{scorecard.dimensions.map(d=><div key={d.name}><strong>{d.name}</strong><span>{d.score!==undefined?`${d.score}/100`:'Not assessed'}</span><small>{d.evidence}</small></div>)}</div></section>}
        <details className="assumptions"><summary>Model assumptions and limitations <span>This is a model, not a benchmark ↗</span></summary><ul>{(shown?.assumptions||['Start the backend and run a preview to load the modeling assumptions.']).map(a=><li key={a}>{a}</li>)}</ul></details>
        <footer className="page-footer"><span>ARCHARENA / EXPERIMENT WITH INTENT.</span><span>Java engine · React workbench · No cloud resources created</span></footer>
        </>}
      </main>
    </div>
    {designs&&<div className="modal-backdrop"><section className="design-modal" role="dialog" aria-modal="true" aria-labelledby="design-modal-title"><div className="panel-heading"><h2 id="design-modal-title">Saved designs</h2><button onClick={()=>setDesigns(null)} aria-label="Close saved designs">×</button></div>{designs.length?designs.map(d=><div className="saved-row" key={d.id}><button onClick={()=>{commit(canvasFromGraph(d.graph));setSaved(d);setDesigns(null);setNotice(`Loaded ${d.title}, version ${d.version}`);}}><strong>{d.title}</strong><small>Version {d.version} · {d.graph.nodes.length} nodes</small></button><button className="text-button" onClick={async()=>{try{await api(`/designs/${d.id}`,{method:'DELETE'});setDesigns(designs.filter(x=>x.id!==d.id));}catch(e){setError((e as Error).message);}}}>Delete</button></div>):<p>No saved designs yet. Save your first architecture from the workbench.</p>}<button className="secondary" onClick={()=>setDesigns(null)}>Return to workbench</button></section></div>}
  </div>;
}

function Metric({label,value,unit,detail,spark}:{label:string;value:string;unit:string;detail:string;spark:string}) {return <article className="metric"><div className="metric-label">{label}<span aria-hidden="true">{spark}</span></div><div className="metric-value">{value}<small>{unit}</small></div><p>{detail}</p></article>;}


