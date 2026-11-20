"""Offline checks for the handoff's source references, fixtures and recorded evidence."""
from pathlib import Path
import ast,hashlib,json,re
from demo_simulations import payloads

ROOT=Path(__file__).resolve().parents[1]

def main():
    guide=(ROOT/'docs/PROJECT-PLAYBOOK.md').read_text(encoding='utf-8')
    assert '{{' not in guide, 'Unresolved guide placeholder'
    refs=json.loads((ROOT/'docs/evidence/owner-guide-code-index.json').read_text(encoding='utf-8'))['references']
    for name,ref in refs.items():
        lines=(ROOT/ref['file']).read_text(encoding='utf-8').splitlines()
        assert 1<=ref['line']<=len(lines) and ref['find'] in lines[ref['line']-1],f'Stale code reference: {name}'
        assert f"../{ref['file']}#L{ref['line']}" in guide,f'Missing reference in guide: {name}'
    expected=payloads()
    evidence=json.loads((ROOT/'docs/evidence/owner-demo-results.json').read_text(encoding='utf-8'))
    assert evidence['allAssertionsPassed'] and evidence['distinctJobs']==4 and evidence['pairCount']==2
    for name,default in expected.items():
        fixture=json.loads((ROOT/f'docs/demos/{name}.json').read_text(encoding='utf-8'))
        assert fixture==default,f'Fixture differs from documented inputs: {name}'
        saved=evidence['runs'][name]
        digest=hashlib.sha256(json.dumps(fixture,sort_keys=True).encode()).hexdigest()
        assert digest==saved['inputSha256'],f'Evidence input mismatch: {name}'
        assert saved['requests']==saved['successful']+saved['errors']+saved['rejected']
        assert saved['idempotencyReusedJob'] and saved['changedPayloadReturned409']
        assert str(saved['successful']) in guide
    tasks=json.loads((ROOT/'.vscode/tasks.json').read_text(encoding='utf-8'))['tasks']
    assert len(tasks)==5
    for task in tasks:
        args=task.get('args',[])
        if '-File' in args:
            script=args[args.index('-File')+1].replace('${workspaceFolder}/','')
            assert (ROOT/script).is_file(),f'Missing VS Code task script: {script}'
    ast.parse((ROOT/'scripts/demo_simulations.py').read_text(encoding='utf-8'))
    print(f'PASS: {len(refs)} live source-line references, four fixture/evidence hashes, two paired cases, five VS Code tasks and runner syntax.')

if __name__=='__main__':
    main()
