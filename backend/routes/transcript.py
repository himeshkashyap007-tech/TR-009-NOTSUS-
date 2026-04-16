from flask import Blueprint, jsonify
from database import SessionLocal
from models.transcript import Transcript
from utils.helpers import format_response

transcript_bp = Blueprint('transcript', __name__)


@transcript_bp.route('/transcript/<int:audio_id>', methods=['GET'])
def get_transcript(audio_id):
    try:
        db = SessionLocal()
        try:
            transcript = db.query(Transcript).filter(
                Transcript.audio_id == audio_id
            ).first()
            
            if not transcript:
                return jsonify(format_response(error="Transcript not found"))
            
            return jsonify(format_response(
                success=True,
                data=transcript.to_dict()
            ))
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e)))
