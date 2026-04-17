from groq import Groq, GroqError
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = os.getenv("MODEL_NAME", "llama-3.1-8b-instant")

LANG_MAP = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German",
    "it": "Italian", "pt": "Portuguese", "zh": "Chinese", "ja": "Japanese",
    "ko": "Korean", "ar": "Arabic", "hi": "Hindi", "ru": "Russian",
    "nl": "Dutch", "pl": "Polish", "vi": "Vietnamese", "th": "Thai",
    "id": "Indonesian", "tr": "Turkish", "sv": "Swedish", "no": "Norwegian",
    "da": "Danish", "fi": "Finnish", "el": "Greek", "he": "Hebrew",
    "cs": "Czech", "hu": "Hungarian", "ro": "Romanian", "uk": "Ukrainian",
    "bn": "Bengali", "ta": "Tamil", "te": "Telugu", "mr": "Marathi",
    "ur": "Urdu", "pa": "Punjabi", "ml": "Malayalam", "kn": "Kannada",
    "gu": "Gujarati", "as": "Assamese", "ne": "Nepali", "si": "Sinhala"
}

def generate_response(prompt, system_prompt=None, max_tokens=50):
    messages = []
    
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.1,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except GroqError as e:
        raise Exception(f"Groq API error: {str(e)}")

def translate_text(text, source_lang=None, target_lang="en"):
    target_name = LANG_MAP.get(target_lang.lower(), target_lang.title())
    
    system_prompt = f"Translate to {target_name}. Only output the translation."
    
    return generate_response(text, system_prompt, max_tokens=50)
