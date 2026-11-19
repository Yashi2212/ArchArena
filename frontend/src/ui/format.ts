export type EstimateScope = 'analytic' | 'event';
export type SignalState = 'healthy' | 'strain' | 'saturated' | 'unknown';
export interface MetricReading {
  display: string;
  unit: string;
  exact: string;
  qualifier: string;
}

function valid(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
const decimal = (value: number, digits = 1) => value.toLocaleString('en-US', { maximumFractionDigits: digits });

export function formatLatency(value: number | null | undefined, scope: EstimateScope): MetricReading {
  const qualifier = scope === 'analytic' ? 'Approximate analytic estimate · not a measured quantile' : 'Modeled whole-run p95 · successful requests only';
  if (!valid(value)) return { display: '—', unit: '', exact: 'Latency is not available', qualifier };
  return {
    display: value >= 1000 ? (value / 1000).toFixed(1) : decimal(value),
    unit: value >= 1000 ? 's' : 'ms',
    exact: `${value} milliseconds. ${qualifier}`,
    qualifier,
  };
}

export function formatUtilization(value: number | null | undefined): { text: string; state: SignalState } {
  if (!valid(value)) return { text: 'Capacity estimate unavailable', state: 'unknown' };
  return {
    text: `Demand is ${decimal(value, 2)}× capacity`,
    state: value >= 1 ? 'saturated' : value >= 0.8 ? 'strain' : 'healthy',
  };
}

export function formatCost(value: number | null | undefined): MetricReading {
  const qualifier = 'Illustrative model weights · not an AWS quote';
  return valid(value)
    ? { display: `$${value.toFixed(3)}`, unit: '/h', exact: `${value} illustrative dollars per hour. ${qualifier}`, qualifier }
    : { display: '—', unit: '', exact: 'Illustrative cost is unavailable', qualifier };
}

export function formatThroughput(value: number | null | undefined, scope: EstimateScope): MetricReading {
  const qualifier = scope === 'analytic' ? 'Modeled arrival demand · not completed work' : 'Modeled successful requests per virtual second';
  return valid(value)
    ? { display: decimal(value), unit: 'req/s', exact: `${value} requests per second. ${qualifier}`, qualifier }
    : { display: '—', unit: '', exact: 'Throughput is not available', qualifier };
}
