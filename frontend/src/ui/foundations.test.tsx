import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { AlertBanner, Button, MetricInstrument, ModelNotice, NodeLoad, RulesPanel, StatusBadge } from './foundations';
import { formatCost, formatLatency } from './format';

describe('foundation components',()=>{
  it('activates a named button with the keyboard and hides decorative icons',async()=>{
    const action=vi.fn();
    const user=userEvent.setup();
    render(<Button variant="primary" icon="save" onClick={action}>Save design</Button>);
    await user.tab();
    expect(screen.getByRole('button',{name:'Save design'})).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(action).toHaveBeenCalledOnce();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
  it('preserves disabled behavior',async()=>{
    const action=vi.fn();
    render(<Button disabled onClick={action}>Run experiment</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(action).not.toHaveBeenCalled();
  });
  it('makes the model disclosure explicit',()=>{
    render(<ModelNotice/>);
    expect(screen.getByRole('complementary',{name:'Model disclosure'})).toHaveTextContent('Modeled, not measured');
    expect(screen.getByText(/not a benchmark/)).toBeVisible();
  });
  it('retains exact latency as accessible text while displaying seconds',()=>{
    render(<MetricInstrument label="Modeled p95 latency" reading={formatLatency(12003.123,'event')}/>);
    expect(screen.getByRole('article',{name:'Modeled p95 latency'})).toHaveTextContent('12.0');
    expect(screen.getByText('12003.123 milliseconds. Modeled whole-run p95 · successful requests only')).toBeInTheDocument();
  });
  it('always qualifies cost and does not substitute zero for missing data',()=>{
    render(<MetricInstrument label="Illustrative cost" reading={formatCost(undefined)}/>);
    expect(screen.getByText('—')).toBeVisible();
    expect(screen.getByText(/not an AWS quote/)).toBeVisible();
  });
  it('uses saturation wording and an icon, not color alone',()=>{
    const {container}=render(<NodeLoad value={2.4} scope="analytic"/>);
    expect(screen.getByText('Demand is 2.4× capacity')).toBeVisible();
    expect(screen.getByText('Approximate estimate')).toBeVisible();
    expect(container.querySelector('[data-state="saturated"] svg')).not.toBeNull();
  });
  it('marks unavailable readings as unknown',()=>{
    render(<NodeLoad/>);
    expect(screen.getByText('Capacity estimate unavailable')).toBeVisible();
  });
  it('announces an error and provides a named dismiss control',async()=>{
    const dismiss=vi.fn();
    render(<AlertBanner tone="error" onDismiss={dismiss}>The engine could not be reached.</AlertBanner>);
    expect(screen.getByRole('alert')).toHaveTextContent('The engine could not be reached.');
    await userEvent.click(screen.getByRole('button',{name:'Dismiss error'}));
    expect(dismiss).toHaveBeenCalledOnce();
  });
  it('exposes notices as nonblocking live status',()=>{
    render(<AlertBanner tone="notice" onDismiss={()=>{}}>Experiment complete.</AlertBanner>);
    expect(screen.getByRole('status')).toHaveTextContent('Experiment complete.');
  });
  it('renders findings as plain text with exact evidence references',()=>{
    render(<RulesPanel scope="event" findings={[{severity:'critical',title:'Database queue',detail:'<script>unsafe()</script>',metric:'nodes.db.maxQueueDepth'}]}/>);
    expect(screen.getByText('Whole run')).toBeVisible();
    expect(screen.getByText('<script>unsafe()</script>')).toBeVisible();
    expect(screen.getByText('nodes.db.maxQueueDepth')).toBeVisible();
    expect(document.querySelector('script')).toBeNull();
  });
  it('distinguishes missing results from an empty findings list',()=>{
    const {rerender}=render(<RulesPanel findings={null} scope="analytic"/>);
    expect(screen.getByText(/No result yet/)).toBeVisible();
    rerender(<RulesPanel findings={[]} scope="event"/>);
    expect(screen.getByText(/does not prove/)).toBeVisible();
  });
  it('does not announce an empty finding set as healthy',()=>{
    const {container}=render(<RulesPanel findings={[]} scope="event"/>);
    expect(container.querySelector('[data-state="healthy"]')).toBeNull();
  });
  it('has no axe semantic violations in representative foundations',async()=>{
    const {container}=render(<main><h1>Foundation test</h1><ModelNotice/><StatusBadge state="strain">Near capacity</StatusBadge><h2>Modeled results</h2><MetricInstrument label="Modeled p95" reading={formatLatency(300,'event')}/><RulesPanel findings={[]} scope="event"/><Button>Run experiment</Button></main>);
    // jsdom has no visual layout. Contrast is tested against actual tokens, then again in the real browser.
    const result=await axe.run(container,{rules:{'color-contrast':{enabled:false}}});
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.length}))).toEqual([]);
  });
});
