from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')
    upload_limit_mb = int(os.environ.get('UPLOAD_MAX_SIZE_MB', '100'))
    app.config['MAX_CONTENT_LENGTH'] = upload_limit_mb * 1024 * 1024
    
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    CORS(app, origins=[frontend_url])
    
    from app.routes import health, repositories, analysis, ai
    app.register_blueprint(health.bp)
    app.register_blueprint(repositories.bp)
    app.register_blueprint(analysis.bp)
    app.register_blueprint(ai.bp)
    
    return app
