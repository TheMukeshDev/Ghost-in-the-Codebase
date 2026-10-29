import zipfile
from pathlib import Path

class SecurityValidator:
    MAX_ZIP_FILES = 50000
    MAX_DECOMPRESSED_BYTES = 500 * 1024 * 1024  # 500MB limit

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
        try:
            with zipfile.ZipFile(zip_path, 'r') as zf:
                infos = zf.infolist()
                if len(infos) > SecurityValidator.MAX_ZIP_FILES:
                    raise ValueError('Zip contains too many files')

                total_size = 0
                for info in infos:
                    name = info.filename.replace('\\', '/')
                    parts = Path(name).parts
                    if (
                        name.startswith('/')
                        or '..' in parts
                        or (len(name) > 1 and name[1] == ':')
                    ):
                        raise ValueError('Path traversal detected in zip')
                    if info.is_dir():
                        continue
                    total_size += info.file_size
                    if total_size > SecurityValidator.MAX_DECOMPRESSED_BYTES:
                        raise ValueError('Decompressed zip too large')
        except zipfile.BadZipFile:
            raise ValueError('Invalid or corrupted zip archive')
        return True
