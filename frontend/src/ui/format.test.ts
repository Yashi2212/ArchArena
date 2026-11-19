import { describe, expect, it } from 'vitest';
import { formatCost, formatLatency, formatThroughput, formatUtilization } from './format';

describe('model metric wording', () => {
  it('humanizes seconds without losing the exact value', () => {
    const reading = formatLatency(12003.123456, 'event');
    expect(reading.display).toBe('12.0');
    expect(reading.unit).toBe('s');
    expect(reading.exact).toContain('12003.123456 milliseconds');
    expect(reading.qualifier).toContain('whole-run');
  });
  it('keeps short durations in milliseconds', () => {
    expect(formatLatency(234.56, 'event')).toMatchObject({ display:'234.6', unit:'ms' });
  });
  it('calls an analytic p95 approximate rather than measured', () => {
    expect(formatLatency(2500, 'analytic').qualifier).toBe('Approximate analytic estimate · not a measured quantile');
  });
  it.each([null, undefined, NaN, Infinity, -1])('does not turn missing or invalid latency %s into zero', value => {
    expect(formatLatency(value, 'event').display).toBe('—');
  });
  it('accepts a genuine zero result', () => {
    expect(formatLatency(0, 'event').display).toBe('0');
    expect(formatCost(0).display).toBe('$0.000');
  });
  it('expresses saturation as demand relative to capacity', () => {
    expect(formatUtilization(2.4)).toEqual({ text:'Demand is 2.4× capacity', state:'saturated' });
  });
  it.each([[0.79,'healthy'], [0.8,'strain'], [0.999,'strain'], [1,'saturated']] as const)('classifies %s at exact state boundaries', (value,state) => {
    expect(formatUtilization(value).state).toBe(state);
  });
  it('marks missing utilization unknown, not healthy', () => {
    expect(formatUtilization(undefined).state).toBe('unknown');
  });
  it('never describes illustrative cost as a quote', () => {
    expect(formatCost(0.060123).display).toBe('$0.060');
    expect(formatCost(0.060123).exact).toContain('0.060123');
    expect(formatCost(0.060123).qualifier).toContain('not an AWS quote');
  });
  it('separates arrival demand from successful throughput', () => {
    expect(formatThroughput(40, 'analytic').qualifier).toContain('not completed work');
    expect(formatThroughput(20, 'event').qualifier).toContain('successful requests');
  });
});
