import json
from graphify.detect import detect
from pathlib import Path

result = detect(Path('src'))
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result, indent=2))
print(f"Files: {result['total_files']}, Words: {result['total_words']}")
for k, v in result['files'].items():
    if v:
        print(f"  {k}: {len(v)} files")
