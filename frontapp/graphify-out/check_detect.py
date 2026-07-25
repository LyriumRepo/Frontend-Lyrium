import json
from pathlib import Path
d = json.loads(Path('graphify-out/.graphify_detect.json').read_text())
print(f"Total files: {d['total_files']}")
print(f"Total words: {d['total_words']}")
for k, v in d['files'].items():
    if v:
        print(f"  {k}: {len(v)} files")
# Show top subdirectories
from collections import Counter
dirs = Counter()
for files in d['files'].values():
    for f in files:
        parts = Path(f).parts
        if len(parts) > 1:
            dirs[parts[0]] += 1
print("\nTop subdirectories:")
for d_name, count in dirs.most_common(10):
    print(f"  {d_name}: {count} files")
