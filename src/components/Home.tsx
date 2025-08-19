import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Settings, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import { useAdmin } from '../contexts/AdminContext';
import { ProfileModal } from './ProfileModal';
import { RequestsPage } from './RequestsPage';
import { ChatInterface } from './ChatInterface';
import LiveChat from './livechat/LiveChat.tsx';
import { ReligionClickService } from '../services/religionClicks';
import { Analytics } from '../services/analytics';

interface HomeProps {
  showRequests: boolean;
  onShowRequests: () => void;
  onHideRequests: () => void;
  onShowAdmin?: () => void;
}

export function Home({ showRequests, onShowRequests, onHideRequests, onShowAdmin }: HomeProps) {
  const { user, signOut } = useAuth();
  const { progress } = useUserProgress();
  const { isAdmin } = useAdmin();
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const religions = [
    { name: 'Christianity', emoji: '✝️', color: 'from-blue-500 to-blue-700' },
    { name: 'Islam', emoji: '☪️', color: 'from-green-500 to-green-700' },
    { name: 'Judaism', emoji: '✡️', color: 'from-purple-500 to-purple-700' },
    { name: 'Hinduism', emoji: '🕉️', color: 'from-orange-500 to-orange-700' },
    { name: 'Buddhism', emoji: '☸️', color: 'from-yellow-500 to-yellow-700' },
    { name: 'Sikhism', emoji: '☬', color: 'from-indigo-500 to-indigo-700' },
    { name: 'Bahá\'í Faith', emoji: '⭐', color: 'from-pink-500 to-pink-700' },
    { name: 'Jainism', emoji: '🤲', color: 'from-teal-500 to-teal-700' },
    { name: 'Shinto', emoji: '⛩️', color: 'from-red-500 to-red-700' },
    { name: 'Taoism', emoji: '☯️', color: 'from-gray-500 to-gray-700' },
    { name: 'Zoroastrianism', emoji: '🔥', color: 'from-amber-500 to-amber-700' },
    { name: 'African Traditional', emoji: '🌍', color: 'from-emerald-500 to-emerald-700' },
  ];

  useEffect(() => {
    // Track page visit
    Analytics.trackPageVisit('/');
  }, []);

  const handleReligionSelect = async (religion: string) => {
    setIsTransitioning(true);
    
    try {
      // Track religion click
      await ReligionClickService.incrementClick(religion);
      
      // Track analytics
      Analytics.trackReligionSelection(religion);
      
      setTimeout(() => {
        setSelectedReligion(religion);
        setIsTransitioning(false);
      }, 300);
    } catch (error) {
      console.error('Error tracking religion selection:', error);
      setSelectedReligion(religion);
      setIsTransitioning(false);
    }
  };

  const handleBackToHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedReligion(null);
      setIsTransitioning(false);
    }, 300);
  };

  if (showRequests) {
    return <RequestsPage onBack={onHideRequests} />;
  }

  if (selectedReligion) {
    return (
      <ChatInterface
        religion={selectedReligion}
        onBack={handleBackToHome}
        isTransitioning={isTransitioning}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="https://i.imgur.com/PlWBSjs.gif"
                alt="Religion Logo"
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Poiret One, sans-serif' }}>
                religion
              </h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLiveChat(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Live Chat</span>
              </button>

              <button
                onClick={onShowRequests}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
              </button>

              {isAdmin && onShowAdmin && (
                <button
                  onClick={onShowAdmin}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-300 text-white"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-300 text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome, {user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Choose a religion to start your spiritual conversation
          </p>
          
          {/* Progress Display */}
          {progress && Object.keys(progress).length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(progress).map(([religion, count]) => (
                  <div key={religion} className="text-center">
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-sm text-white/70 capitalize">{religion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Religion Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          {religions.map((religion) => (
            <button
              key={religion.name}
              onClick={() => handleReligionSelect(religion.name)}
              disabled={isTransitioning}
              className={`group relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${religion.color} hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {religion.emoji}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-white/90 transition-colors duration-300">
                  {religion.name}
                </h3>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/40 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Live Chat */}
      <LiveChat
        isVisible={showLiveChat}
        onClose={() => setShowLiveChat(false)}
      />
    </div>
  );
}