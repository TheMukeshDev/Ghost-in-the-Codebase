from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
    
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    CORS(app, origins=[frontend_url])
    
    from app.routes import health, repositories, analysis, ai
    app.register_blueprint(health.bp)
    app.register_blueprint(repositories.bp)
    app.register_blueprint(analysis.bp)
    app.register_blueprint(ai.bp)
    
    return app
