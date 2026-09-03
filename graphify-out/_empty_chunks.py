import json
from pathlib import Path

empty = {"nodes": [], "edges": [], "hyperedges": [], "input_tokens": 0, "output_tokens": 0}

for i in range(5, 32):
    chunk_path = Path('graphify-out/.graphify_chunk_{:02d}.json'.format(i))
    if not chunk_path.exists():
        chunk_path.write_text(json.dumps(empty, ensure_ascii=False), encoding='utf-8')

print('Wrote empty results for chunks 5-31')
