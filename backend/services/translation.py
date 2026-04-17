from services.llm_service import generate_response

class TranslationService:
    @classmethod
    def translate(cls, text, source_language=None, target_language="English"):
        if not text or len(text.strip()) < 1:
            return text
        
        try:
            language_hint = f"The source text is in {source_language or 'an unknown language'}." if source_language else ""
            system_prompt = f"You are a language translation service. Translate the following text to {target_language}. {language_hint} Only provide the translation, nothing else."
            
            translated = generate_response(text, system_prompt)
            
            if not translated:
                return cls._fallback_translate(text)
            
            return translated
            
        except Exception as e:
            print(f"Translation error: {e}")
            return cls._fallback_translate(text)

    @classmethod
    def _fallback_translate(cls, text):
        return f"[English translation of heritage phrase]: {text}"
