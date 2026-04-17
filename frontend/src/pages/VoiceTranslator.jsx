import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, RefreshCw, Trash2, Languages, Settings, Upload, FileAudio } from 'lucide-react';
import { api } from '../utils/api';

const LANGUAGES = [
  { code: 'en', name: 'English', voice: 'en-US' },
  { code: 'hi', name: 'Hindi', voice: 'hi-IN' },
  { code: 'es', name: 'Spanish', voice: 'es-ES' },
  { code: 'fr', name: 'French', voice: 'fr-FR' },
  { code: 'de', name: 'German', voice: 'de-DE' },
  { code: 'zh', name: 'Chinese', voice: 'zh-CN' },
  { code: 'ja', name: 'Japanese', voice: 'ja-JP' },
  { code: 'ko', name: 'Korean', voice: 'ko-KR' },
  { code: 'pt', name: 'Portuguese', voice: 'pt-PT' },
  { code: 'ar', name: 'Arabic', voice: 'ar-SA' },
  { code: 'ru', name: 'Russian', voice: 'ru-RU' },
  { code: 'it', name: 'Italian', voice: 'it-IT' },
];

export default function VoiceTranslator() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastRequestIdRef = useRef(0);
  const finalTranscriptRef = useRef('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const speakText = useCallback((text, langCode) => {
    if (!text || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const langConfig = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langConfig.voice;
    utterance.rate = voiceSpeed;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setStatus('Speaking...');
    utterance.onend = () => {
      if (isListening) setStatus('Listening...');
      else setStatus('Ready');
    };
    utterance.onerror = () => {
      if (isListening) setStatus('Listening...');
      else setStatus('Ready');
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceSpeed, isListening]);

  const translate = useCallback(async (text, reqId) => {
    if (!text || text.trim().length < 2) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsTranslating(true);
    setStatus('Translating...');

    try {
      const response = await api.liveTranslate(text, sourceLang, targetLang);

      if (reqId !== lastRequestIdRef.current) return;

      if (response.success && response.translated_text) {
        setTranslatedText(response.translated_text);
        speakText(response.translated_text, targetLang);
        setStatus('Speaking...');
      } else {
        setStatus('Translation failed');
      }
    } catch (error) {
      if (error.name !== 'AbortError' && reqId === lastRequestIdRef.current) {
        setStatus('Error');
      }
    } finally {
      if (reqId === lastRequestIdRef.current) {
        setIsTranslating(false);
      }
    }
  }, [sourceLang, targetLang, speakText]);

  const handleSilence = useCallback(() => {
    const text = finalTranscriptRef.current.trim();
    if (text.length >= 2) {
      lastRequestIdRef.current += 1;
      translate(text, lastRequestIdRef.current);
    }
    finalTranscriptRef.current = '';
  }, [translate]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus('Speech not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    const langConfig = LANGUAGES.find(l => l.code === sourceLang) || LANGUAGES[0];
    recognitionRef.current.lang = langConfig.voice;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setStatus('Listening...');
      finalTranscriptRef.current = sourceText;
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + finalTranscript).trim();
      setSourceText(finalTranscriptRef.current + ' ' + interimTranscript);

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (finalTranscript.trim()) {
        handleSilence();
      } else {
        silenceTimerRef.current = setTimeout(() => {
          handleSilence();
        }, 1500);
      }
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setStatus(`Error: ${event.error}`);
      }
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    try {
      recognitionRef.current.start();
    } catch {
      setStatus('Mic access denied');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsListening(false);

    const text = finalTranscriptRef.current.trim();
    if (text.length >= 2) {
      lastRequestIdRef.current += 1;
      translate(text, lastRequestIdRef.current);
    }
    finalTranscriptRef.current = '';

    setStatus('Ready');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    finalTranscriptRef.current = '';
    window.speechSynthesis.cancel();
    setStatus('Ready');
  };

  const replayTranslation = () => {
    if (translatedText) {
      speakText(translatedText, targetLang);
    }
  };

  const swapLanguages = () => {
    if (isListening) return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setStatus(isListening ? 'Listening...' : 'Ready');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus('Processing audio...');

    try {
      const transcription = await api.transcribeAudio(file, sourceLang);
      
      if (transcription.success && transcription.text) {
        setSourceText(transcription.text);
        
        setIsTranslating(true);
        const translation = await api.liveTranslate(transcription.text, sourceLang, targetLang);
        
        if (translation.success && translation.translated_text) {
          setTranslatedText(translation.translated_text);
          speakText(translation.translated_text, targetLang);
          setStatus('Ready');
        } else {
          setStatus('Translation failed');
        }
      } else {
        setStatus('Transcription failed');
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      setStatus('Error processing audio');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Voice Translator</h1>
          <p className="text-gray-400">Speak naturally in your language, hear the translation instantly</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
            disabled={isListening}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={swapLanguages}
            disabled={isListening}
            className="p-2 rounded-lg bg-dark-200 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Swap languages"
          >
            <Languages className="w-5 h-5" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
            disabled={isListening}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-dark-200 border border-white/10 hover:bg-white/10 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isListening || isUploading}
            className="p-2 rounded-lg bg-dark-200 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Upload Audio"
          >
            {isUploading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </button>
        </div>

        {showSettings && (
          <div className="glass-effect rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400">Speech Speed:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-white w-12">{voiceSpeed}x</span>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isListening
                ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/50'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-400">
                {LANGUAGES.find(l => l.code === sourceLang)?.name || 'Source'}
              </label>
              <span className="text-xs text-gray-500">
                {sourceLang === 'auto' ? 'Auto-detect' : LANGUAGES.find(l => l.code === sourceLang)?.name}
              </span>
            </div>
            <div className="w-full h-40 bg-dark-100 border border-white/10 rounded-lg p-4 overflow-y-auto">
              {sourceText ? (
                <p className="text-white whitespace-pre-wrap">{sourceText}</p>
              ) : (
                <p className="text-gray-500">
                  {isListening ? 'Listening...' : 'Your speech will appear here...'}
                </p>
              )}
            </div>
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-400">
                {LANGUAGES.find(l => l.code === targetLang)?.name || 'Target'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={replayTranslation}
                  disabled={!translatedText || isTranslating}
                  className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Replay"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={stopSpeaking}
                  disabled={!window.speechSynthesis?.speaking}
                  className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                  title="Stop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-full h-40 bg-dark-100 border border-white/10 rounded-lg p-4 overflow-y-auto">
              {isTranslating ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Translating...
                </div>
              ) : translatedText ? (
                <p className="text-white whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-gray-500">Translation will appear here...</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            isListening ? 'bg-red-500/20 text-red-400' : 
            isTranslating || isUploading ? 'bg-yellow-500/20 text-yellow-400' :
            status.includes('Speaking') ? 'bg-green-500/20 text-green-400' :
            'bg-dark-200 text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-red-500 animate-pulse' : 
              isTranslating || isUploading ? 'bg-yellow-500 animate-pulse' :
              status.includes('Speaking') ? 'bg-green-500 animate-pulse' :
              'bg-gray-500'
            }`} />
            {status}
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={clearAll}
            className="px-6 py-2 rounded-lg bg-dark-200 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="glass-effect rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">How it works</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>1. Select source and target languages</li>
            <li>2. Click the microphone button to start speaking</li>
            <li>3. Speak naturally - the system translates continuously</li>
            <li>4. Hear the translation played back automatically</li>
            <li>5. Or click Upload to translate an audio file</li>
            <li>6. Click the mic again to stop, or let the other person respond</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
