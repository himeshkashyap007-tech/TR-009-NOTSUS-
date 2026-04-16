# LinguaVault Architecture

## Overview

LinguaVault is a full-stack AI-powered web application for heritage language preservation. It consists of a React frontend, Flask backend, SQLite database, and AI services for transcription, translation, and semantic search.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React + Vite + Tailwind CSS + Framer Motion                │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────────────┐
│                        Backend                               │
│  Flask + Flask-CORS + SQLAlchemy                            │
│  ├── Routes (API Endpoints)                                 │
│  ├── Services (AI Processing)                               │
│  ├── Workers (Background Processing)                       │
│  └── Utils (Helpers)                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Data Layer                                │
│  ├── SQLite Database (via SQLAlchemy)                      │
│  └── File Storage (audio, transcripts)                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React)

- **Pages**: Home, Upload, Archive, Chat
- **Components**: Navbar
- **Hooks**: useToast (notifications)
- **Utils**: api.js (API client)

### Backend (Flask)

#### Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/upload` | POST | Upload audio file |
| `/api/status/<id>` | GET | Get processing status |
| `/api/transcript/<id>` | GET | Get transcript |
| `/api/translate/<id>` | GET | Get translation |
| `/api/search` | GET | Search phrases |
| `/api/chat` | POST | Chat with AI |
| `/api/archive` | GET | List archived items |
| `/api/analytics` | GET | Get analytics data |
| `/api/languages` | GET/POST | Manage languages |

#### Services

1. **TranscriptionService**: Uses Whisper AI for speech-to-text
2. **TranslationService**: Uses OpenAI GPT for translations
3. **EmbeddingService**: Generates phrase embeddings
4. **PhraseExtractionService**: Categorizes phrases

#### Workers

- **AudioProcessor**: Background thread for processing uploaded audio

### Database Schema

```
Languages
├── id (PK)
├── name
├── code (unique)
├── region
├── is_endangered
└── speaker_count

AudioFiles
├── id (PK)
├── filename
├── original_filename
├── file_path
├── language_id (FK)
├── speaker_name
├── duration
└── status

Transcripts
├── id (PK)
├── audio_id (FK)
├── text
├── language
├── confidence
└── word_count

Translations
├── id (PK)
├── transcript_id (FK)
├── original_text
├── translated_text
└── target_language

Phrases
├── id (PK)
├── transcript_id (FK)
├── translation_id (FK)
├── audio_id (FK)
├── original_text
├── translated_text
├── category
├── embeddings (JSON string)
└── usage_count
```

## Processing Pipeline

1. **Upload**: File saved to `/storage/audio/`
2. **Transcription**: Whisper base model processes audio
3. **Translation**: GPT-3.5-turbo translates to English
4. **Phrase Extraction**: Text split and categorized
5. **Embeddings**: Semantic vectors generated and stored
6. **Status Update**: Audio file marked as completed

## Error Handling

All AI services have fallbacks:
- Whisper fails → Returns dummy transcript
- Translation fails → Returns original text with prefix
- Embeddings fail → Uses keyword similarity search
