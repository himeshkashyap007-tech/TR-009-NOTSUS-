from flask import Blueprint, jsonify, send_file
from database import SessionLocal
from models.audio_file import AudioFile
from models.transcript import Transcript
from models.translation import Translation
from models.phrase import Phrase
from models.language import Language
from utils.helpers import format_response
from pathlib import Path
import mimetypes
import os

archive_bp = Blueprint('archive', __name__)


@archive_bp.route('/archive', methods=['GET'])
def get_archive():
    try:
        from flask import request
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        category = request.args.get('category')
        language_id = request.args.get('language_id', type=int)
        
        db = SessionLocal()
        try:
            query = db.query(AudioFile).filter(AudioFile.status == "completed")
            
            if language_id:
                query = query.filter(AudioFile.language_id == language_id)

            if category:
                query = query.join(Phrase, Phrase.audio_id == AudioFile.id).filter(Phrase.category == category).distinct()
            
            total = query.count()
            audio_files = query.order_by(AudioFile.created_at.desc()).offset(
                (page - 1) * per_page
            ).limit(per_page).all()
            
            results = []
            for audio in audio_files:
                audio_dict = audio.to_dict()
                
                transcript = db.query(Transcript).filter(
                    Transcript.audio_id == audio.id
                ).first()
                if transcript:
                    audio_dict["transcript_preview"] = transcript.text[:100]
                
                language = db.query(Language).filter(
                    Language.id == audio.language_id
                ).first()
                if language:
                    audio_dict["language_name"] = language.name
                    audio_dict["is_endangered"] = language.is_endangered
                
                results.append(audio_dict)
            
            return jsonify(format_response(
                success=True,
                data={
                    "items": results,
                    "total": total,
                    "page": page,
                    "per_page": per_page,
                    "pages": (total + per_page - 1) // per_page
                }
            ))
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e)))


@archive_bp.route('/archive/<int:audio_id>', methods=['GET'])
def get_archive_item(audio_id):
    try:
        db = SessionLocal()
        try:
            audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()
            
            if not audio:
                return jsonify(format_response(error="Audio file not found"))
            
            result = audio.to_dict()
            
            transcript = db.query(Transcript).filter(
                Transcript.audio_id == audio_id
            ).first()
            if transcript:
                result["transcript"] = transcript.to_dict()
            
            translation = db.query(Translation).filter(
                Translation.transcript_id == transcript.id
            ).first() if transcript else None
            if translation:
                result["translation"] = translation.to_dict()
            
            phrases = db.query(Phrase).filter(Phrase.audio_id == audio_id).all()
            result["phrases"] = [p.to_dict() for p in phrases]
            
            language = db.query(Language).filter(
                Language.id == audio.language_id
            ).first()
            if language:
                result["language"] = language.to_dict()
            
            return jsonify(format_response(success=True, data=result))
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e)))


@archive_bp.route('/audio/<int:audio_id>', methods=['GET'])
def stream_audio(audio_id):
    """Serve the stored audio file so the archive cards can preview it."""
    try:
        db = SessionLocal()
        try:
            audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()
            if not audio:
                return jsonify(format_response(error="Audio file not found")), 404

            file_path = Path(audio.file_path)
            if not file_path.exists():
                return jsonify(format_response(error="Audio file not found on disk")), 404

            mime_type, _ = mimetypes.guess_type(str(file_path))
            return send_file(
                str(file_path),
                mimetype=mime_type or 'application/octet-stream',
                as_attachment=False,
                conditional=True,
                download_name=os.path.basename(file_path)
            )
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e))), 500
