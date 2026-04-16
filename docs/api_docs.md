# LinguaVault API Documentation

## Base URL

```
http://localhost:5000/api
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Upload Audio

**POST** `/upload`

Upload an audio file for processing.

**Request (multipart/form-data)**
- `file` (required): Audio file (MP3, WAV, M4A, OGG)
- `language_id` (optional): Language ID
- `speaker_name` (optional): Speaker name

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "abc123.wav",
    "original_filename": "heritage_audio.wav",
    "file_size": 1024000,
    "language_id": 1,
    "speaker_name": "John Doe",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00"
  },
  "message": "Audio uploaded successfully. Processing started."
}
```

### Get Status

**GET** `/status/<audio_id>`

Get the processing status of an audio file.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "transcript_preview": "Sample transcript text..."
  }
}
```

### Get Transcript

**GET** `/transcript/<audio_id>`

Get the transcript of an audio file.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "audio_id": 1,
    "text": "Transcribed text",
    "language": "hi",
    "confidence": 0.95,
    "word_count": 10
  }
}
```

### Get Translation

**GET** `/translate/<audio_id>`

Get the English translation of an audio file.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "transcript_id": 1,
    "original_text": "Namaste",
    "translated_text": "Hello",
    "target_language": "en"
  }
}
```

### Search Phrases

**GET** `/search?q=<query>&category=<cat>&language_id=<id>&limit=<limit>`

Search for phrases using semantic similarity.

**Parameters**
- `q` (required): Search query
- `category` (optional): Filter by category
- `language_id` (optional): Filter by language
- `limit` (optional): Number of results (default: 10)

**Response**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "phrase": {
          "id": 1,
          "original_text": "Namaste",
          "translated_text": "Hello",
          "category": "greetings"
        },
        "similarity": 0.95,
        "audio_path": "/storage/audio/abc123.wav"
      }
    ],
    "total": 1,
    "query": "hello"
  }
}
```

### Chat

**POST** `/chat`

Send a message to the chat assistant.

**Request**
```json
{
  "message": "How do you say hello?"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "response": "I found a related phrase: 'Namaste'",
    "closest_phrase": {
      "id": 1,
      "original_text": "Namaste",
      "translated_text": "Hello",
      "similarity": 0.92,
      "audio_path": "/storage/audio/abc123.wav"
    }
  }
}
```

### Get Archive

**GET** `/archive?page=<page>&per_page=<per_page>&category=<cat>&language_id=<id>`

Get paginated list of archived audio files.

**Response**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "per_page": 12,
    "pages": 9
  }
}
```

### Get Archive Item

**GET** `/archive/<audio_id>`

Get detailed information about an archived item.

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "transcript": {...},
    "translation": {...},
    "phrases": [...],
    "language": {...}
  }
}
```

### Get Analytics

**GET** `/analytics`

Get platform analytics.

**Response**
```json
{
  "success": true,
  "data": {
    "total_uploads": 50,
    "completed_uploads": 45,
    "processing": 5,
    "total_phrases": 200,
    "total_translations": 45,
    "languages_count": 8,
    "endangered_languages": 3,
    "word_error_rate": 0.08,
    "translation_score": 0.92,
    "category_distribution": {
      "greetings": 50,
      "culture": 30,
      "daily_life": 80,
      "emotions": 40
    },
    "contributions": 250
  }
}
```

### Get Languages

**GET** `/languages`

Get list of supported languages.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hindi",
      "code": "hi",
      "region": "India",
      "is_endangered": false,
      "speaker_count": 600000000
    }
  ]
}
```

### Create Language

**POST** `/languages`

Add a new language.

**Request**
```json
{
  "name": "Maori",
  "code": "mi",
  "region": "New Zealand",
  "is_endangered": true,
  "speaker_count": 50000
}
```

## Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
