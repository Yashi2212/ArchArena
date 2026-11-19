import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { formatUtilization, type MetricReading, type SignalState } from './format';
import type { Finding } from '../types';

export function Button({ variant = 'secondary', icon, children, className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; icon?: IconName }) {
  return <button type={type} className={`ui-button ui-button--${variant} ${className}`} {...props}>{icon && <Icon name={icon} />}{children}</button>;
}

const signalIcons: Record<SignalState, IconName> = { healthy:'check', strain:'warning', saturated:'error', unknown:'info' };
export function StatusBadge({ state, children }: { state: SignalState; children: ReactNode }) {
  return <span className={`status-badge signal-${state}`} data-state={state}><Icon name={signalIcons[state]} /><span>{children}</span></span>;
}

export function NodeLoad({ value, scope = 'analytic' }: { value?: number; scope?: 'analytic' | 'event' }) {
  const status = formatUtilization(value);
  const text=scope==='event'&&value!==undefined&&Number.isFinite(value)?`Average slot occupancy: ${(value*100).toFixed(1)}%`:status.text;
  return <div className="node-load"><StatusBadge state={status.state}>{text}</StatusBadge><span className="node-scope">{scope === 'event' ? 'Whole-run model' : 'Approximate estimate'}</span></div>;
}

export function ModelNotice() {
  return <aside className="model-notice" aria-label="Model disclosure"><Icon name="info" /><div><strong>Modeled, not measured</strong><span>Educational simulation. Results are not a benchmark of real infrastructure.</span></div></aside>;
}

export function MetricInstrument({ label, reading, icon = 'activity', detail }: { label: string; reading: MetricReading; icon?: IconName; detail?: string }) {
  const id = useId();
  return <article className="metric instrument" aria-labelledby={id}>
    <div className="metric-label"><h3 id={id}>{label}</h3><Icon name={icon} /></div>
    <div className="metric-value" title={reading.exact}><span aria-hidden="true">{reading.display}<small>{reading.unit}</small></span><span className="sr-only">{reading.exact}</span></div>
    <p className="metric-qualifier">{reading.qualifier}</p>{detail && <p>{detail}</p>}
  </article>;
}

export function AlertBanner({ tone, children, onDismiss }: { tone: 'error' | 'notice'; children: ReactNode; onDismiss: () => void }) {
  return <div className={`banner ${tone}`} role={tone === 'error' ? 'alert' : 'status'}><Icon name={tone === 'error' ? 'error' : 'info'} /><div>{children}</div><Button variant="ghost" onClick={onDismiss} aria-label={`Dismiss ${tone}`} icon="close" /></div>;
}

export function RulesPanel({ findings, scope }: { findings: Finding[] | null; scope: 'analytic' | 'event' }) {
  const id = useId();
  return <section className="findings-panel" aria-labelledby={id}>
    <div className="panel-heading"><h2 id={id}>Model findings</h2><span className="pill">{scope === 'event' ? 'Whole run' : 'Approximate'}</span></div>
    <div className="findings-list">{findings === null ? <p className="muted">No result yet. Connect the engine and run a preview.</p> : findings.length === 0 ? <p className="muted">No findings returned. This does not prove the design has no bottlenecks.</p> : findings.map((finding, index) => {
      const state: SignalState = finding.severity === 'critical' ? 'saturated' : finding.severity === 'warning' ? 'strain' : 'unknown';
      return <article className={`finding signal-${state}`} key={`${finding.metric}-${index}`}><Icon name={signalIcons[state]} /><div><h3>{finding.title}</h3><p>{finding.detail}</p><p className="finding-evidence">Evidence: <code>{finding.metric}</code></p></div></article>;
    })}</div>
  </section>;
}
