const API_BASE_URL = "https://tr-009-notsus.onrender.com";

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async uploadAudio(file, languageId, speakerName) {
    const formData = new FormData();
    formData.append('file', file);
    if (languageId) formData.append('language_id', languageId);
    if (speakerName) formData.append('speaker_name', speakerName);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    return data;
  }

  async getStatus(audioId) {
    return this.request(`/status/${audioId}`);
  }

  async getTranscript(audioId) {
    return this.request(`/transcript/${audioId}`);
  }

  async getTranslation(audioId) {
    return this.request(`/api/translate/${audioId}`);
  }

  async search(query, category, languageId, limit = 10) {
    const params = new URLSearchParams({ q: query, limit });
    if (category) params.append('category', category);
    if (languageId) params.append('language_id', languageId);
    return this.request(`/search?${params}`);
  }

  async chat(message) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getArchive(page = 1, perPage = 12, category, languageId) {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (category) params.append('category', category);
    if (languageId) params.append('language_id', languageId);
    return this.request(`/archive?${params}`);
  }

  async getArchiveItem(audioId) {
    return this.request(`/archive/${audioId}`);
  }

  getAudioUrl(audioId) {
    return `${API_BASE_URL}/audio/${audioId}`;
  }

  async getAnalytics() {
    return this.request('/analytics');
  }

  async getLanguages() {
    return this.request('/languages');
  }

  async createLanguage(languageData) {
    return this.request('/languages', {
      method: 'POST',
      body: JSON.stringify(languageData),
    });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async liveTranslate(text, sourceLanguage = 'auto', targetLanguage = 'en') {
    return this.request('/api/live-translate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage
      }),
    });
  }

  async transcribeAudio(file, language = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (language) {
      formData.append('language', language);
    }

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Transcription failed');
    return data;
  }
}

export const api = new ApiService();
