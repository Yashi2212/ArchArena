import { describe,it,expect,beforeEach } from 'vitest';
import { render,screen,fireEvent } from '@testing-library/react';
import { topics,scenarios } from './catalog';
import { readings,sources } from './knowledge';
import { companyReadings } from './companyKnowledge';
import { DesignStudio,readStudio } from './DesignStudio';
describe('reference library integrity',()=>{
 it('provides original reading layers and valid references for every curriculum topic',()=>{
  expect(Object.keys(readings).sort()).toEqual(topics.map(t=>t.id).sort());
  for(const t of topics){const r=readings[t.id];expect(r.simple.length).toBeGreaterThan(100);expect(r.pro.length).toBeGreaterThan(40);expect(r.flow.length).toBeGreaterThan(2);expect(r.ownerVerified).toBe(false);for(const id of r.sources)expect(sources[id].url).toMatch(/^https:\/\//);}
 });
 it('gives each company a distinct proposed flow, ownership model and failure analysis',()=>{
  expect(Object.keys(companyReadings).sort()).toEqual(scenarios.map(s=>s.id).sort());
  for(const s of scenarios){const r=companyReadings[s.id];expect(r.model.length).toBeGreaterThan(80);expect(r.failure.length).toBeGreaterThan(80);expect(r.path.length).toBeGreaterThan(2);for(const id of r.topics)expect(topics.some(t=>t.id===id)).toBe(true);}
 });
});
describe('Studio safe local persistence',()=>{
 beforeEach(()=>localStorage.clear());
 it('recovers from invalid storage and bounds persisted values',()=>{
  localStorage.setItem('archarena-studio-v1','{');expect(readStudio().artifacts.hld).toBe('');
  localStorage.setItem('archarena-studio-v1',JSON.stringify({version:1,artifacts:{hld:'x'.repeat(15000)},daily:-3,peak:5000,graph:{nodes:[{label:{bad:1}}],edges:[]}}));
  const draft=readStudio();expect(draft.artifacts.hld).toHaveLength(12000);expect(draft.daily).toBe(1);expect(draft.peak).toBe(1000);expect(draft.graph).toBeNull();
  localStorage.setItem('archarena-studio-v1',JSON.stringify({version:1,graph:{nodes:[{id:'n1',label:'Service'}],edges:[{id:'e1',source:{bad:1},target:'n1'}]}}));expect(readStudio().graph).toBeNull();
 });
 it('renders hostile artifact text as text, never HTML',()=>{
  localStorage.setItem('archarena-studio-v1',JSON.stringify({version:1,artifacts:{requirements:'<img src=x onerror=alert(1)>'}}));
  const {container}=render(<DesignStudio graph={{nodes:[],edges:[]}} onPlayground={()=>{}}/>);
  expect(screen.getByLabelText('Requirements decisions')).toHaveValue('<img src=x onerror=alert(1)>');expect(container.querySelector('img')).toBeNull();
  fireEvent.click(screen.getByText('Review artifact coverage'));expect(screen.getAllByText(/human review needed/)).toHaveLength(1);
 });
});
