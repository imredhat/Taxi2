import json
from pathlib import Path

# Write empty cached file (no cache hits)
Path('graphify-out/.graphify_cached.json').write_text(
    json.dumps({'nodes': [], 'edges': [], 'hyperedges': []}), encoding='utf-8')

# Load new extraction
new_path = Path('graphify-out/.graphify_semantic_new.json')
new = json.loads(new_path.read_text(encoding='utf-8')) if new_path.exists() else {'nodes': [], 'edges': [], 'hyperedges': []}

# Load cached (empty)
cached_path = Path('graphify-out/.graphify_cached.json')
cached = json.loads(cached_path.read_text(encoding='utf-8')) if cached_path.exists() else {'nodes': [], 'edges': [], 'hyperedges': []}

# Merge and deduplicate
all_nodes = cached['nodes'] + new.get('nodes', [])
all_edges = cached['edges'] + new.get('edges', [])
all_hyperedges = cached.get('hyperedges', []) + new.get('hyperedges', [])
seen = set()
deduped = []
for n in all_nodes:
    nid = n.get('id', '') if isinstance(n, dict) else ''
    if nid and nid not in seen:
        seen.add(nid)
        deduped.append(n)

merged = {
    'nodes': deduped,
    'edges': all_edges,
    'hyperedges': all_hyperedges,
    'input_tokens': new.get('input_tokens', 0),
    'output_tokens': new.get('output_tokens', 0),
}
Path('graphify-out/.graphify_semantic.json').write_text(
    json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')
print('Extraction complete - {} nodes, {} edges ({} from cache, {} new)'.format(
    len(deduped), len(all_edges), len(cached['nodes']), len(new.get('nodes', []))))
