import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, Archive, MessageCircle, Globe, Mic, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../utils/api';

export default function Home() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.getAnalytics().then(res => {
      if (res.success) setAnalytics(res.data);
    }).catch(() => {});
  }, []);

  const features = [
    {
      icon: Mic,
      title: 'Audio Upload',
      description: 'Upload native language audio files with drag & drop simplicity',
      color: 'from-blue-500 to-cyan-500',
      actionLabel: 'Upload audio',
      actionTo: '/upload'
    },
    {
      icon: Sparkles,
      title: 'AI Transcription',
      description: 'Automatic speech-to-text conversion using Whisper AI',
      color: 'from-purple-500 to-pink-500',
      actionLabel: 'View archive',
      actionTo: '/archive'
    },
    {
      icon: Globe,
      title: 'Translation',
      description: 'Translate phrases to English with high accuracy',
      color: 'from-green-500 to-emerald-500',
      actionLabel: 'Open archive',
      actionTo: '/archive'
    },
    {
      icon: Heart,
      title: 'Phrase Extraction',
      description: 'Categorize phrases into greetings, culture, daily life & emotions',
      color: 'from-red-500 to-orange-500',
      actionLabel: 'Start chat',
      actionTo: '/chat'
    }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              <span className="gradient-text">Preserve Heritage</span>
              <br />
              <span className="text-gray-200">One Voice at a Time</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              LinguaVault uses AI to transcribe, translate, and preserve endangered languages.
              Build a digital archive of cultural heritage for future generations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/upload"
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Start Preserving
              </Link>
              <Link
                to="/archive"
                className="px-8 py-3 border border-white/20 hover:bg-white/5 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Archive className="w-5 h-5" />
                Browse Archive
              </Link>
            </div>
          </motion.div>

          {analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
            >
              {[
                { label: 'Total Uploads', value: analytics.total_uploads },
                { label: 'Phrases', value: analytics.total_phrases },
                { label: 'Languages', value: analytics.languages_count },
                { label: 'Contributions', value: analytics.contributions },
              ].map((stat, i) => (
                <div key={i} className="glass-effect rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-effect rounded-xl p-6 hover:bg-white/5 transition-colors group flex flex-col"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">{feature.description}</p>
                <Link
                  to={feature.actionTo}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  {feature.actionLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-effect rounded-2xl p-8 mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500" />
              Endangered Languages We Support
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Maori', region: 'New Zealand', speakers: '50,000' },
                { name: 'Navajo', region: 'USA', speakers: '170,000' },
                { name: 'Welsh', region: 'Wales', speakers: '750,000' },
                { name: 'Occitan', region: 'France', speakers: '100,000' },
              ].map((lang, i) => (
                <div key={i} className="bg-dark-200 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-red-400" />
                    <span className="font-semibold">{lang.name}</span>
                  </div>
                  <div className="text-sm text-gray-400">{lang.region}</div>
                  <div className="text-xs text-red-400 mt-1">~{lang.speakers} speakers</div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h2>
            <p className="text-gray-400 mb-6">Join our community of language preservationists</p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 rounded-lg font-semibold transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Start a Conversation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.section>
        </div>
      </section>
    </div>
  );
}
