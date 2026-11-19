import { describe,it,expect,vi } from 'vitest';
import { render,screen,fireEvent,act } from '@testing-library/react';
import { SimulationReplay } from './SimulationReplay';
import { SimulationSettings } from './SimulationSettings';
import { stableRequest, type Result } from '../types';
const result={timeline:[{timeSeconds:1,throughputRps:1,errorRate:0,queueDepth:2},{timeSeconds:2,throughputRps:2,errorRate:0,queueDepth:0}],nodes:{s:{label:'Java worker'}},telemetry:{attempts:12,retries:2,timeouts:1,circuitRejections:0,staleReads:0,processedEvents:80,peakPendingEvents:20,nodeTimeline:[{timeSeconds:1,nodeId:'s',busy:1,capacity:2,queueDepth:2,replicas:1,completed:3,failures:0,circuitOpen:false},{timeSeconds:2,nodeId:'s',busy:0,capacity:4,queueDepth:0,replicas:2,completed:8,failures:1,circuitOpen:true}],traces:[{requestId:1,attempt:0,timeSeconds:1.5,nodeId:'s',event:'service-start'}]}} as unknown as Result;
describe('bounded simulation presentation',()=>{
  it('shows only actual selected-time node snapshots and marks old results',()=>{
    render(<SimulationReplay result={result} current={false}/>);
    expect(screen.getByText(/Previous experiment/)).toBeInTheDocument();expect(screen.getByText('1 / 2')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Virtual time'),{target:{value:'1'}});
    expect(screen.getByText('0 / 4')).toBeInTheDocument();expect(screen.getByText('Open / probe')).toBeInTheDocument();expect(screen.getByText('2.0 virtual seconds')).toBeInTheDocument();
  });
  it('plays returned sample steps and cleans up at the end',()=>{
    vi.useFakeTimers();try{render(<SimulationReplay result={result} current/>);fireEvent.click(screen.getByRole('button',{name:'Play replay'}));act(()=>vi.advanceTimersByTime(2100));expect(screen.getByText('2.0 virtual seconds')).toBeInTheDocument();expect(screen.getByRole('button',{name:'Play replay'})).toBeInTheDocument();}finally{vi.useRealTimers();}
  });
  it('does not invent telemetry for legacy results',()=>{render(<SimulationReplay result={{...result,telemetry:null}} current/>);expect(screen.queryByRole('region')).not.toBeInTheDocument();});
  it('keeps attempt timeout inside the overall deadline',()=>{
    const change=vi.fn();render(<SimulationSettings options={{retries:0,retryBackoffMs:100,retryJitter:1,attemptTimeoutMs:2000,deadlineMs:2000}} onChange={change}/>);
    fireEvent.change(screen.getByLabelText('Overall deadline (ms)'),{target:{value:'500'}});expect(change).toHaveBeenCalledWith(expect.objectContaining({deadlineMs:500,attemptTimeoutMs:500}));
  });
  it('canonicalizes option order so returned runs stay current',()=>{
    const base={graph:{nodes:[],edges:[]},arrivalRate:1,durationSeconds:5,seed:1,profile:'steady',failure:'none'};
    expect(stableRequest({...base,options:{retries:1,retryJitter:0.5}})).toBe(stableRequest({...base,options:{retryJitter:0.5,retries:1}}));
  });
});
