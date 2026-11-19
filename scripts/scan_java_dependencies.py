"""Query public OSV advisories for the resolved Maven runtime inventory. No API key."""
from pathlib import Path
from datetime import datetime, timezone
import concurrent.futures
import json
import re
import urllib.request
import sys

ROOT=Path(__file__).resolve().parents[1]
def request(path,body=None):
    data=None if body is None else json.dumps(body).encode()
    req=urllib.request.Request('https://api.osv.dev/v1/'+path,data=data,headers={'Content-Type':'application/json','User-Agent':'ArchArena-dependency-review/1'})
    with urllib.request.urlopen(req,timeout=45) as response:
        return json.load(response)

def main():
    packages=[]
    for line in (ROOT/'.local/runtime-dependencies.txt').read_text(encoding='utf-8-sig').splitlines():
        match=re.match(r'\s+([^\s:]+):([^:]+):jar:([^:]+):(compile|runtime)\b',line)
        if match:packages.append({'name':match[1]+':'+match[2],'version':match[3]})
    if not packages:raise RuntimeError('No Maven runtime artifacts found; resolve dependency:list first')
    results=[[] for _ in packages]
    pending=[(i,{'package':{'name':p['name'],'ecosystem':'Maven'},'version':p['version']}) for i,p in enumerate(packages)]
    for page in range(10):
        response=request('querybatch',{'queries':[q for _,q in pending]})
        if len(response.get('results',[]))!=len(pending):raise RuntimeError('Incomplete advisory response')
        follow=[]
        for (index,query),result in zip(pending,response['results']):
            results[index].extend(v['id'] for v in result.get('vulns',[]))
            if result.get('next_page_token'):follow.append((index,{**query,'page_token':result['next_page_token']}))
        pending=follow
        if not pending:break
    if pending:raise RuntimeError('Advisory pagination bound exceeded; scan is incomplete')
    ids=sorted({v for group in results for v in group})
    def detail(v):
        if not re.fullmatch(r'[A-Za-z0-9_-]+',v):raise RuntimeError('Invalid advisory id')
        record=request('vulns/'+v)
        return v,record
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:details=dict(pool.map(detail,ids))
    findings=[]
    for package,advisories in zip(packages,results):
        for advisory in sorted(set(advisories)):
            record=details[advisory]
            if record.get('withdrawn'):continue
            fixed=sorted({e['fixed'] for a in record.get('affected',[]) if a.get('package',{}).get('name')==package['name'] for r in a.get('ranges',[]) for e in r.get('events',[]) if 'fixed' in e})
            findings.append({**package,'advisory':advisory,'summary':record.get('summary',''),'severity':record.get('database_specific',{}).get('severity','unknown'),'fixed':fixed,'url':'https://osv.dev/vulnerability/'+advisory})
    output={'timestamp':datetime.now(timezone.utc).isoformat(),'source':'OSV API querybatch + advisory details','complete':True,'scope':'Resolved Maven runtime artifacts only; excludes build plugins, containers and application logic','packages':packages,'findings':findings}
    (ROOT/'docs/evidence/engine-v2-java-audit.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
    print(f'{len(packages)} Maven runtime artifacts; {len(findings)} package/advisory matches; {len(set(f["advisory"] for f in findings))} distinct advisories.')
    for f in findings[:25]:print(f'{f["name"]}@{f["version"]}: {f["advisory"]} ({f["severity"]}); fixed versions {f["fixed"]}')
    return 1 if findings else 0

if __name__=='__main__':
    try:sys.exit(main())
    except Exception as error:
        print('SCAN INCOMPLETE: '+str(error),file=sys.stderr);sys.exit(2)
