import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path so modules like config, models, routes resolve from anywhere
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes import leads_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend requests using ALLOWED_ORIGINS
    allowed_origins = app.config.get('ALLOWED_ORIGINS', '*')
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    # Initialize database
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(leads_bp)

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'message': 'Leadly API is running'}), 200

    # Ensure tables exist automatically on startup
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    port = app.config.get('PORT', int(os.environ.get('PORT', 5001)))
    app.run(host='0.0.0.0', port=port, debug=True)
