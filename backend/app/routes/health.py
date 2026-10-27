from flask import Blueprint, jsonify
import os

bp = Blueprint('health', __name__, url_prefix='/api')

@bp.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'service': 'ghost-in-the-codebase',
        'version': '1.0.0'
    })

@bp.route('/ai/status')
def ai_status():
    ollama_url = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
    model = os.environ.get('OLLAMA_MODEL', 'qwen2.5:3b')
    return jsonify({
        'ollama_url': ollama_url,
        'model': model,
        'local': True
    })
