import json
from pathlib import Path

files = Path('graphify-out/.graphify_uncached.txt').read_text(encoding='utf-8').strip().split('\n')
files = [f for f in files if f.strip()]

chunk_size = 22
chunks = []
for i in range(0, len(files), chunk_size):
    chunks.append(files[i:i+chunk_size])

# Write chunk manifests
for idx, chunk in enumerate(chunks):
    chunk_path = Path('graphify-out/.graphify_chunk_files_{}.json'.format(idx+1))
    chunk_path.write_text(json.dumps(chunk, ensure_ascii=False), encoding='utf-8')

print('Created {} chunks from {} files'.format(len(chunks), len(files)))
for idx, chunk in enumerate(chunks):
    print('  Chunk {}: {} files'.format(idx+1, len(chunk)))
