from flask import Blueprint, jsonify, request
from database import SessionLocal
from models.translation import Translation
from models.transcript import Transcript
from utils.helpers import format_response
from config.settings import OLLAMA_URL
import requests

translate_bp = Blueprint('translate', __name__)

OLLAMA_API_URL = OLLAMA_URL or "http://localhost:11434"


@translate_bp.route('/translate/<int:audio_id>', methods=['GET'])
def get_translation(audio_id):
    try:
        db = SessionLocal()
        try:
            transcript = db.query(Transcript).filter(
                Transcript.audio_id == audio_id
            ).first()

            if not transcript:
                return jsonify(format_response(error="Transcript not found"))

            translation = db.query(Translation).filter(
                Translation.transcript_id == transcript.id
            ).first()

            if not translation:
                return jsonify(format_response(error="Translation not found"))

            return jsonify(format_response(
                success=True,
                data=translation.to_dict()
            ))
        finally:
            db.close()

    except Exception as e:
        return jsonify(format_response(error=str(e)))


@translate_bp.route('/live-translate', methods=['POST'])
def live_translate():
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        target_language = data.get('target_language', 'en')

        if not text or len(text) < 2:
            return jsonify({
                "original_text": text,
                "translated_text": "",
                "detected_language": "unknown",
                "success": False
            })

        # 🔥 SIMPLE + STRONG PROMPT
        prompt = f"Translate to {target_language}. Only give translated sentence.\n{text}"

        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={
                "model": "phi3",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0,
                    "num_predict": 50
                }
            },
            timeout=15
        )

        result = response.json()
        raw_text = result.get("response", "").strip()

        print("OLLAMA:", raw_text)

        # 🔥 CLEAN OUTPUT (KEY FIX)
        translated_text = raw_text.split('\n')[0].replace('"', '').strip()

        return jsonify({
            "original_text": text,
            "translated_text": translated_text,
            "detected_language": "unknown",
            "success": True
        })

    except Exception as e:
        return jsonify({
            "original_text": "",
            "translated_text": "",
            "detected_language": "unknown",
            "success": False,
            "error": str(e)
        })