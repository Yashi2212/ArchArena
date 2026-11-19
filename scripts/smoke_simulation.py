"""Exercise the actual loopback API -> persisted job -> separate worker -> stored export."""
from pathlib import Path
from datetime import datetime,timezone
import json,time,urllib.request

ROOT=Path(__file__).resolve().parents[1]
BASE='http://127.0.0.1:8080'
def call(path,body=None,headers=None):
    data=None if body is None else json.dumps(body).encode()
    req=urllib.request.Request(BASE+path,data=data,headers={'Content-Type':'application/json',**(headers or {})})
    with urllib.request.urlopen(req,timeout=10) as response:
        content=response.read()
        return json.loads(content) if 'json' in response.headers.get('Content-Type','') else content.decode()
def main():
    health=call('/actuator/health');catalog=call('/api/catalog')
    assert health['status']=='UP' and catalog['engineVersion']=='2.0.0'
    stages=[('c','CLIENT',{}),('lb','LOAD_BALANCER',{}),('s','SERVICE',{'holdUpstream':1,'breakerThreshold':3,'breakerResetSeconds':1}),('cache','CACHE',{'hitRatio':0.5}),('q','QUEUE',{'serviceMs':5,'concurrency':2}),('db','DATABASE',{'serviceMs':5,'replicas':3,'readRatio':0.7,'replicationLagMs':500})]
    payload={'graph':{'nodes':[{'id':i,'type':t,'label':i,'config':cfg} for i,t,cfg in stages],'edges':[{'id':'e'+str(i),'source':stages[i-1][0],'target':stages[i][0]} for i in range(1,len(stages))]},'arrivalRate':40,'durationSeconds':10,'seed':42,'profile':'steady','failure':'dependency-outage','options':{'retries':2,'retryBackoffMs':100,'retryJitter':1,'attemptTimeoutMs':500,'deadlineMs':2000}}
    submitted=call('/api/runs',payload,{'Idempotency-Key':'engine-v2-smoke-20261119'})
    for _ in range(100):
        job=call('/api/runs/'+submitted['id'])
        if job['status'] in {'DONE','FAILED','TIMED_OUT'}:break
        time.sleep(0.5)
    assert job['status']=='DONE',f'Worker did not finish: {job["status"]}'
    r=job['result'];t=r['telemetry']
    assert r['engineVersion']=='2.0.0' and r['requests']==r['successful']+r['errors']+r['rejected']
    assert t['attempts']>=r['requests'] and t['retries']>0 and len(t['nodeTimeline'])>0 and len(t['traces'])<=1500
    assert job['request']['options']['retries']==2
    exported=call('/api/runs/'+job['id']+'/export');assert 'Resilience counters' in exported and '2.0.0' in exported
    report={'timestamp':datetime.now(timezone.utc).isoformat(),'scope':'Actual loopback HTTP, local H2 persisted queue and separate worker; not a fixture or production load test','runId':job['id'],'status':job['status'],'engineVersion':r['engineVersion'],'requests':r['requests'],'successful':r['successful'],'errors':r['errors'],'policyRejections':r['rejected'],'attempts':t['attempts'],'retries':t['retries'],'timeouts':t['timeouts'],'circuitRejections':t['circuitRejections'],'staleReads':t['staleReads'],'nodeSamples':len(t['nodeTimeline']),'traceEvents':len(t['traces']),'exportIncludesResilienceCounters':True}
    (ROOT/'docs/evidence/engine-v2-live-smoke.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,indent=2))
if __name__=='__main__':main()
