# LinguaVault Demo Script

## Pre-Demo Checklist

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
   Server should start on http://localhost:5000

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App should start on http://localhost:3000

3. **Verify Services**
   - Health check: http://localhost:5000/api/health
   - Languages loaded: Check archive page

## Demo Flow (5-7 minutes)

### 1. Introduction (30 seconds)

**Say:** "LinguaVault is an AI-powered platform for preserving endangered languages. It automatically transcribes, translates, and organizes audio recordings of native speakers."

**Show:** Home page with stats and features

### 2. Upload Demo (1-2 minutes)

**Navigate to:** Upload page

**Say:** "Users can upload audio files of heritage language recordings. Our system accepts MP3, WAV, and other formats."

**Demonstrate:**
1. Click "Browse Files" or drag and drop
2. Select a sample audio file
3. Choose a language (e.g., Hindi, Maori)
4. Add speaker name
5. Click "Upload & Process"

**Show:** Upload progress and processing status

**Say:** "The file is uploaded and processing begins automatically. Whisper AI transcribes the audio, GPT translates to English, and phrases are categorized."

### 3. Archive Exploration (1 minute)

**Navigate to:** Archive page

**Show:** Grid of archived items with categories

**Demonstrate:**
1. Filter by category (Greetings, Culture, etc.)
2. Filter by language
3. Click on an item to view details
4. Show transcript, translation, and phrases

**Say:** "All processed recordings appear here with their transcripts, translations, and categorized phrases. Users can search and explore the archive."

### 4. Search Functionality (30 seconds)

**Show:** Search bar on Archive page

**Demonstrate:**
1. Type "hello" or "greeting"
2. Show search results with similarity scores
3. Highlight matching phrases

**Say:** "Our semantic search finds related phrases even when exact words don't match."

### 5. Chat Interface (1 minute)

**Navigate to:** Chat page

**Show:** AI chat assistant

**Demonstrate:**
1. Ask: "How do you say hello?"
2. Ask: "Tell me about greetings"
3. Show response with matching phrase

**Say:** "Users can interact with our AI assistant to find phrases. It semantically understands queries and returns relevant content."

### 6. Analytics (30 seconds)

**Navigate to:** Any page with analytics (Home page)

**Show:**
- Total uploads
- Total phrases extracted
- Languages supported
- Endangered languages
- Translation accuracy scores

**Say:** "We track all activity and provide analytics on language preservation efforts."

### 7. Impact Features (30 seconds)

**Highlight:**
- Endangered language support (Welsh, Maori, Navajo)
- Contribution counter
- Category distribution

**Say:** "LinguaVault prioritizes endangered languages and helps preserve cultural heritage for future generations."

## Key Talking Points

1. **AI-Powered**: Whisper for transcription, GPT for translation, embeddings for search
2. **User-Friendly**: Simple drag-and-drop upload, intuitive interface
3. **Demo-Safe**: Works even without API keys using fallback modes
4. **Modular**: Easy to extend and customize
5. **Impact-Driven**: Focus on endangered language preservation

## Troubleshooting

### If backend fails to start:
- Check Python version (3.8+)
- Verify all dependencies installed
- Check port 5000 is available

### If frontend fails to start:
- Check Node.js version (16+)
- Run `npm install` again
- Check port 3000 is available

### If AI services fail:
- App continues with fallback responses
- Demo data is pre-loaded
- Graceful degradation

## Success Metrics

Demo is successful if:
1. All pages load without errors
2. Upload workflow completes
3. Archive displays items
4. Search returns results
5. Chat responds to queries
6. No crashes or critical errors
