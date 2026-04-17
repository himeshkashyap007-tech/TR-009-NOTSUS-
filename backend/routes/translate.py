from flask import Blueprint, request, jsonify
from services.llm_service import translate_text

translate_bp = Blueprint('translate', __name__)

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

        translated_text = translate_text(
            text=text,
            target_lang=target_language
        )
        
        translated_text = translated_text.strip()

        return jsonify({
            "original_text": text,
            "translated_text": translated_text,
            "detected_language": "unknown",
            "success": True
        })

    except Exception as e:
        print("GROQ ERROR:", str(e))
        return jsonify({
            "original_text": "",
            "translated_text": "",
            "detected_language": "unknown",
            "success": False,
            "error": str(e)
        })
