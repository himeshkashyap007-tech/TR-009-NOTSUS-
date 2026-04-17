# LinguaVault

> AI-Powered Heritage Language Preservation Platform

![LinguaVault](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## Overview

LinguaVault is a full-stack web application designed to preserve endangered languages through AI-powered transcription, translation, and semantic search capabilities.

## Features

- **Audio Upload**: Drag & drop interface for uploading native language recordings
- **AI Transcription**: Automatic speech-to-text using OpenAI Whisper
- **Translation**: English translations via Groq API (Llama 3.1 8B Instant)
- **Phrase Extraction**: Intelligent categorization into greetings, culture, daily life, and emotions
- **Semantic Search**: Find related phrases using AI embeddings
- **Chat Interface**: Natural language querying of the language archive
- **Analytics Dashboard**: Track preservation progress and statistics
- **Endangered Language Support**: Prioritizes at-risk languages

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS
- Framer Motion for animations
- Lucide React icons

### Backend
- Python Flask
- Flask-CORS
- SQLAlchemy ORM

### AI Services
- OpenAI Whisper (base model)
- Groq API (Llama 3.1 8B Instant)
- Sentence Transformers (embeddings)

### Database
- SQLite

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Groq API key (get one at https://console.groq.com)

### Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Groq client
pip install groq

# Create .env file
cp .env.example .env
# Edit .env with your API keys

# Run the server
python main.py
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Frontend runs on: http://localhost:3000

## Environment Variables

### Backend (.env)

```env
# Groq API Configuration
GROQ_API_KEY=your_api_key_here
MODEL_NAME=llama-3.1-8b-instant

DATABASE_URL=sqlite:///linguavault.db
OPENAI_API_KEY=your_openai_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here
MAX_FILE_SIZE=20971520
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload audio file |
| `/api/status/<id>` | GET | Get processing status |
| `/api/transcript/<id>` | GET | Get transcript |
| `/api/translate/<id>` | GET | Get translation |
| `/api/search` | GET | Search phrases |
| `/api/chat` | POST | Chat with AI |
| `/api/archive` | GET | List archived items |
| `/api/analytics` | GET | Get analytics |
| `/api/languages` | GET/POST | Manage languages |

## Project Structure

```
linguavault/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilities
│   └── ...
├── backend/               # Flask backend
│   ├── config/            # Configuration
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   ├── llm_service.py # Groq API integration
│   │   └── translation.py # Translation service
│   ├── utils/             # Utilities
│   ├── workers/           # Background workers
│   ├── main.py            # Entry point
│   └── requirements.txt
├── storage/               # File storage
│   ├── audio/             # Uploaded audio files
│   └── transcripts/       # Generated transcripts
├── docs/                  # Documentation
└── README.md
```

## Usage

### 1. Upload Audio

Navigate to the Upload page and drag & drop an audio file. Select the language and optionally add speaker information.

### 2. Processing

The audio is automatically:
1. Transcribed using Whisper AI
2. Translated to English using Groq API
3. Split into phrases
4. Categorized (greetings, culture, daily life, emotions)
5. Indexed for semantic search

### 3. Explore Archive

Browse the archive to see all uploaded recordings, their transcripts, translations, and phrases.

### 4. Search & Chat

Use the search bar or chat interface to find related phrases using natural language queries.

## Demo Mode

The application includes fallback modes for when AI services are unavailable:
- Transcription falls back to sample text
- Translation falls back to prefixed original text
- Search falls back to keyword matching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- OpenAI for Whisper
- Groq for fast LLM inference
- Hugging Face for transformers
- The language preservation community

---

**Built with ❤️ for heritage language preservation**
