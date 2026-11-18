"""Check session entry points, local documentation links and generated claim lines."""
from pathlib import Path
import json
import os
import re

ROOT=Path(__file__).resolve().parents[1]
REQUIRED=('AGENTS.md','prompt.md','docs/STATUS.md','ISSUES.md','howtorun.md','hld.md','lld.md',
          'interviewquestions.md','problemstatement.md','docs/ui/repo-audit.md','docs/ui/design-brief.md',
          'docs/knowledge/README.md','docs/knowledge/sources.md','docs/knowledge/content-policy.md')


def main():
    errors=[]
    links=0
    for name in REQUIRED:
        path=ROOT/name
        if not path.exists() or not path.read_text(encoding='utf-8').strip():
            errors.append('Missing/empty required file: '+name)
    status=(ROOT/'docs/STATUS.md').read_text(encoding='utf-8')
    if len(status.splitlines())>40:
        errors.append('STATUS must stay short: more than 40 lines')
    for directory,subdirs,files in os.walk(ROOT):
        subdirs[:]=[name for name in subdirs if name not in {'.git','.local','.tools','node_modules','target','dist'}]
        for name in files:
            if not name.endswith('.md'):
                continue
            path=Path(directory)/name
            text=path.read_text(encoding='utf-8')
            for target in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)',text):
                if re.match(r'https?://|mailto:|#',target):
                    continue
                local=target.split('#',1)[0].strip('<>')
                links+=1
                if local and not (path.parent/local).exists():
                    errors.append('Broken link: '+str(path.relative_to(ROOT))+' -> '+target)
    index=json.loads((ROOT/'docs/knowledge/claim-index.json').read_text(encoding='utf-8'))
    claims=0
    for concept,item in index.items():
        lines=(ROOT/item['file']).read_text(encoding='utf-8').splitlines()
        for claim in item['claims']:
            claims+=1
            if claim['line']>len(lines) or f'[{claim["id"]}]' not in lines[claim['line']-1]:
                errors.append('Stale claim-line reference: '+concept+' '+claim['id'])
    for error in errors:
        print('FAIL '+error)
    print(f'{len(REQUIRED)} entry documents, {links} local links, {claims} claim-line references checked; {len(errors)} issues.')
    return 1 if errors else 0


if __name__=='__main__':
    raise SystemExit(main())
