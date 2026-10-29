import json
import os
import sqlite3
from contextlib import closing
from datetime import datetime

class Storage:
    def __init__(self, db_path=None):
        self.db_path = db_path or os.environ.get('DATABASE_PATH', 'ghost.db')
        db_dir = os.path.dirname(os.path.abspath(self.db_path))
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
        self.init_db()

    def _connect(self):
        connection = sqlite3.connect(self.db_path, timeout=10)
        connection.row_factory = sqlite3.Row
        return connection

    def init_db(self):
        with closing(self._connect()) as connection:
            cursor = connection.cursor()
            cursor.execute('''CREATE TABLE IF NOT EXISTS repositories (
                id TEXT PRIMARY KEY,
                name TEXT,
                path TEXT,
                created_at TEXT,
                metadata TEXT
            )''')
            cursor.execute('''CREATE TABLE IF NOT EXISTS scans (
                id TEXT PRIMARY KEY,
                repo_id TEXT,
                created_at TEXT,
                data TEXT
            )''')
            connection.commit()

    def add_repository(self, repo_id, name, path, metadata=None):
        with closing(self._connect()) as connection:
            cursor = connection.cursor()
            cursor.execute(
                'INSERT OR REPLACE INTO repositories VALUES (?,?,?,?,?)',
                (repo_id, name, path, datetime.now().isoformat(), json.dumps(metadata or {})),
            )
            connection.commit()

    def get_repositories(self):
        with closing(self._connect()) as connection:
            cursor = connection.cursor()
            cursor.execute('SELECT * FROM repositories ORDER BY created_at DESC')
            return [dict(row) for row in cursor.fetchall()]

    def delete_repository(self, repo_id):
        with closing(self._connect()) as connection:
            cursor = connection.cursor()
            cursor.execute('DELETE FROM repositories WHERE id = ?', (repo_id,))
            cursor.execute('DELETE FROM scans WHERE repo_id = ?', (repo_id,))
            connection.commit()
