import numpy as np
import json
import re


class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                cls._model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                print(f"Warning: Could not load embedding model: {e}")
                cls._model = None
        return cls._model

    @classmethod
    def generate_embedding(cls, text):
        model = cls.get_model()
        
        if model is None:
            return cls._generate_dummy_embedding(text)
        
        try:
            embedding = model.encode(text)
            return json.dumps(embedding.tolist())
        except Exception as e:
            print(f"Embedding error: {e}")
            return cls._generate_dummy_embedding(text)

    @classmethod
    def _generate_dummy_embedding(cls, text):
        words = text.lower().split()
        vec = np.zeros(384)
        for i, word in enumerate(words[:384]):
            vec[i % 384] = hash(word) % 100 / 100
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return json.dumps(vec.tolist())

    @classmethod
    def cosine_similarity(cls, vec1, vec2):
        try:
            v1 = np.array(json.loads(vec1))
            v2 = np.array(json.loads(vec2))
            return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
        except:
            return cls._keyword_similarity(
                json.loads(vec1) if isinstance(vec1, str) else vec1,
                json.loads(vec2) if isinstance(vec2, str) else vec2
            )

    @classmethod
    def _keyword_similarity(cls, words1, words2):
        if isinstance(words1, list):
            set1 = set(str(w).lower() for w in words1)
            set2 = set(str(w).lower() for w in words2)
        else:
            set1 = set(str(words1).lower().split())
            set2 = set(str(words2).lower().split())
        
        if not set1 or not set2:
            return 0.0
        
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        return intersection / union if union > 0 else 0.0
