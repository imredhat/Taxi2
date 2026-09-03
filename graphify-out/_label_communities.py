import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from pathlib import Path

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
detection = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-16'))
analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

G = build_from_json(extraction, root='.', directed=False)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

# Community labels based on analysis
labels = {
    0: "FullCalendar Library",
    1: "Chart.js Library",
    2: "FullCalendar Core",
    3: "ApexCharts Library",
    4: "FullCalendar Date Utils",
    5: "Chart.js Elements",
    6: "Pignose Calendar",
    7: "Chart.js Box Elements",
    8: "Chart.js Lifecycle",
    9: "FullCalendar Plugins",
    10: "jQuery DataTables",
    11: "FullCalendar Jalali",
    12: "FullCalendar Scroller",
    13: "Shepherd.js Tour",
    14: "Chart.js Bar Utils",
    15: "Scroll Effects",
    16: "Bootstrap Bundle",
    17: "Shepherd.js Core",
    18: "SimpleBar Scrollbar",
    19: "Bootstrap Core",
    24: "Reference Algorithms",
    26: "Admin Car Brands",
    31: "jQuery Core",
    33: "Admin Vehicles",
    46: "Admin Car Models",
    47: "Skill Creator Scripts",
    54: "Pricing Controller",
    59: "Driver Controller",
    60: "Driver Documents",
    67: "React Native App",
    68: "Axelit Admin Template",
    69: "Admin Users",
    70: "Web Index Page",
    72: "HTTP Handler",
    77: "Server Entry Point",
    78: "Driver Create Form",
    83: "Driver Profiles Create",
    87: "Driver Profiles List",
    89: "Debugging Tools",
    90: "Pooyesh Taxi Brand",
    91: "Design System Scripts",
    92: "Passenger Dashboard",
    94: "Mobile Login Screen",
    95: "Coding Philosophy",
    96: "Admin Rides",
    99: "App Entry Point",
    100: "UI/UX Design System",
    102: "Jalali Date Picker",
}

# Regenerate questions with real community labels
questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding='utf-8')
print('Report updated with community labels')
