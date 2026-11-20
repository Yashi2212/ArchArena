"""Two real local API/SQL-queue/worker demos. Uses only Python's standard library.

Run from the ArchArena folder after scripts/dev.ps1:
    python scripts/demo_simulations.py
Fixtures match the UI's 30-second labs. No AWS or external API is contacted.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / 'docs' / 'demos'


def payloads() -> dict[str, dict]:
    def node(index: int, kind: str, label: str, **changes) -> dict:
        default_ms = {'DATABASE': 35, 'SERVICE': 20, 'CACHE': 2}.get(kind, .5)
        config = dict(replicas=1, serviceMs=default_ms,
                      concurrency=4 if kind == 'SERVICE' else 1,
                      hitRatio=0, readRatio=.9, rate=25, burst=10, queueLimit=200)
        config.update(changes)
        return dict(id=f'n{index}', type=kind, label=label, config=config)

    def request(nodes: list[dict]) -> dict:
        return dict(graph=dict(nodes=nodes, edges=[dict(id=f'e{i}', source=nodes[i]['id'], target=nodes[i+1]['id']) for i in range(len(nodes)-1)]),
                    arrivalRate=40, durationSeconds=30, seed=42, profile='steady', failure='none',
                    options=dict(retries=0, retryBackoffMs=100, retryJitter=1, attemptTimeoutMs=2000, deadlineMs=2000))

    service = request([node(0, 'CLIENT', 'Client'), node(1, 'LOAD_BALANCER', 'Load balancer'),
                       node(2, 'SERVICE', 'Java service', serviceMs=60, concurrency=1),
                       node(3, 'DATABASE', 'Database', serviceMs=5)])
    scaled = copy.deepcopy(service)
    scaled['graph']['nodes'][2]['config']['replicas'] = 4
    cache = request([node(0, 'CLIENT', 'Client'), node(1, 'LOAD_BALANCER', 'Load balancer'),
                     node(2, 'SERVICE', 'Java service'), node(3, 'CACHE', 'Read cache'),
                     node(4, 'DATABASE', 'Database', serviceMs=50)])
    cached = copy.deepcopy(cache)
    cached['graph']['nodes'][3]['config']['hitRatio'] = .9
    return {'01-service-before': service, '01-service-after': scaled,
            '02-cache-before': cache, '02-cache-after': cached}


class Client:
    def __init__(self, base: str):
        parsed = urllib.parse.urlparse(base)
        if parsed.scheme != 'http' or parsed.hostname not in {'127.0.0.1', 'localhost', '::1'}:
            raise ValueError('This educational runner accepts a loopback HTTP API only.')
        self.base = base.rstrip('/')

    def call(self, path: str, body=None, headers=None):
        data = None if body is None else json.dumps(body).encode('utf-8')
        req = urllib.request.Request(self.base+path, data=data,
            headers={'Content-Type': 'application/json', **(headers or {})})
        with urllib.request.urlopen(req, timeout=10) as response:
            result = response.read()
            return json.loads(result) if 'json' in response.headers.get('Content-Type', '') else result.decode('utf-8')

    def submit(self, body: dict, key: str):
        deadline = time.monotonic()+180
        while True:
            try:
                return self.call('/api/runs', body, {'Idempotency-Key': key})
            except urllib.error.HTTPError as error:
                message = error.read().decode('utf-8', errors='replace')
                if error.code != 429 or time.monotonic()+61 > deadline:
                    raise RuntimeError(f'API rejected the demo (HTTP {error.code}): {message}') from error
                print('Demo quota reached (2 new runs/minute). Waiting 61 seconds, not bypassing it.', flush=True)
                # Chunked waits keep the command responsive to Ctrl+C.
                for _ in range(61):
                    time.sleep(1)

    def complete(self, job_id: str):
        deadline = time.monotonic()+75
        while time.monotonic() < deadline:
            job = self.call('/api/runs/'+job_id)
            if job['status'] == 'DONE':
                return job
            if job['status'] in {'FAILED', 'TIMED_OUT'}:
                raise RuntimeError(f"Run {job_id}: {job['status']} / {job.get('error')}")
            time.sleep(.75)
        raise RuntimeError(f'Run {job_id} stayed pending: check the separate worker log, not only API health.')


def verify_result(result: dict):
    assert result['mode'] == 'discrete-event' and result['engineVersion'] == '2.0.0'
    assert result['requests'] == result['successful']+result['errors']+result['rejected']
    assert 0 <= result['p50Ms'] <= result['p95Ms'] <= result['p99Ms'] <= 2000.000001
    assert result['telemetry']['nodeTimeline'] and len(result['telemetry']['traces']) <= 1500
    assert result['telemetry']['processedEvents'] <= 200000


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', default='http://127.0.0.1:8080')
    parser.add_argument('--write-fixtures', action='store_true', help='Write the four request JSON files without submitting jobs.')
    args = parser.parse_args()
    examples = payloads()
    if args.write_fixtures:
        FIXTURES.mkdir(parents=True, exist_ok=True)
        for name, body in examples.items():
            (FIXTURES/(name+'.json')).write_bytes((json.dumps(body, indent=2)+'\n').encode())
        print('Four demo request fixtures written to docs/demos. No jobs submitted.')
        return
    # The handoff's JSON files are the executable inputs, so inspecting/editing
    # them in VS Code corresponds to what this runner submits.
    if all((FIXTURES/(name+'.json')).is_file() for name in examples):
        examples = {name: json.loads((FIXTURES/(name+'.json')).read_text(encoding='utf-8')) for name in examples}
    client = Client(args.base)
    assert client.call('/actuator/health')['status'] == 'UP'
    assert client.call('/api/catalog')['engineVersion'] == '2.0.0'
    batch = uuid.uuid4().hex[:16]
    output = ROOT/'.local'/'owner-demo'/batch
    output.mkdir(parents=True, exist_ok=True)
    summaries = {}
    for name, body in examples.items():
        print('Running '+name+' ...', flush=True)
        preview = client.call('/api/preview', body)
        key = f'owner-demo-{batch}-{name}'
        submitted = client.submit(body, key)
        job = client.complete(submitted['id'])
        result = job['result']
        verify_result(result)
        # A duplicate HTTP submission reuses one saved job; this is not a second engine execution.
        duplicate = client.call('/api/runs', body, {'Idempotency-Key': key})
        assert duplicate['id'] == job['id']
        changed = copy.deepcopy(body); changed['arrivalRate'] += 5
        try:
            client.call('/api/runs', changed, {'Idempotency-Key': key})
            raise AssertionError('Changed payload incorrectly accepted under an existing idempotency key.')
        except urllib.error.HTTPError as error:
            assert error.code == 409
        export = client.call('/api/runs/'+job['id']+'/export')
        assert 'Resilience counters' in export and 'Educational model' in export
        (output/(name+'-run.json')).write_bytes((json.dumps(job, indent=2)+'\n').encode())
        (output/(name+'-preview.json')).write_bytes((json.dumps(preview, indent=2)+'\n').encode())
        (output/(name+'-export.md')).write_bytes(export.encode())
        relevant = 'n2' if name.startswith('01') else 'n4'
        summaries[name] = dict(runId=job['id'], requests=result['requests'], successful=result['successful'],
            errors=result['errors'], rejected=result['rejected'], successPercent=round(100*result['successful']/result['requests'], 2),
            throughputRps=round(result['throughputRps'], 3), p95Ms=round(result['p95Ms'], 3),
            observedNode=relevant, nodeVisits=result['nodes'][relevant]['visits'],
            maxQueue=result['nodes'][relevant]['maxQueueDepth'],
            idempotencyReusedJob=True, changedPayloadReturned409=True,
            inputSha256=hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest())
        print(json.dumps(summaries[name]), flush=True)
    for before, after in [('01-service-before','01-service-after'), ('02-cache-before','02-cache-after')]:
        b, a = summaries[before], summaries[after]
        assert a['requests'] == b['requests'], 'Paired workloads must have the same generated arrivals.'
        assert a['successful'] > b['successful'] and a['errors'] < b['errors']
        assert a['p95Ms'] < b['p95Ms']
    assert summaries['01-service-after']['maxQueue'] < summaries['01-service-before']['maxQueue']
    assert summaries['02-cache-after']['nodeVisits'] < summaries['02-cache-before']['nodeVisits']*.5
    report=dict(verifiedAt=datetime.now(timezone.utc).isoformat(), source='Actual loopback HTTP → H2 persisted queue → separate Java worker',
        notice='Modeled values, not production benchmarks. Exact values apply to these inputs, seed and engine version.',
        engineVersion='2.0.0', seed=42, pairCount=2, distinctJobs=4, allAssertionsPassed=True,
        privateRawEvidence=str(output.relative_to(ROOT)), runs=summaries)
    destination=ROOT/'docs/evidence/owner-demo-results.json'
    destination.write_bytes((json.dumps(report, indent=2)+'\n').encode())
    print('\nPASS: both before/after experiments, request accounting, saved exports and idempotency behavior.', flush=True)
    print('Summary: '+str(destination), flush=True)
    print('Raw local evidence: '+str(output), flush=True)


if __name__ == '__main__':
    main()
