"""Local security evidence inventory. --public fails closed on unresolved deployment controls."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
def read(name):return (ROOT/name).read_text(encoding='utf-8-sig')
def main():
    checks=[]
    def check(name,condition):checks.append({'check':name,'passed':bool(condition)})
    reports=list((ROOT/'backend/target/surefire-reports').glob('TEST-*.xml'))
    passed=set()
    for path in reports:
        suite=ET.parse(path).getroot()
        for test in suite.findall('testcase'):
            if test.find('failure') is None and test.find('error') is None and test.find('skipped') is None:passed.add(test.attrib['name'])
    required=['sqlPayloadRemainsDataAndDoesNotEscapeOwnerScope','repositoryScopesRunsAndDesignsToOwner','blocksDnsRebindingAndCrossSiteMutations','apiQuotaIsBoundedAndHasRetryAfter','formUploadsAndServerSideUrlParametersAreRejected','nullOriginAndWeakRemoteSecretAreRejected']
    for name in required:check('JUnit evidence: '+name,name in passed)
    front='\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'frontend/src').rglob('*') if p.suffix in {'.ts','.tsx'} and '.test.' not in p.name)
    check('No raw HTML injection sink in application React source','dangerouslySetInnerHTML' not in front and 'innerHTML =' not in front)
    check('No auth token written to localStorage',not re.search(r'localStorage\.setItem\([\'\"][^\'\"]*(?:token|jwt|auth)',front,re.I))
    check('Production source maps disabled','sourcemap: false' in read('frontend/vite.config.ts') and not list((ROOT/'frontend/dist').rglob('*.map')))
    check('Multipart processing disabled','multipart:\n      enabled: false' in read('backend/src/main/resources/application.yml'))
    worker=read('backend/src/main/java/dev/archarena/worker/SimulationWorker.java')
    check('Worker logs omit raw exception messages/stack arguments','errorType={}' in worker and 'job.id(),exception);' not in worker)
    # Pattern scan is deliberately narrow. It is not proof of absence of all secrets.
    paths=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines()
    matches=[]
    pattern=re.compile(r'AKIA[A-Z0-9]{16}|gh[pousr]_[A-Za-z0-9]{36,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')
    for name in paths:
        path=ROOT/name
        if path.suffix.lower() not in {'.java','.ts','.tsx','.py','.yml','.yaml','.json','.md','.xml','.ps1'} or path==Path(__file__):continue
        if path.is_file() and pattern.search(path.read_text(encoding='utf-8-sig',errors='replace')):matches.append(name)
    check('No high-confidence credential patterns in tracked/unignored text',not matches)
    npm=json.loads(read('docs/evidence/engine-v2-npm-audit.json'))
    java=json.loads(read('docs/evidence/engine-v2-java-audit.json'))
    check('Frontend advisory snapshot has zero findings',npm.get('metadata',{}).get('vulnerabilities',{}).get('total')==0)
    parent=ET.parse(ROOT/'backend/pom.xml').getroot().find('{http://maven.apache.org/POM/4.0.0}parent/{http://maven.apache.org/POM/4.0.0}version').text
    check('Java audit matches current Boot release',any(p['name']=='org.springframework.boot:spring-boot' and p['version']==parent for p in java.get('packages',[])))
    check('Java runtime advisory scan complete and clear',java.get('complete') is True and not java.get('findings'))
    controls=[
      (1,'SQL injection','tested-local','Parameterized JDBC; hostile title/owner tests. Public database-role review remains separate.'),
      (2,'Cross-site scripting','tested-local','React text rendering, raw-HTML-sink check and existing hostile finding component test; proxy CSP configured, deployed CSP unverified.'),
      (3,'CSRF','partial','Origin/fetch-metadata/JSON-only mutation tests pass for local bearer/no-cookie model. Reassess with public sessions and synchronizer tokens.'),
      (4,'Insecure file uploads','not-applicable','No upload feature; multipart disabled and upload/form requests rejected.'),
      (5,'IDOR and object authorization','partial','Repository owner isolation tested. Current HTTP API has one configured owner; public identity-to-owner mapping is not implemented.'),
      (6,'Rate limiting','tested-local','240 API requests/minute global filter, preview quota and DB-backed job admission quotas. Public distributed/IP/user quotas not validated.'),
      (7,'Insecure JWT secrets','not-applicable','No JWT issuer/parser. Shared bearer access is a separate local control; non-loopback keys require at least 32 characters.'),
      (8,'Exposed API secrets','tested-local','No credential patterns found by narrow source scan; no frontend auth secrets. Public secret-store/rotation review remains open.'),
      (9,'Weak password hashing','not-applicable','No password login or password database. Use a reviewed identity provider if accounts are added.'),
      (10,'Missing MFA','open','No account/admin identity provider yet. Require MFA for hosting/AWS/admin accounts before launch; not inferable from repository code.'),
      (11,'Permissive CORS','tested-local','Exact local origins; hostile/null origins rejected. No wildcard credentialed CORS. Public origin must be configured/tested separately.'),
      (12,'Auth tokens in local storage','tested-local','Storage holds graph/run-id/worksheet drafts only; no auth-token writes detected. Drafts must not contain sensitive data.'),
      (13,'Client-only permissions','partial','Backend validates graph bounds and repository ownership. Public request principal mapping still missing.'),
      (14,'Missing row-level security','open','PostgreSQL RLS and least-privilege runtime roles are not implemented/verified; H2 tests do not prove them.'),
      (15,'Unverified webhook signatures','not-applicable','No webhook endpoints or inbound provider integrations.'),
      (16,'SSRF','tested-local','External API nodes are numeric synthetic models, not HTTP clients. URL parameter/metadata-address payload rejected.'),
      (17,'Exposed source maps','tested-local','Vite source maps disabled; dist inspected for map files. Public server hidden-file/source exposure still needs a deployment scan.'),
      (18,'Default credentials','partial','Blank H2 development credentials are loopback-only. Public mode must require PostgreSQL, distinct roles and injected random credentials; not deployed.'),
      (19,'Sensitive logs','tested-local','Worker failure logs contain run id/type, not raw exception payload. No body/token logging configured; public log pipeline unverified.'),
      (20,'Vulnerable dependencies','partial','npm and resolved Maven runtime advisory snapshots checked. Build-plugin/container/OS scans and deployed inventory remain outstanding.'),
    ]
    output={'timestamp':datetime.now(timezone.utc).isoformat(),'automatedChecks':checks,'credentialPatternPaths':matches,'controls':[{'id':i,'name':n,'status':s,'evidenceAndLimits':e} for i,n,s,e in controls],
      'publicReady':False,'publicBlockers':['No public principal/session to owner mapping','No public CSRF/session model','PostgreSQL roles/RLS unverified','Admin/account MFA unverified','Deployment TLS, secrets, container/OS and dynamic scans pending'],
      'scope':'Source hygiene and named local JUnit evidence, not penetration-test or compliance certification','pomSha256':hashlib.sha256((ROOT/'backend/pom.xml').read_bytes()).hexdigest()}
    (ROOT/'docs/evidence/security-checks.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
    for item in checks:print(('PASS ' if item['passed'] else 'FAIL ')+item['check'])
    print('20 controls inventoried; public readiness: BLOCKED. See docs/security-review.md.')
    return 1 if '--public' in sys.argv or any(not c['passed'] for c in checks) else 0
if __name__=='__main__':sys.exit(main())
