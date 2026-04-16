import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Bot, User, Loader } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to LinguaVault Chat! I can help you search for phrases in our archive. Try asking me about greetings, cultural expressions, or daily phrases in heritage languages.',
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
   const result = await api.chat(userMessage);

setMessages((prev) => [
  ...prev,
  {
    role: 'assistant',
    content: result.message || result.response || result.data?.response,
    phrase: result.data?.closest_phrase,
  },
]);

if (result.data?.closest_phrase) {
  addToast('Found matching phrase from archive', 'success');
}
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or upload some audio files to build the archive.',
        },
      ]);
      addToast('Chat error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">AI Chat Assistant</span>
          </h1>
          <p className="text-gray-400">
            Ask me anything about phrases in our language archive
          </p>
        </motion.div>

        <div className="glass-effect rounded-2xl overflow-hidden">
          <div className="bg-dark-200/50 px-6 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-medium">LinguaVault Assistant</span>
          </div>

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-400" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.phrase && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-400 mb-1">Matching phrase found:</div>
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="font-medium">{message.phrase.original_text}</p>
                        <p className="text-sm opacity-75 mt-1">
                          {message.phrase.translated_text}
                        </p>
                        {message.phrase.category && (
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 bg-white/10 rounded">
                              {message.phrase.category.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-400" />
                </div>
                <div className="bg-dark-200 rounded-xl px-4 py-3">
                  <Loader className="w-5 h-5 text-primary-400 animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about phrases, greetings, cultural expressions..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid sm:grid-cols-3 gap-4"
        >
          {[
            { label: 'Try: "How do you say hello in spanish?"', icon: '👋' },
            { label: 'Try: "Tell me about greetings in Nepali"', icon: '💬' },
            { label: 'Try: "Cultural phrases of Tamil Nadu"', icon: '🎭' },
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setInput(suggestion.label.replace('Try: "', '').replace('"', ''))}
              className="glass-effect rounded-lg p-4 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-2xl mb-2 block">{suggestion.icon}</span>
              <span className="text-sm">{suggestion.label}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
