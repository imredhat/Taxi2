import json
from pathlib import Path

ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text(encoding='utf-8'))
sem = json.loads(Path('graphify-out/.graphify_semantic.json').read_text(encoding='utf-8'))

# Merge: AST nodes first, semantic nodes deduplicated by id
seen = {n.get('id', '') for n in ast['nodes'] if isinstance(n, dict)}
merged_nodes = list(ast['nodes'])
for n in sem['nodes']:
    if isinstance(n, dict) and n.get('id', '') not in seen:
        merged_nodes.append(n)
        seen.add(n.get('id', ''))

merged_edges = ast['edges'] + sem['edges']
merged_hyperedges = sem.get('hyperedges', [])
merged = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': sem.get('input_tokens', 0),
    'output_tokens': sem.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(
    json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')
total = len(merged_nodes)
edges = len(merged_edges)
ast_count = len(ast['nodes'])
sem_count = len(sem['nodes'])
print('Merged: {} nodes, {} edges ({} AST + {} semantic)'.format(total, edges, ast_count, sem_count))
