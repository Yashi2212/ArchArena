"""Read local book metadata and topic locations; never copy PDFs into the project."""
from pathlib import Path
import json
import re
import logging
from pypdf import PdfReader

logging.getLogger("pypdf").setLevel(logging.ERROR)
ROOT = Path(__file__).resolve().parents[1]
private_config = ROOT / '.local/source-paths.json'
if not private_config.is_file():
    raise SystemExit('Create ignored .local/source-paths.json mapping source IDs to your private PDF paths. Do not add source books to Git.')
SOURCES = {key:Path(value) for key,value in json.loads(private_config.read_text(encoding='utf-8')).items()}
inventory = []
for source_id, path in SOURCES.items():
    reader = PdfReader(str(path))
    locations = []
    def outline(items):
        for item in items:
            if isinstance(item, list):
                outline(item)
            else:
                title = str(item.get("/Title", ""))
                if re.search(r"replic|cache|caching|rate.limit|message.queu|load.balanc|backpressure", title, re.I):
                    try:
                        page = reader.get_destination_page_number(item) + 1
                    except Exception:
                        continue
                    locations.append({"heading": title, "pdfPage": page})
    outline(reader.outline)
    record = {"id": source_id, "path": str(path), "pages": len(reader.pages), "metadata": {str(k):str(v) for k,v in (reader.metadata or {}).items()}, "topicLocations": locations}
    inventory.append(record)
    print(json.dumps(record, ensure_ascii=False))
    print("FRONT MATTER", source_id)
    for index in range(min(5, len(reader.pages))):
        print("PDF PAGE", index+1, reader.pages[index].extract_text()[:1200].replace("\n", " "))
private = ROOT / '.local'
private.mkdir(exist_ok=True)
(private / 'book-inventory.json').write_text(json.dumps(inventory, indent=2, ensure_ascii=False), encoding='utf-8')
