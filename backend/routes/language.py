from flask import Blueprint, jsonify
from database import SessionLocal
from models.language import Language
from utils.helpers import format_response

language_bp = Blueprint('language', __name__)


@language_bp.route('/languages', methods=['GET'])
def get_languages():
    try:
        db = SessionLocal()
        try:
            languages = db.query(Language).all()
            return jsonify(format_response(
                success=True,
                data=[lang.to_dict() for lang in languages]
            ))
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e)))


@language_bp.route('/languages', methods=['POST'])
def create_language():
    try:
        from flask import request
        data = request.get_json()
        
        if not data.get('name') or not data.get('code'):
            return jsonify(format_response(error="Name and code required"))
        
        db = SessionLocal()
        try:
            existing = db.query(Language).filter(
                Language.code == data['code']
            ).first()
            
            if existing:
                return jsonify(format_response(error="Language code already exists"))
            
            language = Language(
                name=data['name'],
                code=data['code'],
                region=data.get('region'),
                is_endangered=data.get('is_endangered', False),
                speaker_count=data.get('speaker_count', 0)
            )
            db.add(language)
            db.commit()
            db.refresh(language)
            
            return jsonify(format_response(
                success=True,
                data=language.to_dict(),
                message="Language created successfully"
            ))
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e)))
