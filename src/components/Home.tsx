import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RequestsPage } from './RequestsPage';
import { ChatInterface } from './ChatInterface';
import { ReligionClickService, ReligionClickData } from '../services/religionClicks';
import { ProfileModal } from './ProfileModal';
import { UserProfileService, UserProfile } from '../services/userProfile';
import LiveChat from './LiveChat';
import { ConfessionsModal } from './confessions/ConfessionsModal';
import { useConfessions } from '../hooks/useConfessions';

// Import new components
import { HomeHeader } from './home/HomeHeader';
import { HomeButtons } from './home/HomeButtons';
import { ToolsSection } from './home/ToolsSection';
import { DesktopReligionGrid } from './home/DesktopReligionGrid';
import { DesktopRequestedReligions } from './home/DesktopRequestedReligions';
import { MobileReligionCards } from './home/MobileReligionCards';
import { MobileRequestedReligionCards } from './home/MobileRequestedReligionCards';

interface HomeProps {
  showRequests?: boolean;
  onShowRequests?: () => void;
  onHideRequests?: () => void;
  onShowAdmin?: () => void;
}

export function Home({
  showRequests = false,
  onShowRequests,
  onHideRequests,
  onShowAdmin,
}: HomeProps) {
  const { signOut, user } = useAuth();
  const [selectedReligion, setSelectedReligion] = React.useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);
  const [clickCounts, setClickCounts] = React.useState<ReligionClickData[]>([]);
  const [loadingCounts, setLoadingCounts] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [showRequestedReligions, setShowRequestedReligions] = React.useState(false);
  const [showConfessions, setShowConfessions] = React.useState(false);
  const [showLiveChat, setShowLiveChat] = React.useState(false);
  const [showTools, setShowTools] = React.useState(false);
  const [selectedTool, setSelectedTool] = React.useState<'avatar' | 'discovery'>('avatar');

  // Use confessions hook
  const {
    confessions,
    confessionText,
    setConfessionText,
    isSubmittingConfession,
    handleSubmitConfession,
    confessionSortBy,
    setConfessionSortBy,
    loadingConfessions,
    handleVoteOnConfession,
    formatTimeAgo,
    loadConfessions,
    showWarning,
    warningMessage,
    isWarningFadingOut,
  } = useConfessions();

  // Load click counts on component mount
  React.useEffect(() => {
    const loadClickCounts = async () => {
      setLoadingCounts(true);
      await ReligionClickService.initializeClickCounts();
      const counts = await ReligionClickService.getAllClickCounts();
      setClickCounts(counts);
      setLoadingCounts(false);
    };

    loadClickCounts();
  }, []);

  // Load user profile
  React.useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        return;
      }

      const profile = await UserProfileService.getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      } else {
        const username = user.user_metadata?.username || 'User';
        const newProfile = await UserProfileService.initializeUserProfile(user.id, username);
        setUserProfile(newProfile);
      }
    };

    loadUserProfile();
  }, [user]);

  // Reset state when user signs out
  React.useEffect(() => {
    if (!user) {
      setSelectedReligion(null);
      setIsTransitioning(false);
      setIsExiting(false);
      setShowProfileModal(false);
      setUserProfile(null);
      setShowRequestedReligions(false);
      setShowTools(false);
    }
  }, [user]);

  // Load confessions when modal opens
  React.useEffect(() => {
    if (showConfessions) {
      loadConfessions();
    }
  }, [showConfessions]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    const updatedProfile = await UserProfileService.getUserProfile(user.id);
    setUserProfile(updatedProfile);
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleReligionClick = (religion: string) => {
    ReligionClickService.incrementClickCount(religion).then((success) => {
      if (success) {
        setClickCounts((prev) => {
          const existingItem = prev.find((item) => item.religion === religion);
          if (existingItem) {
            return prev.map((item) =>
              item.religion === religion ? { ...item, click_count: item.click_count + 1 } : item
            );
          } else {
            return [...prev, { religion, click_count: 1 }];
          }
        });
      }
    });

    setIsTransitioning(true);
    setIsExiting(false);
    setSelectedReligion(religion);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
  };

  const handleBackFromChat = () => {
    setIsTransitioning(true);
    setIsExiting(true);
    setTimeout(() => {
      setSelectedReligion(null);
      setIsTransitioning(false);
    }, 1200);
  };

  const handleToolsClick = () => {
    setShowTools(!showTools);
    if (!showTools) {
      setShowRequestedReligions(false);
      setShowConfessions(false);
      setShowLiveChat(false);
    }
  };

  const getClickCount = (religion: string) => {
    if (loadingCounts) return '...';
    const found = clickCounts.find((item) => item.religion === religion);
    return found?.click_count || 0;
  };

  if (showRequests) {
    return <RequestsPage onBack={onHideRequests || (() => {})} />;
  }

  if (selectedReligion) {
    return (
      <div className="relative">
        {/* Transition overlay */}
        <div
          className={`absolute inset-0 z-30 flex items-end justify-center pb-32 transition-all duration-500 ease-in-out ${
            isTransitioning ? 'opacity-100 delay-2000' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="text-center">
            <div className="relative mb-4">
              <img
                src="https://i.imgur.com/PlWBSjs.gif"
                alt="Religion Logo"
                className="w-24 h-auto mx-auto animate-pulse"
              />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-ping"></div>
            </div>
            <p
              className="text-white/80 text-sm animate-fade-in"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              {isExiting ? 'Exiting chat...' : `Opening ${selectedReligion} chat...`}
            </p>
            <div className="flex justify-center space-x-1 mt-2">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <ChatInterface
            religion={selectedReligion}
            onBack={handleBackFromChat}
            isTransitioning={isTransitioning}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            'url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNkanZobTJ2Y3FhNmJxdXdzaGw5NGl0aTh6bmVydHJ4aDB3MzRpOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FESFit0BwFBkk9rkLb/giphy.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: 'url(https://i.imgur.com/llHxOih.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header */}
      <HomeHeader
        onSignOut={handleSignOut}
        onShowProfile={() => setShowProfileModal(true)}
        userProfile={userProfile}
      />

      {/* Tools Section */}
      <ToolsSection
        showTools={showTools}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        handleToolsClick={handleToolsClick}
      />

      {/* Desktop Religion Grids */}
      <DesktopReligionGrid
        onReligionClick={handleReligionClick}
        getClickCount={getClickCount}
        isTransitioning={isTransitioning}
        showRequestedReligions={showRequestedReligions}
        showConfessions={showConfessions}
        showTools={showTools}
      />

      <DesktopRequestedReligions
        onReligionClick={handleReligionClick}
        getClickCount={getClickCount}
        showRequestedReligions={showRequestedReligions}
        showConfessions={showConfessions}
        showTools={showTools}
      />

      {/* Mobile Religion Cards */}
      {!showRequestedReligions && (
        <div
          className={`transition-opacity duration-300 ${
            showConfessions ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <MobileReligionCards
            onReligionClick={handleReligionClick}
            getClickCount={getClickCount}
            isTransitioning={isTransitioning}
          />
        </div>
      )}

        style={{
          backgroundImage: 'url(https://i.imgur.com/ocIai0k.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      {/* Mobile Requested Religion Cards */}
      {showRequestedReligions && !showConfessions && (
        <div className="absolute inset-0 z-10 md:hidden flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center px-8">
            <MobileRequestedReligionCards
              onReligionClick={handleReligionClick}
      {/* All Buttons */}
      <HomeButtons
        showRequestedReligions={showRequestedReligions}
        setShowRequestedReligions={setShowRequestedReligions}
        showConfessions={showConfessions}
        setShowConfessions={setShowConfessions}
        setShowLiveChat={setShowLiveChat}
        onShowRequests={onShowRequests}
        onShowAdmin={onShowAdmin}
        showTools={showTools}
      />

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdate={handleProfileUpdate}
      />

      {showLiveChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative flex flex-col items-center">
            <div className="w-full max-w-5xl px-4">
              <LiveChat isVisible={true} />
            </div>
            <button
              onClick={() => setShowLiveChat(false)}
              className="mt-4 bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-black/90 transition-all duration-300 hover:scale-105 border border-white/20"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              Close Chat
            </button>
          </div>
        </div>
      )}

      <ConfessionsModal
        showConfessions={showConfessions}
        confessions={confessions}
        confessionText={confessionText}
        setConfessionText={setConfessionText}
        isSubmittingConfession={isSubmittingConfession}
        handleSubmitConfession={handleSubmitConfession}
        confessionSortBy={confessionSortBy}
        setConfessionSortBy={setConfessionSortBy}
        loadingConfessions={loadingConfessions}
        handleVoteOnConfession={handleVoteOnConfession}
        formatTimeAgo={formatTimeAgo}
        showWarning={showWarning}
        warningMessage={warningMessage}
        isWarningFadingOut={isWarningFadingOut}
      />

      {showConfessions && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
          <button
            onClick={() => setShowConfessions(false)}
            className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-black/90 transition-all duration-300 hover:scale-105 border border-white/20"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Close Confessions
          </button>
        </div>
      )}
    </div>
  );
}