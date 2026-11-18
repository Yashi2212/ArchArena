"""Structural/provenance gate for original notes. Not a copyright-clearance tool."""
from pathlib import Path
from datetime import date
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]
CONCEPTS = ("load-balancing", "caching", "replication", "queues", "rate-limiting")
SOURCES = {"SDI1", "DDIA1", "DDIA2-ER"}
HEADINGS = (
    "What it is plain", "Why it exists", "How it works", "Rules of thumb and numbers",
    "Trade-offs", "Failure modes", "Misconceptions", "Interview questions",
    "How ArchArena models it", "Sources", "Verified by me",
)


def parse(text):
    parts = text.split("---", 2)
    if len(parts) != 3 or parts[0].strip():
        raise ValueError("Expected a front-matter block")
    meta = {}
    for line in parts[1].splitlines():
        if line.strip():
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta


def list_value(value):
    if not value.startswith("[") or not value.endswith("]"):
        raise ValueError("Expected a bracketed list")
    return [item.strip() for item in value[1:-1].split(",") if item.strip()]


def engine_parameters():
    source = (ROOT / 'backend/src/main/java/dev/archarena/engine/GraphValidator.java').read_text(encoding='utf-8')
    match = re.search(r'CONFIG\s*=\s*Set\.of\(([^;]+)\)', source)
    if not match:
        raise ValueError("Engine parameter allowlist could not be inspected")
    return set(re.findall(r'"([A-Za-z]+)"', match.group(1)))


def validate_note(text, expected_id, parameters, publish=False):
    errors = []
    try:
        meta = parse(text)
        if meta.get('id') != expected_id:
            errors.append('Concept ID does not match its file')
        if meta.get('status') not in {'draft', 'reviewed', 'published'}:
            errors.append('Unknown note status')
        if meta.get('verified') not in {'yes', 'no'}:
            errors.append('Verification must explicitly be yes or no')
        if not set(list_value(meta.get('sources', ''))) or not set(list_value(meta['sources'])).issubset(SOURCES):
            errors.append('Missing or unknown source ID')
        if not set(list_value(meta.get('model_parameters', ''))).issubset(parameters):
            errors.append('A model parameter is absent from the current engine allowlist')
        if meta.get('verified') == 'yes':
            if meta.get('verified_by', '') in {'', 'pending'}:
                errors.append('Verified notes need a named owner reviewer')
            try:
                date.fromisoformat(meta.get('verified_date', ''))
            except ValueError:
                errors.append('Verified notes need an ISO review date')
        if meta.get('status') == 'published' and meta.get('verified') != 'yes':
            errors.append('Published note is not owner verified')
        if publish and (meta.get('verified') != 'yes' or meta.get('status') not in {'reviewed', 'published'}):
            errors.append('Publication blocked: owner verification/review is missing')
    except (ValueError, KeyError) as error:
        errors.append('Invalid front matter: ' + str(error))
    for heading in HEADINGS:
        if f'## {heading}\n' not in text:
            errors.append('Missing section: ' + heading)
    claims = []
    for number, line in enumerate(text.splitlines(), 1):
        match = re.match(r'- \[([A-Z]{2}-\d+)\] (.+)', line)
        if match:
            if 'Source:' not in line or 'PDF page' not in line:
                errors.append('Claim needs a source and inspected PDF page: ' + match[1])
            claims.append({'id':match[1], 'line':number, 'sourceReference':line.split('Source:',1)[-1].strip()})
    if not claims:
        errors.append('At least one explicit factual claim reference is required')
    if len({claim['id'] for claim in claims}) != len(claims):
        errors.append('Duplicate claim IDs')
    if re.search(r'^\s*>', text, re.MULTILINE):
        errors.append('Book quotation blocks are not allowed in this draft pack')
    return errors, claims


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--publish', action='store_true')
    parser.add_argument('--write-index', action='store_true')
    args = parser.parse_args()
    errors = []
    index = {}
    parameters = engine_parameters()
    for concept in CONCEPTS:
        path = ROOT / f'docs/knowledge/{concept}.md'
        if not path.is_file():
            errors.append(f'{concept}: missing file')
            continue
        failures, claims = validate_note(path.read_text(encoding='utf-8'), concept, parameters, args.publish)
        errors.extend(f'{concept}: {failure}' for failure in failures)
        index[concept] = {'file':path.relative_to(ROOT).as_posix(), 'claims':claims}
    for directory in (ROOT/'frontend/public', ROOT/'frontend/dist'):
        if directory.exists() and any(directory.rglob('*.pdf')):
            errors.append('PDF asset found in public/build directory; review rights before distribution')
    if args.write_index and not errors:
        (ROOT/'docs/knowledge/claim-index.json').write_text(json.dumps(index, indent=2)+'\n',encoding='utf-8')
    for error in errors:
        print('BLOCKED ' + error)
    print(f'{len(CONCEPTS)} notes checked; {sum(len(item["claims"]) for item in index.values())} claim references; {len(errors)} issues.')
    print('Owner review is still required. These checks do not prove factual accuracy, originality or legal clearance.')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
