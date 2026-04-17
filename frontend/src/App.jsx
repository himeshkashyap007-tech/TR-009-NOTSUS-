import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Archive from './pages/Archive';
import Chat from './pages/Chat';
import LiveTranslator from './pages/LiveTranslator';
import VoiceTranslator from './pages/VoiceTranslator';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/live-translator" element={<LiveTranslator />} />
              <Route path="/voice-translator" element={<VoiceTranslator />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
