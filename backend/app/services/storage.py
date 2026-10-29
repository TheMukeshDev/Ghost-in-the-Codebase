import sqlite3
import json
import os
from datetime import datetime

class Storage:
    def __init__(self, db_path=None):
        self.db_path = db_path or os.environ.get('DATABASE_PATH', 'ghost.db')
        self.init_db()
    
    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute('''CREATE TABLE IF NOT EXISTS repositories (
            id TEXT PRIMARY KEY,
            name TEXT,
            path TEXT,
            created_at TEXT,
            metadata TEXT
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            repo_id TEXT,
            created_at TEXT,
            data TEXT
        )''')
        conn.commit()
        conn.close()
    
    def add_repository(self, repo_id, name, path, metadata=None):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute('INSERT OR REPLACE INTO repositories VALUES (?,?,?, ?,?)',
                    (repo_id, name, path, datetime.now().isoformat(), json.dumps(metadata or {})))
        conn.commit()
        conn.close()
    
    def get_repositories(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute('SELECT * FROM repositories ORDER BY created_at DESC')
        rows = [dict(row) for row in cur.fetchall()]
        conn.close()
        return rows
    
    def delete_repository(self, repo_id):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute('DELETE FROM repositories WHERE id = ?', (repo_id,))
        cur.execute('DELETE FROM scans WHERE repo_id = ?', (repo_id,))
        conn.commit()
        conn.close()
