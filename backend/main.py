import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from database import init_db
from routes.upload import upload_bp
from routes.status import status_bp
from routes.transcript import transcript_bp
from routes.translate import translate_bp
from routes.search import search_bp
from routes.chat import chat_bp
from routes.archive import archive_bp
from routes.analytics import analytics_bp
from routes.language import language_bp
from routes.audio_transcribe import audio_bp

app = Flask(__name__, static_folder='../frontend/dist')
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(status_bp, url_prefix='/api')
app.register_blueprint(transcript_bp, url_prefix='/api')
app.register_blueprint(translate_bp, url_prefix='/api')
app.register_blueprint(search_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(archive_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(language_bp, url_prefix='/api')
app.register_blueprint(audio_bp, url_prefix='/api')


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve(path):
    if path and (path.startswith('api/') or path.startswith('static/')):
        return {"error": "Not found"}, 404
    
    file_path = Path(app.static_folder) / path
    if file_path.exists():
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/health', methods=['GET'])
def health():
    return {"status": "healthy", "service": "LinguaVault API"}


def seed_demo_data():
    from database import SessionLocal
    from models.language import Language
    
    db = SessionLocal()
    try:
        existing = db.query(Language).first()
        if existing:
            return
        
        demo_languages = [
            Language(name="Hindi", code="hi", region="India", is_endangered=False, speaker_count=600000000),
            Language(name="Swahili", code="sw", region="East Africa", is_endangered=False, speaker_count=100000000),
            Language(name="Maori", code="mi", region="New Zealand", is_endangered=True, speaker_count=50000),
            Language(name="Welsh", code="cy", region="Wales", is_endangered=True, speaker_count=750000),
            Language(name="Navajo", code="nv", region="USA", is_endangered=True, speaker_count=170000),
            Language(name="Aboriginal Australian", code="ab", region="Australia", is_endangered=True, speaker_count=50000),
            Language(name="Galician", code="gl", region="Spain", is_endangered=False, speaker_count=2500000),
            Language(name="Occitan", code="oc", region="France", is_endangered=True, speaker_count=100000),
        ]
        
        for lang in demo_languages:
            db.add(lang)
        
        db.commit()
        print("Demo languages seeded successfully")
    except Exception as e:
        print(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == '__main__':
    print("Initializing LinguaVault API...")
    init_db()
    seed_demo_data()
    print("Starting server on http://localhost:5000")
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)


