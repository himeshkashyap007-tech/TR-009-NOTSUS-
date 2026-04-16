import re


CATEGORY_KEYWORDS = {
    "greetings": ["hello", "hi", "goodbye", "bye", "morning", "evening", "welcome", "peace", "thank you", "please", "how are you", "good day", "namaste", "hola", "bonjour", "salaam", "kia ora", "aloha"],
    "culture": ["traditional", "ceremony", "ritual", "festival", "dance", "song", "music", "art", "belief", "spirit", "ancestor", "sacred", "holy", "blessing", "pray", "worship"],
    "daily_life": ["food", "eat", "drink", "water", "home", "house", "family", "work", "farm", "sleep", "rest", "walk", "run", "water", "sun", "moon", "star", "tree", "river"],
    "emotions": ["love", "happy", "sad", "angry", "fear", "joy", "peace", "hope", "dream", "heart", "soul", "feel", "miss", "remember", "forget", "laugh", "cry"]
}


class PhraseExtractionService:
    @classmethod
    def extract_phrases(cls, transcript_text, translated_text=None):
        if not transcript_text:
            return []
        
        sentences = cls._split_into_sentences(transcript_text)
        phrases = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 2 or len(sentence) > 500:
                continue
            
            category = cls._categorize_phrase(sentence)
            
            phrases.append({
                "original_text": sentence,
                "translated_text": translated_text,
                "category": category
            })
        
        if not phrases:
            phrases.append({
                "original_text": transcript_text[:200] if len(transcript_text) > 200 else transcript_text,
                "translated_text": translated_text,
                "category": "daily_life"
            })
        
        return phrases

    @classmethod
    def _split_into_sentences(cls, text):
        sentence_endings = r'[.!?;,:]+[\s\n]+|[\n]+'
        sentences = re.split(sentence_endings, text)
        return [s.strip() for s in sentences if s.strip()]

    @classmethod
    def _categorize_phrase(cls, text):
        text_lower = text.lower()
        
        max_score = 0
        best_category = "daily_life"
        
        for category, keywords in CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > max_score:
                max_score = score
                best_category = category
        
        return best_category
