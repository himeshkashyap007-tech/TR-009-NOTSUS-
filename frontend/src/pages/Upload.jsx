import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, Mic, FileAudio, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [speakerName, setSpeakerName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [audioId, setAudioId] = useState(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useState(() => {
    api.getLanguages().then(res => {
      if (res.success) setLanguages(res.data);
    }).catch(() => {});
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/m4a', 'audio/ogg'];
    const maxSize = 20 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      addToast('Invalid file type. Please upload MP3, WAV, M4A, or OGG files.', 'error');
      return;
    }

    if (selectedFile.size > maxSize) {
      addToast('File too large. Maximum size is 20MB.', 'error');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setUploadStatus(null);
  };

  const handleUpload = async () => {
    if (!file) {
      addToast('Please select a file first', 'error');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');

    try {
      const result = await api.uploadAudio(file, selectedLanguage || null, speakerName);
      
      if (result.success) {
        setAudioId(result.data.id);
        setUploadStatus('success');
        addToast('Audio uploaded! Processing started.', 'success');
        pollStatus(result.data.id);
      }
    } catch (error) {
      setUploadStatus('error');
      addToast(error.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const pollStatus = (id) => {
    const interval = setInterval(async () => {
      try {
        const result = await api.getStatus(id);
        if (result.success) {
          if (result.data.status === 'completed') {
            setUploadStatus('completed');
            addToast('Processing complete!', 'success');
            clearInterval(interval);
          } else if (result.data.status === 'failed') {
            setUploadStatus('error');
            addToast('Processing failed', 'error');
            clearInterval(interval);
          }
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 120000);
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setUploadStatus(null);
    setAudioId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Upload Audio</span>
          </h1>
          <p className="text-gray-400">Share your heritage language with the world</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-8"
        >
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-white/20 hover:border-white/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileAudio className="w-8 h-8 text-primary-400" />
                  <div className="text-left">
                    <div className="font-semibold">{file.name}</div>
                    <div className="text-sm text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    onClick={resetUpload}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                {preview && (
                  <audio controls src={preview} className="w-full max-w-md mx-auto" />
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Drop your audio file here
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  or click to browse (MP3, WAV, M4A, OGG - max 20MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,audio/*"
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors"
                >
                  Browse Files
                </button>
              </>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language (Optional)</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="">Select a language</option>
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.code}) - {lang.region}
                    {lang.is_endangered ? ' ⚠️ Endangered' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Speaker Name (Optional)</label>
              <input
                type="text"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="Enter speaker name or leave blank"
                className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  uploadStatus === 'success' || uploadStatus === 'completed'
                    ? 'bg-green-500/20 border border-green-500/30'
                    : uploadStatus === 'error'
                    ? 'bg-red-500/20 border border-red-500/30'
                    : 'bg-primary-500/20 border border-primary-500/30'
                }`}
              >
                {uploadStatus === 'uploading' && (
                  <Loader className="w-5 h-5 text-primary-400 animate-spin" />
                )}
                {uploadStatus === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {uploadStatus === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {uploadStatus === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span>
                  {uploadStatus === 'uploading' && 'Uploading and starting processing...'}
                  {uploadStatus === 'success' && 'Upload successful! Processing in progress...'}
                  {uploadStatus === 'completed' && 'Processing completed!'}
                  {uploadStatus === 'error' && 'Upload or processing failed'}
                </span>
              </motion.div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                file && !uploading
                  ? 'bg-primary-600 hover:bg-primary-700'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  Upload & Process
                </>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-effect rounded-xl p-6"
        >
          <h3 className="font-semibold mb-4">What happens next?</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 text-primary-400 text-xs font-bold">1</div>
              <p>Your audio file is securely stored in our system</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 text-xs font-bold">2</div>
              <p>Whisper AI transcribes the speech to text</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 text-green-400 text-xs font-bold">3</div>
              <p>Translation service converts text to English</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400 text-xs font-bold">4</div>
              <p>Phrases are categorized and made searchable</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
