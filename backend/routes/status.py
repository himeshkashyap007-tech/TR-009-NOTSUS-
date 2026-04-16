from flask import Blueprint, jsonify
from database import SessionLocal
from models.audio_file import AudioFile
from models.transcript import Transcript
from models.translation import Translation
from utils.helpers import format_response

status_bp = Blueprint('status', __name__)


@status_bp.route('/status/<int:audio_id>', methods=['GET'])
def get_status(audio_id):
    try:
        db = SessionLocal()
        try:
            audio_file = db.query(AudioFile).filter(AudioFile.id == audio_id).first()
            
            if not audio_file:
                return jsonify(format_response(error="Audio file not found"))
            
            result = audio_file.to_dict()
            
            if audio_file.status == "completed":
                transcript = db.query(Transcript).filter(
                    Transcript.audio_id == audio_id
                ).first()
                if transcript:
                    result["transcript_preview"] = transcript.text[:100] + "..." if len(transcript.text) > 100 else transcript.text
            
            return jsonify(format_response(success=True, data=result))
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e)))
