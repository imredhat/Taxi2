import json
from pathlib import Path

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8'))
all_files = [f for cat in ('document', 'paper', 'image') for f in detect['files'].get(cat, [])]
Path('graphify-out/.graphify_chunk_01.json').write_text(json.dumps({'nodes':[],'edges':[],'hyperedges':[],'input_tokens':0,'output_tokens':0}), encoding='utf-8')
print(json.dumps(all_files))
