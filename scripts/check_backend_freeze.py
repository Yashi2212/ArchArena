"""Detect backend/API edits during the UI-only track; normalize text line endings."""
from pathlib import Path
import argparse
import hashlib
import json

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'docs/evidence/backend-freeze.json'


def snapshot():
    files=[p for p in (ROOT/'backend/src').rglob('*') if p.is_file()]
    files.extend(ROOT/'backend'/name for name in ('pom.xml','openapi.yaml','Dockerfile'))
    return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes().replace(b'\r\n',b'\n')).hexdigest() for p in sorted(files)}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--record',action='store_true')
    args=parser.parse_args()
    actual=snapshot()
    if args.record:
        if MANIFEST.exists():
            raise SystemExit('Refusing to replace an existing freeze. Review and explicitly authorize a backend change first.')
        MANIFEST.write_text(json.dumps({'scope':'UI track backend/API freeze; source text normalized to LF','files':actual},indent=2)+'\n',encoding='utf-8')
        print(f'Recorded {len(actual)} backend/API files before UI implementation.')
        return 0
    baseline=json.loads(MANIFEST.read_text(encoding='utf-8'))['files']
    differences=[name for name in sorted(set(baseline)|set(actual)) if baseline.get(name)!=actual.get(name)]
    for name in differences:
        print('CHANGED '+name)
    print(f'{len(actual)} backend/API files checked; {len(differences)} changes since freeze.')
    return 1 if differences else 0


if __name__=='__main__':
    raise SystemExit(main())
