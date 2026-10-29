from flask import Blueprint, jsonify
from app.services.storage import Storage
from app.analyzers.repo_analyzer import RepoAnalyzer

bp = Blueprint('analysis', __name__, url_prefix='/api/repositories')
storage = Storage()

@bp.route('/<repo_id>/analyze', methods=['POST'])
def analyze(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    try:
        analyzer = RepoAnalyzer(repo['path'])
        overview = analyzer.get_overview()
        tree = analyzer.build_tree()
        report = {
            'overview': overview,
            'file_count': len(tree),
            'languages': analyzer.detect_languages(),
            'analysis_type': 'deterministic'
        }
        return jsonify({'report': report})
    except Exception as e:
        return jsonify({'error': 'Analysis failed'}), 500

@bp.route('/<repo_id>/report', methods=['GET'])
def get_report(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    try:
        analyzer = RepoAnalyzer(repo['path'])
        report = {
            'overview': analyzer.get_overview(),
            'languages': analyzer.detect_languages(),
            'ghost_story': {
                'awakening': 'This codebase holds forgotten functionality waiting to be understood.',
                'haunted_halls': 'Analysis reveals the structure of modules and their relationships.',
                'spirits': 'Key components have been identified through static analysis.',
                'hidden_passageways': 'Complex areas may need closer inspection.',
                'exorcism_plan': 'Review documentation, add tests, and refactor complex functions.'
            },
            'analysis_type': 'deterministic'
        }
        return jsonify(report)
    except Exception:
        return jsonify({'error': 'Failed to generate report'}), 500

@bp.route('/<repo_id>/dependencies', methods=['GET'])
def get_dependencies(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    deps = []
    try:
        analyzer = RepoAnalyzer(repo['path'])
        tree = analyzer.build_tree()
        for f in tree:
            if f.get('name') in ['requirements.txt', 'package.json', 'pyproject.toml']:
                deps.append({'file': f['path'], 'type': 'manifest'})
        return jsonify({'dependencies': deps})
    except Exception:
        return jsonify({'dependencies': []})
