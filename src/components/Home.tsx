import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User, Cloud, MessageCircle, Shield, Settings, Users, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import { useAdmin } from '../contexts/AdminContext';
import { ProfileModal } from './ProfileModal';
import { RequestsPage } from './RequestsPage';
import { ChatInterface } from './ChatInterface';
import LiveChat from './livechat/LiveChat';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  const religions = [
    'Christianity',
    'Islam',
    'Judaism',
    'Hinduism',
    'Buddhism',
    'Sikhism',
    'Jainism',
    'Bahá\'í Faith',
    'Zoroastrianism',
    'Taoism',
    'Confucianism',
    'Shinto',
    'Indigenous Spirituality',
    'Paganism',
    'Wicca',
    'Rastafarianism',
    'Scientology',
    'Unitarianism',
    'Deism',
    'Agnosticism',
    'Atheism',
    'Secular Humanism',
  ];

  useEffect(() => {
    // Track analytics on component mount
    if (user) {
      Analytics.trackSiteVisit(user.id, user.id, '/');
    }
  }, [user]);

  const handleReligionSelect = async (religion: string) => {
    setIsTransitioning(true);
    
    // Track religion click
    await ReligionClickService.incrementClick(religion);
    
    setTimeout(() => {
      setSelectedReligion(religion);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedReligion(null);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSignOut = async () => {
    await signOut();
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img
                src="https://i.imgur.com/PlWBSjs.gif"
                alt="Religion Logo"
                className="w-8 h-8"
              />
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Poiret One, sans-serif' }}>
                religion
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLiveChat(!showLiveChat)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Live Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </button>
              
              <button
                onClick={onShowRequests}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Submit Request"
              >
                <Cloud className="w-5 h-5" />
              </button>
              
              {isAdmin && onShowAdmin && (
                <button
                  onClick={onShowAdmin}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Admin Panel"
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Faith
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Explore different religious perspectives and engage in meaningful conversations
            about faith, spirituality, and beliefs.
          </p>
        </div>

        {/* Religion Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {religions.map((religion) => (
            <button
              key={religion}
              onClick={() => handleReligionSelect(religion)}
              className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              disabled={isTransitioning}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {religion}
                </h3>
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
                  Explore {religion.toLowerCase()} teachings and perspectives
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Progress Indicator */}
        {progress && Object.keys(progress).length > 0 && (
          <div className="mt-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Journey</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(progress).map(([religion, data]) => (
                <div key={religion} className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">{religion}</h4>
                  <div className="text-sm text-white/70">
                    <p>Messages: {data.messageCount || 0}</p>
                    <p>Last visit: {data.lastVisit ? new Date(data.lastVisit).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Live Chat */}
      <LiveChat isVisible={showLiveChat} />

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}