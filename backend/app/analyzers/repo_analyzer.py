import os
import ast
from pathlib import Path
from collections import defaultdict

class RepoAnalyzer:
    IGNORE_DIRS = {'.git', '__pycache__', 'node_modules', 'venv', '.venv', 'env', 'dist', 'build', '.next'}
    IGNORE_FILES = {'.DS_Store', 'package-lock.json', 'yarn.lock', 'poetry.lock'}
    
    def __init__(self, repo_path):
        self.repo_path = Path(repo_path)
    
    def build_tree(self):
        tree = []
        for root, dirs, files in os.walk(self.repo_path):
            dirs[:] = [d for d in dirs if d not in self.IGNORE_DIRS]
            rel_root = os.path.relpath(root, self.repo_path)
            if rel_root == '.':
                rel_root = ''
            for file in files:
                if file in self.IGNORE_FILES:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, self.repo_path)
                tree.append({
                    'path': rel_path,
                    'name': file,
                    'type': 'file',
                    'size': os.path.getsize(full_path)
                })
        return tree
    
    def detect_languages(self):
        tree = self.build_tree()
        exts = defaultdict(int)
        for f in tree:
            ext = Path(f['name']).suffix.lower()
            if ext:
                exts[ext] += 1
        return dict(exts)
    
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
        except:
            return {'functions': [], 'classes': [], 'imports': []}
    
    def get_overview(self):
        tree = self.build_tree()
        languages = self.detect_languages()
        readme = None
        for f in tree:
            if f['name'].lower().startswith('readme'):
                try:
                    readme_path = self.repo_path / f['path']
                    with open(readme_path, 'r', encoding='utf-8', errors='ignore') as rf:
                        readme = rf.read()[:500]
                except:
                    pass
        return {
            'file_count': len([f for f in tree if f['type'] == 'file']),
            'languages': languages,
            'has_readme': readme is not None,
            'readme_preview': readme
        }
