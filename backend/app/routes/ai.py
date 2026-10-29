from flask import Blueprint, request, jsonify
from app.services.storage import Storage
from app.services.ai_service import AIService
from app.analyzers.repo_analyzer import RepoAnalyzer
from app.security.validator import SecurityValidator
import os

bp = Blueprint('ai', __name__, url_prefix='/api/repositories')
storage = Storage()
ai_service = AIService()

@bp.route('/<repo_id>/ask', methods=['POST'])
def ask(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    
    data = request.get_json(silent=True) or {}
    question = data.get('question', '')
    if not question:
        return jsonify({'error': 'Question required'}), 400
    
    try:
        analyzer = RepoAnalyzer(repo['path'])
        tree = analyzer.build_tree()
        # Gather some context
        context_parts = []
        readme_files = [f for f in tree if f.get('name', '').lower().startswith('readme')]
        for rf in readme_files[:1]:
            try:
                full_path = SecurityValidator.validate_path(os.path.join(repo['path'], rf['path']), repo['path'])
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    context_parts.append(f"README ({rf['path']}):\n{f.read()[:1000]}")
            except Exception:
                pass
        # Add some Python files
        py_files = [f for f in tree if f.get('name', '').endswith('.py')][:3]
        for pf in py_files:
            try:
                full_path = SecurityValidator.validate_path(os.path.join(repo['path'], pf['path']), repo['path'])
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if len(content) > 800:
                        content = content[:800] + '\n...'
                    context_parts.append(f"File {pf['path']}:\n{content}")
            except Exception:
                pass
        
        context = '\n\n'.join(context_parts)
        result = ai_service.ask(question, context)
        return jsonify(result)
    except Exception as e:
        return jsonify({'answer': 'Error processing question', 'source': 'error'}), 500
