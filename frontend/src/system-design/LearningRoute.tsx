import { useState } from 'react';
import { topics, type Track } from './catalog';
export function LearningRoute({onLab,track,onTrack}:{onLab:(id:string)=>void;track:Track;onTrack:(track:Track)=>void}) {
  const [topicId,setTopicId]=useState(()=>topics.find(t=>t.track===track)!.id);
  const [level,setLevel]=useState('All');
  const topic=topics.find(t=>t.id===topicId&&t.track===track)??topics.find(t=>t.track===track)!;
  const visible=topics.filter(t=>t.track===track&&(level==='All'||t.level===level));
  function switchTrack(next:Track){onTrack(next);setLevel('All');setTopicId(topics.find(t=>t.track===next)!.id);}
  return <details className="learning-route" open><summary>System design learning path · HLD + LLD</summary>
    <p className="route-intro">Start with foundations, work through distributed-system decisions, then defend a complete design. 40 original exercise briefs; 5 existing simulation labs. This is a curriculum scaffold, not a completed textbook or mastery certification.</p>
    <div className="design-switch" role="group" aria-label="Learning design track"><button aria-pressed={track==='hld'} onClick={()=>switchTrack('hld')}>HLD · System map</button><button aria-pressed={track==='lld'} onClick={()=>switchTrack('lld')}>LLD · Java blueprint</button></div>
    <div className={`route-layout route-${track}`}>
      <div className="route-index"><label>Topic level<select value={level} onChange={e=>{setLevel(e.target.value);setTopicId(topics.find(t=>t.track===track&&(e.target.value==='All'||t.level===e.target.value))!.id);}}>{['All','Foundation','Intermediate','Advanced'].map(l=><option key={l}>{l}</option>)}</select></label><nav aria-label={`${track.toUpperCase()} curriculum`}>{visible.map((t,i)=><button key={t.id} aria-current={topicId===t.id?'true':undefined} onClick={()=>setTopicId(t.id)}><span>{String(i+1).padStart(2,'0')}</span>{t.title}<small>{t.level}</small></button>)}</nav></div>
      <article className="topic-brief"><span className="eyebrow">{track.toUpperCase()} / {topic.level} / Exercise brief</span><h2>{topic.title}</h2>
        {track==='hld'?<div className="system-lanes" aria-label="HLD thinking sequence"><span>Requirements</span><b>→</b><span>Services + data</span><b>→</b><span>Failures + trade-offs</span></div>:<pre className="java-blueprint" aria-label="LLD responsibility blueprint">{`// Responsibility sketch — not executable code\nController → Application service\n                 ↓\n          Domain invariant\n                 ↓\n          Repository port\n\nVerify: behavior + errors + concurrency`}</pre>}
        <h3>Your mission</h3><p>{topic.task}</p><h3>Explain and challenge</h3><p>{topic.questions}</p><h3>Checkpoint deliverable</h3><p>{track==='hld'?'Produce a system map, a capacity assumption and one alternative you rejected.':'Produce Java signatures, a request sequence and one test that could expose an invariant violation.'} Review the reasoning rather than counting components.</p>
        {topic.lab?<button className="secondary" onClick={()=>onLab(topic.lab!)}>Open simulation lab →</button>:<p className="content-status">Guided theory lesson pending knowledge review. This topic currently provides an exercise brief, not a verified explanation or dedicated simulation.</p>}
        <p className="content-status">Book-derived notes remain unpublished until owner verification. No book passages, diagrams or chapter sequence are included here.</p>
      </article>
    </div>
  </details>;
}
