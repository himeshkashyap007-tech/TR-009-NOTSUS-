import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Upload, Archive, MessageCircle, Languages, Zap } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/archive', icon: Archive, label: 'Archive' },
  { path: '/live-translator', icon: Zap, label: 'Live' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Languages className="w-8 h-8 text-primary-400" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">LinguaVault</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary-500/20 rounded-lg -z-10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
