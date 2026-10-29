import zipfile
from pathlib import Path

class SecurityValidator:
    @staticmethod
    def validate_path(user_path, base_path):
        try:
            resolved = Path(user_path).resolve()
            base_resolved = Path(base_path).resolve()
            resolved.relative_to(base_resolved)
            return str(resolved)
        except (ValueError, OSError):
            raise ValueError('Invalid path - outside repository root')
    
    @staticmethod
    def validate_zip(zip_path):
        with zipfile.ZipFile(zip_path, 'r') as zf:
            total_size = 0
            for info in zf.infolist():
                # Check for path traversal
                if '..' in info.filename or info.filename.startswith('/'):
                    raise ValueError('Path traversal detected in zip')
                if info.is_dir():
                    continue
                total_size += info.file_size
                if total_size > 500 * 1024 * 1024:  # 500MB limit
                    raise ValueError('Decompressed zip too large')
        return True
