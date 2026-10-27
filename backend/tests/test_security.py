from app.security.validator import SecurityValidator
import os
import tempfile

def test_path_traversal():
    try:
        SecurityValidator.validate_path('/etc/passwd', '/safe/root')
        assert False, 'Should have raised'
    except ValueError:
        pass
