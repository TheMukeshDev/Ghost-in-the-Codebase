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

UPLOAD_DIR = os.environ.get('UPLOAD_DIR', './uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@bp.route('', methods=['GET'])
def list_repos():
    try:
        return jsonify({'repositories': storage.get_repositories()})
    except Exception:
        return jsonify({'error': 'Could not list repositories'}), 500

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
    except Exception:
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
    except Exception:
        return jsonify({'error': 'Failed to read file'}), 500

@bp.route('/<repo_id>', methods=['DELETE'])
def delete_repo(repo_id):
    repos = storage.get_repositories()
    repo = next((r for r in repos if r['id'] == repo_id), None)
    if not repo:
        return jsonify({'error': 'Not found'}), 404
    try:
        repo_path = repo.get('path')
        storage.delete_repository(repo_id)
        if repo_path:
            resolved = Path(repo_path).resolve()
            uploads = Path(UPLOAD_DIR).resolve()
            try:
                resolved.relative_to(uploads)
                if resolved != uploads:
                    target = resolved.parent if resolved.parent != uploads else resolved
                    shutil.rmtree(target, ignore_errors=True)
            except ValueError:
                pass
        return jsonify({'status': 'deleted'})
    except Exception:
        return jsonify({'error': 'Could not delete repository'}), 500


@bp.route('/upload', methods=['POST'])
def upload_repo():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    filename = (file.filename or '').lower()
    if not filename.endswith('.zip'):
        return jsonify({'error': 'Only zip files allowed'}), 400

    repo_id = str(uuid.uuid4())
    zip_path = os.path.join(UPLOAD_DIR, f'{repo_id}.zip')
    extract_dir = os.path.join(UPLOAD_DIR, repo_id)

    try:
        file.save(zip_path)
        SecurityValidator.validate_zip(zip_path)
        os.makedirs(extract_dir, exist_ok=True)

        with zipfile.ZipFile(zip_path, 'r') as zf:
            for member in zf.infolist():
                target = SecurityValidator.validate_path(
                    os.path.join(extract_dir, member.filename), extract_dir
                )
                if member.is_dir():
                    os.makedirs(target, exist_ok=True)
                    continue
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with zf.open(member) as source, open(target, 'wb') as destination:
                    shutil.copyfileobj(source, destination)

        entries = os.listdir(extract_dir)
        repo_path = extract_dir
        if len(entries) == 1 and os.path.isdir(os.path.join(extract_dir, entries[0])):
            repo_path = os.path.join(extract_dir, entries[0])

        analyzer = RepoAnalyzer(repo_path)
        tree = analyzer.build_tree()
        overview = analyzer.get_overview()
        storage.add_repository(
            repo_id,
            os.path.basename(repo_path),
            repo_path,
            {'overview': overview, 'file_count': len(tree)},
        )
        return jsonify({
            'id': repo_id,
            'name': os.path.basename(repo_path),
            'tree': tree,
            'overview': overview,
        })
    except ValueError as e:
        shutil.rmtree(extract_dir, ignore_errors=True)
        return jsonify({'error': str(e)}), 400
    except Exception:
        shutil.rmtree(extract_dir, ignore_errors=True)
        return jsonify({'error': 'Upload failed'}), 500
    finally:
        try:
            if os.path.exists(zip_path):
                os.remove(zip_path)
        except OSError:
            pass
