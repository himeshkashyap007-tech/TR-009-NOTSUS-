from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from database import SessionLocal
from models.audio_file import AudioFile
from models.language import Language
from config.settings import AUDIO_DIR, ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from utils.helpers import allowed_file, generate_unique_filename, format_response
from workers.audio_processor import process_audio

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/upload', methods=['POST'])
def upload_audio():
    try:
        if 'file' not in request.files:
            return jsonify(format_response(error="No file provided"))
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify(format_response(error="No file selected"))
        
        if not allowed_file(file.filename):
            return jsonify(format_response(error=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"))
        
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify(format_response(error=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"))
        
        language_id = request.form.get('language_id', type=int)
        speaker_name = request.form.get('speaker_name', '')
        language_code = None
        
        db = SessionLocal()
        try:
            if language_id:
                language = db.query(Language).filter(Language.id == language_id).first()
                if language:
                    language_code = language.code
            
            filename = generate_unique_filename(secure_filename(file.filename))
            file_path = AUDIO_DIR / filename
            file.save(str(file_path))
            
            audio_file = AudioFile(
                filename=filename,
                original_filename=file.filename,
                file_path=str(file_path),
                file_size=file_size,
                language_id=language_id,
                speaker_name=speaker_name,
                status="pending"
            )
            db.add(audio_file)
            db.commit()
            db.refresh(audio_file)
            
            process_audio(audio_file.id, language_code=language_code, speaker_name=speaker_name)
            
            return jsonify(format_response(
                success=True,
                data=audio_file.to_dict(),
                message="Audio uploaded successfully. Processing started."
            ))
        finally:
            db.close()
            
    except Exception as e:
        return jsonify(format_response(error=str(e)))


@upload_bp.route('/upload/demo', methods=['POST'])
def upload_demo():
    try:
        from config.settings import AUDIO_DIR
        
        demo_phrases = [
            {"text": "Namaste, kya haal hai?", "lang": "Hindi", "code": "hi"},
            {"text": "Jambo rafiki yangu", "lang": "Swahili", "code": "sw"},
            {"text": "Kia ora, e hoa ma", "lang": "Maori", "code": "mi"},
            {"text": "Annyeonghaseyo, eotteoke hasyeo?", "lang": "Korean", "code": "ko"},
            {"text": "Hola, como estas?", "lang": "Spanish", "code": "es"}
        ]
        
        db = SessionLocal()
        try:
            language = db.query(Language).first()
            if not language:
                language = Language(name="Hindi", code="hi", region="India")
                db.add(language)
                db.commit()
                db.refresh(language)
            
            audio_file = AudioFile(
                filename="demo_sample.wav",
                original_filename="demo_sample.wav",
                file_path=str(AUDIO_DIR / "demo_sample.wav"),
                file_size=1024,
                language_id=language.id,
                speaker_name="Demo Speaker",
                status="pending"
            )
            db.add(audio_file)
            db.commit()
            db.refresh(audio_file)
            
            process_audio(audio_file.id, language_code="hi", speaker_name="Demo")
            
            return jsonify(format_response(
                success=True,
                data=audio_file.to_dict(),
                message="Demo audio added for processing."
            ))
        finally:
            db.close()
            
    except Exception as e:
        return jsonify(format_response(error=str(e)))
