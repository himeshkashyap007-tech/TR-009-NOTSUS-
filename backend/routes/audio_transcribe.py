from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from services.transcription import TranscriptionService
from config.settings import ALLOWED_EXTENSIONS
import tempfile
import os

audio_bp = Blueprint('audio', __name__)

@audio_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file provided"})
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"})
        
        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"})
        
        language = request.form.get('language', None)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        try:
            result = TranscriptionService.transcribe(tmp_path, language=language)
            
            return jsonify({
                "success": True,
                "text": result["text"],
                "language": result["language"],
                "confidence": result["confidence"],
                "word_count": result["word_count"]
            })
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
