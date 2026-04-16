import threading
import json
from database import SessionLocal
from models.audio_file import AudioFile
from models.transcript import Transcript
from models.translation import Translation
from models.phrase import Phrase
from services.transcription import TranscriptionService
from services.translation import TranslationService
from services.embedding import EmbeddingService
from services.phrase_extraction import PhraseExtractionService


def process_audio(audio_id, language_code=None, speaker_name=None):
    thread = threading.Thread(target=_process_audio_task, args=(audio_id, language_code, speaker_name))
    thread.daemon = True
    thread.start()


def _process_audio_task(audio_id, language_code=None, speaker_name=None):
    db = SessionLocal()
    try:
        audio_file = db.query(AudioFile).filter(AudioFile.id == audio_id).first()
        if not audio_file:
            print(f"Audio file {audio_id} not found")
            return
        
        audio_file.status = "processing"
        db.commit()
        
        transcription_result = TranscriptionService.transcribe(
            audio_file.file_path, 
            language=language_code
        )
        
        transcript = Transcript(
            audio_id=audio_id,
            text=transcription_result["text"],
            language=transcription_result.get("language", language_code),
            confidence=transcription_result.get("confidence", 0.8),
            word_count=transcription_result.get("word_count", 0)
        )
        db.add(transcript)
        db.commit()
        
        translated_text = TranslationService.translate(
            transcription_result["text"],
            source_language=language_code,
            target_language="English"
        )
        
        translation = Translation(
            transcript_id=transcript.id,
            original_text=transcription_result["text"],
            translated_text=translated_text,
            target_language="en"
        )
        db.add(translation)
        db.commit()
        
        phrases_data = PhraseExtractionService.extract_phrases(
            transcription_result["text"],
            translated_text
        )
        
        for phrase_data in phrases_data:
            embeddings = EmbeddingService.generate_embedding(
                phrase_data["original_text"]
            )
            
            phrase = Phrase(
                transcript_id=transcript.id,
                translation_id=translation.id,
                audio_id=audio_id,
                original_text=phrase_data["original_text"],
                translated_text=phrase_data["translated_text"],
                category=phrase_data["category"],
                embeddings=embeddings
            )
            db.add(phrase)
        
        db.commit()
        
        audio_file.status = "completed"
        db.commit()
        
        transcript_file = audio_file.file_path.replace(".mp3", "_transcript.json").replace(".wav", "_transcript.json")
        try:
            with open(transcript_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "audio_id": audio_id,
                    "transcript": transcription_result["text"],
                    "translation": translated_text,
                    "phrases": [p["original_text"] for p in phrases_data]
                }, f, indent=2, ensure_ascii=False)
        except:
            pass
        
    except Exception as e:
        print(f"Processing error for audio {audio_id}: {e}")
        try:
            audio_file.status = "failed"
            db.commit()
        except:
            pass
    finally:
        db.close()
