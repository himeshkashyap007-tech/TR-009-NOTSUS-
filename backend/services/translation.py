import requests
from config.settings import OLLAMA_URL

OLLAMA_API_URL = OLLAMA_URL or "http://localhost:11434"


class TranslationService:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            try:
                response = requests.get(OLLAMA_API_URL, timeout=5)
                if response.status_code == 200:
                    cls._client = True
            except requests.exceptions.RequestException:
                cls._client = None
        return cls._client

    @classmethod
    def translate(cls, text, source_language=None, target_language="English"):
        if not text or len(text.strip()) < 1:
            return text
        
        if not cls.get_client():
            return cls._fallback_translate(text)
        
        try:
            language_hint = f"The source text is in {source_language or 'an unknown language'}." if source_language else ""
            system_prompt = f"You are a language translation service. Translate the following text to {target_language}. {language_hint} Only provide the translation, nothing else."
            prompt = f"System: {system_prompt}\nUser: {text}"
            
            response = requests.post(
                f"{OLLAMA_API_URL}/api/generate",
                json={
                    "model": "phi3",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "num_predict": 500
                    }
                },
                timeout=60
            )
            
            if response.status_code != 200:
                return cls._fallback_translate(text)
            
            result = response.json()
            translated = result.get("response", "").strip()
            
            if not translated:
                return cls._fallback_translate(text)
            
            return translated
            
        except requests.exceptions.Timeout:
            print("Translation error: Ollama request timed out")
            return cls._fallback_translate(text)
        except requests.exceptions.ConnectionError:
            print("Translation error: Could not connect to Ollama")
            cls._client = None
            return cls._fallback_translate(text)
        except Exception as e:
            print(f"Translation error: {e}")
            return cls._fallback_translate(text)

    @classmethod
    def _fallback_translate(cls, text):
        return f"[English translation of heritage phrase]: {text}"
