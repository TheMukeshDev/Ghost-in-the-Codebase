import os
import ast
from pathlib import Path
from collections import defaultdict

class RepoAnalyzer:
    IGNORE_DIRS = {
        '.git', '__pycache__', 'node_modules', 'venv', '.venv', 'env',
        'dist', 'build', '.next', '__MACOSX', '.idea', '.vscode', 'coverage',
    }
    IGNORE_FILES = {'.DS_Store', 'package-lock.json', 'yarn.lock', 'poetry.lock'}
    MAX_TREE_ENTRIES = 20000

    def __init__(self, repo_path):
        self.repo_path = Path(repo_path)

    def build_tree(self):
        tree = []
        for root, dirs, files in os.walk(self.repo_path, onerror=lambda _error: None):
            dirs[:] = [d for d in dirs if d not in self.IGNORE_DIRS]
            for file in files:
                if file in self.IGNORE_FILES:
                    continue
                full_path = os.path.join(root, file)
                try:
                    rel_path = os.path.relpath(full_path, self.repo_path)
                    size = os.path.getsize(full_path)
                except (OSError, ValueError):
                    continue
                tree.append({
                    'path': rel_path,
                    'name': file,
                    'type': 'file',
                    'size': size,
                })
                if len(tree) >= self.MAX_TREE_ENTRIES:
                    return tree
        return tree

    def _detect_languages(self, tree):
        exts = defaultdict(int)
        for entry in tree:
            ext = Path(entry['name']).suffix.lower()
            if ext:
                exts[ext] += 1
        return dict(exts)

    def detect_languages(self):
        return self._detect_languages(self.build_tree())

    def analyze_python(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            tree = ast.parse(content)
            functions = []
            classes = []
            imports = []
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    functions.append({'name': node.name, 'lineno': node.lineno})
                elif isinstance(node, ast.ClassDef):
                    classes.append({'name': node.name, 'lineno': node.lineno})
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    imports.append(ast.unparse(node))
            return {'functions': functions, 'classes': classes, 'imports': imports}
        except Exception:
            return {'functions': [], 'classes': [], 'imports': []}

    def get_overview(self):
        tree = self.build_tree()
        languages = self._detect_languages(tree)
        readme = None
        for entry in tree:
            if entry['name'].lower().startswith('readme'):
                try:
                    readme_path = self.repo_path / entry['path']
                    with open(readme_path, 'r', encoding='utf-8', errors='ignore') as rf:
                        readme = rf.read()[:500]
                    break
                except Exception:
                    continue
        return {
            'file_count': len([entry for entry in tree if entry['type'] == 'file']),
            'languages': languages,
            'has_readme': readme is not None,
            'readme_preview': readme,
        }
