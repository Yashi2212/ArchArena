export type NodeType = 'CLIENT' | 'LOAD_BALANCER' | 'SERVICE' | 'CACHE' | 'DATABASE' | 'QUEUE' | 'RATE_LIMITER';
export interface GraphNode { id: string; type: NodeType; label: string; config: Record<string, number> }
export interface Graph { nodes: GraphNode[]; edges: { id: string; source: string; target: string }[] }
export interface Experiment { graph: Graph; arrivalRate: number; durationSeconds: number; seed: number; profile: string; failure: string }
export interface Lesson { id: string; title: string; subtitle: string; question: string; explanation: string; control: string; nodeType: NodeType; min: number; max: number; step: number; initial: number; unit: string; challenge: string }
export interface Finding { severity: string; title: string; detail: string; metric: string }
export interface Result { mode: string; seed: number; engineVersion: string; assumptionsVersion: string; requests: number; successful: number; errors: number; rejected: number; throughputRps: number; p50Ms: number; p95Ms: number; p99Ms: number; nodes: Record<string, { id: string; label: string; arrivalRate: number; utilization: number; meanLatencyMs: number; maxQueueDepth: number; visits: number; dropped: number }>; timeline: { timeSeconds: number; throughputRps: number; errorRate: number; queueDepth: number }[]; findings: Finding[]; assumptions: string[]; roughCostPerHour: number }
export interface Run { id: string; status: string; request: Experiment; result: Result | null; error: string | null }
export interface Design { id: string; title: string; version: number; graph: Graph }
export const symbols: Record<NodeType, string> = { CLIENT: '↗', LOAD_BALANCER: '⑂', SERVICE: '⌘', CACHE: 'ϟ', DATABASE: '▤', QUEUE: '≋', RATE_LIMITER: '◷' };
export const names: Record<NodeType, string> = { CLIENT: 'Client', LOAD_BALANCER: 'Load balancer', SERVICE: 'Java service', CACHE: 'Read cache', DATABASE: 'Database', QUEUE: 'Queue + workers', RATE_LIMITER: 'Rate limiter' };

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  if (!response.ok) {
    const problem = await response.json().catch(() => ({ detail: `Request failed (${response.status})` }));
    throw new Error(problem.detail || problem.title || `Request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : response.json();
}
export function stableRequest(request: Experiment): string {
  return JSON.stringify({ ...request, graph: {
    nodes: [...request.graph.nodes].sort((a,b) => a.id.localeCompare(b.id)).map(n => ({ id:n.id, type:n.type, label:n.label, config:Object.fromEntries(Object.entries(n.config || {}).sort(([a],[b]) => a.localeCompare(b))) })),
    edges: [...request.graph.edges].sort((a,b) => a.id.localeCompare(b.id)).map(e => ({id:e.id,source:e.source,target:e.target})),
  } });
}
