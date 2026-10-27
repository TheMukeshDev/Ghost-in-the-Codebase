from flask import Blueprint, request, jsonify
import os
import uuid
import zipfile
import shutil
from pathlib import Path
from app.security.validator import SecurityValidator
from app.services.storage import Storage
from app.analyzers.repo_analyzer import RepoAnalyzer

bp = Blueprint('repositories', __name__, url_prefix='/api/repositories')
storage = Storage()

UPLOAD_DIR = './uploads'
os.makedirs(UPLOAD_DIR, exist_ok=True)

@bp.route('/import', methods=['POST'])
def import_repo():
    data = request.get_json(silent=True) or {}
    repo_path = data.get('path')
    
    if not repo_path or not os.path.exists(repo_path):
        return jsonify({'error': 'Invalid path'}), 400
    
    try:
        repo_id = str(uuid.uuid4())
        analyzer = RepoAnalyzer(repo_path)
        tree = analyzer.build_tree()
        overview = analyzer.get_overview()
        storage.add_repository(repo_id, os.path.basename(repo_path), repo_path, {
            'overview': overview,
            'file_count': len(tree)
        })
        return jsonify({
            'id': repo_id,
            'name': os.path.basename(repo_path),
            'tree': tree,
            'overview': overview
        })
    except Exception as e:
        return jsonify({'error': 'Import failed'}), 500

@bp.route('', methods=['GET'])
def list_repos():
    repos = storage.get_repositories()
    return jsonify({'repositories': repos})

@bp.route('/<repo_id>/tree', methods=['GET'])
def get_tree(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    try:
        analyzer = RepoAnalyzer(repo['path'])
        tree = analyzer.build_tree()
        return jsonify({'tree': tree})
    except:
        return jsonify({'error': 'Failed to read tree'}), 500

@bp.route('/<repo_id>/file', methods=['GET'])
def get_file(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    file_path = request.args.get('path')
    if not file_path:
        return jsonify({'error': 'Path required'}), 400
    try:
        full_path = SecurityValidator.validate_path(os.path.join(repo['path'], file_path), repo['path'])
        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        return jsonify({'path': file_path, 'content': content})
    except ValueError as e:
        return jsonify({'error': str(e)}), 403
    except:
        return jsonify({'error': 'Failed to read file'}), 500

@bp.route('/<repo_id>', methods=['DELETE'])
def delete_repo(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    storage.delete_repository(repo_id)
    return jsonify({'status': 'deleted'})


@bp.route('/upload', methods=['POST'])
def upload_repo():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if not file.filename.endswith('.zip'):
        return jsonify({'error': 'Only zip files allowed'}), 400
    try:
        repo_id = str(uuid.uuid4())
        zip_path = os.path.join(UPLOAD_DIR, f'{repo_id}.zip')
        file.save(zip_path)
        SecurityValidator.validate_zip(zip_path)
        extract_dir = os.path.join(UPLOAD_DIR, repo_id)
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(extract_dir)
        entries = os.listdir(extract_dir)
        repo_path = extract_dir
        if len(entries) == 1 and os.path.isdir(os.path.join(extract_dir, entries[0])):
            repo_path = os.path.join(extract_dir, entries[0])
        analyzer = RepoAnalyzer(repo_path)
        tree = analyzer.build_tree()
        overview = analyzer.get_overview()
        storage.add_repository(repo_id, os.path.basename(repo_path), repo_path, {'overview': overview, 'file_count': len(tree)})
        os.remove(zip_path)
        return jsonify({'id': repo_id, 'name': os.path.basename(repo_path), 'tree': tree, 'overview': overview})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except:
        return jsonify({'error': 'Upload failed'}), 500
