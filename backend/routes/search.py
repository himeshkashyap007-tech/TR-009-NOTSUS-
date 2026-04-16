from flask import Blueprint, request, jsonify
from database import SessionLocal
from models.phrase import Phrase
from models.audio_file import AudioFile
from models.language import Language
from services.embedding import EmbeddingService
from utils.helpers import format_response
import json

search_bp = Blueprint('search', __name__)


@search_bp.route('/search', methods=['GET'])
def search_phrases():
    try:
        query = request.args.get('q', '').strip()
        category = request.args.get('category')
        language_id = request.args.get('language_id', type=int)
        limit = request.args.get('limit', 10, type=int)
        
        if not query:
            return jsonify(format_response(error="Search query required"))
        
        db = SessionLocal()
        try:
            phrases_query = db.query(Phrase).filter(
                Phrase.translated_text.isnot(None)
            )
            
            if category:
                phrases_query = phrases_query.filter(Phrase.category == category)
            
            if language_id:
                phrases_query = phrases_query.join(AudioFile).filter(
                    AudioFile.language_id == language_id
                )
            
            all_phrases = phrases_query.all()
            
            query_embedding = EmbeddingService.generate_embedding(query)
            query_vec = json.loads(query_embedding)
            
            scored_phrases = []
            for phrase in all_phrases:
                if phrase.embeddings:
                    similarity = EmbeddingService.cosine_similarity(
                        phrase.embeddings,
                        query_vec
                    )
                else:
                    similarity = EmbeddingService._keyword_similarity(query, phrase.original_text)
                
                scored_phrases.append({
                    "phrase": phrase.to_dict(),
                    "similarity": similarity,
                    "audio_path": phrase.audio_id
                })
            
            scored_phrases.sort(key=lambda x: x["similarity"], reverse=True)
            
            return jsonify(format_response(
                success=True,
                data={
                    "results": scored_phrases[:limit],
                    "total": len(scored_phrases),
                    "query": query
                }
            ))
        finally:
            db.close()
    except Exception as e:
        return jsonify(format_response(error=str(e)))
