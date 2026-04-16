import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, RefreshCw, Copy, Trash2, ArrowLeftRight } from 'lucide-react';
import { api } from '../utils/api';

export default function LiveTranslator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [isTranslating, setIsTranslating] = useState(false);
  const [languages, setLanguages] = useState([]);

  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastRequestIdRef = useRef(0);

  useEffect(() => {
    api.getLanguages().then(res => {
      if (res.success) {
        setLanguages(res.data);
      }
    }).catch(() => {
      setLanguages([
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ar', name: 'Arabic' },
      ]);
    });
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const translate = useCallback(async (text, reqId) => {
    if (!text || text.length < 2) {
      setTranslatedText('');
      return;
    }

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
        setStatus(response.detected_language !== 'auto' ? `Detected: ${response.detected_language}` : 'Ready');
      } else {
        setStatus('Translation failed');
      }
    } catch (error) {
      if (error.name !== 'AbortError' && reqId === lastRequestIdRef.current) {
        setStatus('Error');
        setTranslatedText('');
      }
    } finally {
      if (reqId === lastRequestIdRef.current) {
        setIsTranslating(false);
      }
    }
  }, [sourceLang, targetLang]);

  const handleInputChange = useCallback((e) => {
    let text = e.target.value;
    if (text.length > 700) {
      text = text.slice(-700);
    }
    setSourceText(text);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      lastRequestIdRef.current += 1;
      translate(text, lastRequestIdRef.current);
    }, 400);
  }, [translate]);

  const swapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setStatus('Ready');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus('Speech not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;

    let finalTranscript = '';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setStatus('Listening...');
      finalTranscript = sourceText;
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += ' ' + transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const displayText = finalTranscript + interimTranscript;
      setSourceText(displayText);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      silenceTimerRef.current = setTimeout(() => {
        if (displayText.trim()) {
          lastRequestIdRef.current += 1;
          translate(displayText.trim(), lastRequestIdRef.current);
        }
      }, 3000);
    };

    recognitionRef.current.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setStatus(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    setIsListening(false);
    setStatus('Ready');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Live Translator</h1>
          <p className="text-gray-400">Real-time translation as you type or speak</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="auto">Auto Detect</option>
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button
            onClick={swapLanguages}
            disabled={sourceLang === 'auto'}
            className="p-2 rounded-lg bg-dark-200 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
            title="Swap languages"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>

          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-dark-200 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-400">Source Text</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-dark-200 text-gray-400 hover:bg-white/10'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={clearAll}
                  className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:bg-white/10 transition-colors"
                  title="Clear"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <textarea
              value={sourceText}
              onChange={handleInputChange}
              placeholder={isListening ? 'Listening...' : 'Type or speak to translate...'}
              className="w-full h-48 bg-dark-100 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-primary-500"
              disabled={isListening}
            />
          </div>

          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-400">Translation</label>
              <button
                onClick={() => copyToClipboard(translatedText)}
                disabled={!translatedText}
                className="p-2 rounded-lg bg-dark-200 text-gray-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Copy"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-48 bg-dark-100 border border-white/10 rounded-lg p-4 overflow-y-auto">
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

        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
            isListening ? 'bg-red-500/20 text-red-400' : 'bg-dark-200 text-gray-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-red-500 animate-pulse' : isTranslating ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
            }`} />
            {status}
          </div>
        </div>

        <div className="mt-8 glass-effect rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">Tips</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Type or speak continuously - translations update in real-time</li>
            <li>• Wait ~3 seconds of silence to finalize speech translation</li>
            <li>• Use Auto Detect to identify source language automatically</li>
            <li>• Click the microphone button to start/stop speech recognition</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
