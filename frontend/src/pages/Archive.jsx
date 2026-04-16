import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Play, Pause, Globe, Loader, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../utils/api';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'greetings', label: 'Greetings' },
  { value: 'culture', label: 'Culture' },
  { value: 'daily_life', label: 'Daily Life' },
  { value: 'emotions', label: 'Emotions' },
];

export default function Archive() {
  const [items, setItems] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    api.getLanguages().then(res => {
      if (res.success) setLanguages(res.data);
    });
  }, []);

  useEffect(() => {
    fetchArchive();
  }, [page, selectedCategory, selectedLanguage]);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const result = await api.getArchive(
        page,
        12,
        selectedCategory || null,
        selectedLanguage || null
      );
      if (result.success) {
        setItems(result.data.items);
        setTotalPages(result.data.pages);
      }
    } catch (error) {
      console.error('Failed to fetch archive:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading(true);
    try {
      const result = await api.search(
        searchQuery,
        selectedCategory || null,
        selectedLanguage || null
      );
      if (result.success) {
        setSearchResults(result.data);
        setItems(result.data.results.map(r => ({
          ...r.phrase,
          audioId: r.phrase.audio_id || r.audio_path,
          audio_path: r.audio_path,
          similarity: r.similarity
        })));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (audioId) => {
    if (!audioId) return;

    try {
      const result = await api.getArchiveItem(audioId);
      if (result.success) {
        setSelectedItem(result.data);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
    }
  };

  const getAudioId = (item) => item.audio_id || item.audioId || item.audio_path || item.id;

  const handleViewDetails = (item) => {
    const audioId = getAudioId(item);
    viewDetails(audioId);
  };

  const handlePlayPreview = async (item) => {
    const audioId = getAudioId(item);
    if (!audioId || !audioRef.current) return;

    try {
      const audio = audioRef.current;

      if (playingAudio === audioId) {
        audio.pause();
        audio.currentTime = 0;
        setPlayingAudio(null);
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      audio.src = api.getAudioUrl(audioId);
      await audio.play();
      setPlayingAudio(audioId);
    } catch (error) {
      console.error('Unable to play audio preview:', error);
      setPlayingAudio(null);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const handleEnded = () => setPlayingAudio(null);
    const handlePause = () => {
      if (audio.ended || audio.currentTime === 0) {
        setPlayingAudio(null);
      }
    };
    const handleError = () => setPlayingAudio(null);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      greetings: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      culture: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      daily_life: 'bg-green-500/20 text-green-400 border-green-500/30',
      emotions: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Language Archive</span>
          </h1>
          <p className="text-gray-400">Explore preserved phrases from heritage languages</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search phrases..."
                className="w-full pl-10 pr-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                  {lang.is_endangered ? ' ⚠️' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (searchQuery) handleSearch();
                else fetchArchive();
              }}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              {searchQuery ? 'Search' : 'Apply'}
            </button>
          </div>

          {searchResults && (
            <div className="mt-4 text-sm text-gray-400">
              Found {searchResults.total} results for "{searchResults.query}"
              <button
                onClick={() => {
                  setSearchResults(null);
                  setSearchQuery('');
                  fetchArchive();
                }}
                className="ml-2 text-primary-400 hover:text-primary-300"
              >
                Clear search
              </button>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass-effect rounded-xl"
          >
            <Globe className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your filters or upload some audio files</p>
          </motion.div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, i) => {
                const audioId = getAudioId(item);
                const isPlaying = playingAudio === audioId;

                return (
                  <motion.div
                    key={`${audioId ?? item.id}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-effect rounded-xl overflow-hidden hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => handleViewDetails(item)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(item.category)}`}>
                          {item.category?.replace('_', ' ') || 'uncategorized'}
                        </span>
                        {item.similarity !== undefined && (
                          <span className="text-xs text-primary-400">
                            {Math.round(item.similarity * 100)}% match
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium mb-2 line-clamp-2">
                        {item.original_text}
                      </p>
                      
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                        {item.translated_text}
                      </p>

                      {item.language_name && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Globe className="w-3 h-3" />
                          {item.language_name}
                        </div>
                      )}
                    </div>

                    <div className="px-5 pb-5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                      >
                        View details
                      </button>
                      <button
                        onClick={() => handlePlayPreview(item)}
                        disabled={!audioId}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-600 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!searchResults && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Archive Item Details</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedItem.language && (
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-primary-400" />
                    <span className="font-medium">{selectedItem.language.name}</span>
                    {selectedItem.language.is_endangered && (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                        Endangered
                      </span>
                    )}
                  </div>
                )}

                {selectedItem.transcript && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Transcript</h3>
                    <p className="bg-dark-200 rounded-lg p-4">{selectedItem.transcript.text}</p>
                  </div>
                )}

                {selectedItem.translation && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Translation</h3>
                    <p className="bg-dark-200 rounded-lg p-4">{selectedItem.translation.translated_text}</p>
                  </div>
                )}

                {selectedItem.phrases && selectedItem.phrases.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Extracted Phrases</h3>
                    <div className="space-y-2">
                      {selectedItem.phrases.map((phrase, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${getCategoryColor(phrase.category)}`}>
                          <p className="font-medium">{phrase.original_text}</p>
                          <p className="text-sm opacity-75">{phrase.translated_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
