import React from 'react';
import { LogOut, User, MessageCircle, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RequestsPage } from './RequestsPage';
import { ChatInterface } from './ChatInterface';
import { ReligionClickService, ReligionClickData } from '../services/religionClicks';
import { ProfileModal } from './ProfileModal';
import { UserProfileService, UserProfile } from '../services/userProfile';
import LiveChat from './LiveChat';
import { ConfessionsModal } from './confessions/ConfessionsModal';
import { useConfessions } from '../hooks/useConfessions';
import { AvatarTool } from './tools/AvatarTool';
import { DiscoveryTool } from './tools/DiscoveryTool';

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

  // Live chat visibility state
  const [showLiveChat, setShowLiveChat] = React.useState(false);

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

      // Initialize click counts if they don't exist
      await ReligionClickService.initializeClickCounts();

      // Load current counts
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
        // Initialize profile if it doesn't exist
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
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    // Reload profile after update
    const updatedProfile = await UserProfileService.getUserProfile(user.id);
    setUserProfile(updatedProfile);
  };

  // Load confessions when modal opens
  React.useEffect(() => {
    if (showConfessions) {
      loadConfessions();
    }
  }, [showConfessions]);

  const handleSignOut = () => {
    signOut();
  };

  const handleReligionClick = (religion: string) => {
    // Increment click count
    ReligionClickService.incrementClickCount(religion).then((success) => {
      if (success) {
        // Update local state
        setClickCounts((prev) =>
          {
            const existingItem = prev.find(item => item.religion === religion);
            if (existingItem) {
              // Update existing item
              return prev.map((item) =>
                item.religion === religion ? { ...item, click_count: item.click_count + 1 } : item,
              );
            } else {
              // Add new item if it doesn't exist
              return [...prev, { religion, click_count: 1 }];
            }
          }
        );
      }
    });

    setIsTransitioning(true);
    setIsExiting(false);
    // Immediate transition to chat with morphing effect
    setSelectedReligion(religion);
    // Small delay to allow the morph to complete
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
  };

  const handleBackFromChat = () => {
    setIsTransitioning(true);
    setIsExiting(true);
    // Small delay for smooth transition back
    setTimeout(() => {
      setSelectedReligion(null);
      setIsTransitioning(false);
    }, 1200);
  };

  if (showRequests) {
    return <RequestsPage onBack={onHideRequests || (() => {})} />;
  }

  if (selectedReligion) {
    return (
      <div className="relative">
        {/* Keep home screen rendered but hidden during transition */}
        <div
          className={`transition-all duration-700 ease-in-out ${
            isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
          }`}
        >
          <HomeContent
            onReligionClick={handleReligionClick}
            onShowRequests={onShowRequests}
            onSignOut={handleSignOut}
            isTransitioning={false}
            clickCounts={clickCounts}
            loadingCounts={loadingCounts}
            showProfileModal={showProfileModal}
            setShowProfileModal={setShowProfileModal}
            userProfile={userProfile}
            onProfileUpdate={handleProfileUpdate}
            showLiveChat={showLiveChat}
            setShowLiveChat={setShowLiveChat}
            showRequestedReligions={showRequestedReligions}
            setShowRequestedReligions={setShowRequestedReligions}
            showConfessions={showConfessions}
            setShowConfessions={setShowConfessions}
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
        </div>

        {/* Transition overlay - shows during morphing */}
        <div
          className={`absolute inset-0 z-30 flex items-end justify-center pb-32 transition-all duration-500 ease-in-out ${
            isTransitioning ? 'opacity-100 delay-2000' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="text-center">
            {/* Animated logo during transition */}
            <div className="relative mb-4">
              <img
                src="https://i.imgur.com/PlWBSjs.gif"
                alt="Religion Logo"
                className="w-24 h-auto mx-auto animate-pulse"
              />
              {/* Radial glow effect */}
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-ping"></div>
            </div>

            {/* Loading text */}
            <p
              className="text-white/80 text-sm animate-fade-in"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              {isExiting ? 'Exiting chat...' : `Opening ${selectedReligion} chat...`}
            </p>

            {/* Animated dots */}
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

        {/* Chat interface */}
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
    <HomeContent
      onReligionClick={handleReligionClick}
      onShowRequests={onShowRequests}
      onShowAdmin={onShowAdmin}
      onHideRequests={onHideRequests}
      onSignOut={handleSignOut}
      isTransitioning={isTransitioning}
      clickCounts={clickCounts}
      loadingCounts={loadingCounts}
      showProfileModal={showProfileModal}
      setShowProfileModal={setShowProfileModal}
      userProfile={userProfile}
      onProfileUpdate={handleProfileUpdate}
      showLiveChat={showLiveChat}
      setShowLiveChat={setShowLiveChat}
      showRequestedReligions={showRequestedReligions}
      setShowRequestedReligions={setShowRequestedReligions}
      showConfessions={showConfessions}
      setShowConfessions={setShowConfessions}
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
  );
}

interface HomeContentProps {
  onReligionClick: (religion: string) => void;
  onShowRequests?: () => void;
  onShowAdmin?: () => void;
  onHideRequests?: () => void;
  onSignOut: () => void;
  isTransitioning: boolean;
  clickCounts: ReligionClickData[];
  loadingCounts: boolean;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  userProfile: UserProfile | null;
  onProfileUpdate: () => Promise<void>;
  showLiveChat: boolean;
  setShowLiveChat: (show: boolean) => void;
  showRequestedReligions: boolean;
  setShowRequestedReligions: (show: boolean) => void;
  confessions: Confession[];
  confessionText: string;
  setConfessionText: (text: string) => void;
  isSubmittingConfession: boolean;
  handleSubmitConfession: () => void;
  confessionSortBy: SortOption;
  setConfessionSortBy: (sort: SortOption) => void;
  loadingConfessions: boolean;
  handleVoteOnConfession: (confessionId: string, voteType: 'upvote' | 'downvote') => void;
  formatTimeAgo: (timestamp: string) => string;
  showConfessions: boolean;
  setShowConfessions: (show: boolean) => void;
  showWarning: boolean;
  warningMessage: string;
  isWarningFadingOut: boolean;
}

interface MobileReligionCardsProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  isTransitioning: boolean;
}

function MobileReligionCards({
  onReligionClick,
  getClickCount,
  isTransitioning,
}: MobileReligionCardsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const religions = [
    { name: 'Christianity', image: 'https://i.imgur.com/KLkXhhW.png' },
    { name: 'Judaism', image: 'https://i.imgur.com/WaBoB1X.png' },
    { name: 'Islam', image: 'https://i.imgur.com/JkLEbS3.png' },
    { name: 'Hinduism', image: 'https://i.imgur.com/fhaXuTH.png' },
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < religions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div
      className={`absolute inset-0 z-10 md:hidden flex items-center justify-center transition-all duration-700 ease-in-out ${isTransitioning ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
    >
      <div className="w-full h-full flex items-center justify-center px-8">
        <div
          className="relative w-full max-w-xs h-80 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Cards container */}
          <div
            className="flex transition-transform duration-300 ease-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {religions.map((religion, index) => (
              <div
                key={religion.name}
                className="w-full flex-shrink-0 h-full flex items-center justify-center"
              >
                <div className="relative w-3/4 h-3/4">
                  <img
                    src={religion.image}
                    alt={religion.name}
                    className="w-full h-full object-contain cursor-pointer transition-all duration-300 hover:scale-105"
                    onClick={() => onReligionClick(religion.name)}
                  />
                  <div className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm text-black text-sm font-bold px-3 py-2 rounded-full border border-white/50 shadow-lg">
                    {getClickCount(religion.name)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {religions.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white shadow-lg scale-110'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          {/* Swipe indicators */}
          {currentIndex > 0 && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
              ←
            </div>
          )}
          {currentIndex < religions.length - 1 && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
              →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HomeContent({
  onReligionClick,
  onShowRequests,
  onShowAdmin,
  onHideRequests,
  onSignOut,
  isTransitioning,
  clickCounts,
  loadingCounts,
  showProfileModal,
  setShowProfileModal,
  userProfile,
  onProfileUpdate,
  showLiveChat,
  setShowLiveChat,
  showRequestedReligions,
  setShowRequestedReligions,
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
  showConfessions,
  setShowConfessions,
  showWarning,
  warningMessage,
  isWarningFadingOut,
}: HomeContentProps) {
  const [showTools, setShowTools] = React.useState(false);
  const [selectedTool, setSelectedTool] = React.useState<'avatar' | 'discovery'>('avatar');

  const getClickCount = (religion: string) => {
    if (loadingCounts) return '...';
    const found = clickCounts.find((item) => item.religion === religion);
    return found?.click_count || 0;
  };

  const handleToolsClick = () => {
    setShowTools(!showTools);
    // Close other modals when tools is activated
    if (!showTools) {
      setShowRequestedReligions(false);
      setShowConfessions(false);
      setShowLiveChat(false);
    }
  };

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

      {/* Sign out button at top left */}
      <div className="absolute top-8 left-8 z-30">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Profile button at top right */}
      <div className="absolute top-8 right-8 z-30">
        <button
          onClick={() => setShowProfileModal(true)}
          className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          {userProfile?.profile_photo_url ? (
            <img
              src={userProfile.profile_photo_url}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Logo at top middle */}
      <div className="relative z-20 pt-8 flex justify-center">
        <div className="relative">
          <img src="https://i.imgur.com/PlWBSjs.gif" alt="Religion Logo" className="w-32 h-auto" />
          <a
            href="https://heaven.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-2 bg-transparent cursor-pointer hover:bg-white/5 transition-all duration-300 rounded-lg"
            aria-label="Visit Heaven.xyz"
          />
        </div>
      </div>

      {/* Powered by heaven text */}
      <div className="relative z-10 flex justify-center mt-2">
        <p className="text-white/60 text-xs md:text-sm" style={{ fontFamily: 'Poiret One, sans-serif' }}>
          powered by heaven
        </p>
      </div>

      {/* Tools Button - Desktop Only, positioned above cards */}
      <div className="relative z-20 flex justify-center mt-8 hidden md:flex">
        <button
          onClick={handleToolsClick}
          className="bg-black/50 backdrop-blur-sm text-white px-8 py-4 rounded-2xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105"
        >
          <span className="text-lg font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            {showTools ? 'close tools' : 'tools'}
          </span>
        </button>
      </div>

      {/* Tool Navigation Buttons - Only show when tools window is open */}
      <div
        className={`relative z-20 flex justify-center mt-4 hidden md:flex transition-all duration-500 ease-in-out ${
          showTools ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-8">
          <button
            onClick={() => setSelectedTool('avatar')}
            className={`text-xl font-medium transition-colors duration-200 ${
              selectedTool === 'avatar'
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Avatar
          </button>
          <span className="text-white/40 text-xl">|</span>
          <button
            onClick={() => setSelectedTool('discovery')}
            className={`text-xl font-medium transition-colors duration-200 ${
              selectedTool === 'discovery'
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Discovery
          </button>
        </div>
      </div>

      {/* Tools Window - Large black window that opens below tools button */}
      <div
        className={`absolute top-80 left-8 right-8 bottom-16 z-15 bg-black/50 backdrop-blur-xl rounded-3xl border border-white/30 transition-all duration-500 ease-in-out hidden md:block ${
          showTools ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className={`p-8 h-full ${showTools ? '' : 'pointer-events-none'}`}>
          <div className="h-full">
            {selectedTool === 'avatar' && <AvatarTool />}
            {selectedTool === 'discovery' && <DiscoveryTool />}
          </div>
        </div>
      </div>

      {/* Mobile Requested Religion and Confessions Buttons - positioned below "powered by heaven" */}
      <div className="relative z-20 flex justify-center mt-4 md:hidden">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setShowRequestedReligions(!showRequestedReligions)}
            className={`bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 ${showConfessions ? 'hidden' : 'block'}`}
          >
            <span className="text-sm font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              {showRequestedReligions ? 'back' : 'requested religions'}
            </span>
          </button>
          <button
            onClick={() => setShowConfessions(!showConfessions)}
            className={`bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 ${showConfessions ? 'hidden' : 'block'}`}
          >
            <span className="text-sm font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              confessions
            </span>
          </button>
        </div>
      </div>

      {/* Center image in true middle of page */}
      {/* Desktop: Center images in grid */}
      <div
        className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${isTransitioning || showRequestedReligions || showConfessions || showTools ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
      >
        <div className="flex items-center gap-8">
          <div className="relative">
            <img
              src="https://i.imgur.com/KLkXhhW.png"
              alt="Christianity"
              className="w-60 h-auto transition-all duration-700 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform"
              onClick={() => onReligionClick('Christianity')}
            />
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
              {getClickCount('Christianity')}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://i.imgur.com/WaBoB1X.png"
              alt="Judaism"
              className="w-60 h-auto transition-all duration-700 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform"
              onClick={() => onReligionClick('Judaism')}
            />
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
              {getClickCount('Judaism')}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://i.imgur.com/JkLEbS3.png"
              alt="Islam"
              className="w-60 h-auto transition-all duration-700 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform"
              onClick={() => onReligionClick('Islam')}
            />
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
              {getClickCount('Islam')}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://i.imgur.com/fhaXuTH.png"
              alt="Hinduism"
              className="w-60 h-auto transition-all duration-700 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform"
              onClick={() => onReligionClick('Hinduism')}
            />
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
              {getClickCount('Hinduism')}
            </div>
          </div>
        </div>
      </div>

      {/* Requested Religions Cards - Desktop */}
      <div
        className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${showRequestedReligions && !showConfessions && !showTools ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
      >
        <div className="flex items-center gap-8">
          <div className="relative">
            <img
              src="https://i.imgur.com/5eZqdQy.png"
              alt="Nga"
              className="w-60 h-auto transition-all duration-700 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform"
              onClick={() => onReligionClick('Nga')}
            />
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
              {getClickCount('Nga')}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 w-60 h-40 flex items-center justify-center">
            <span className="text-white/60 text-center" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Vote for the next religion on X
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 w-60 h-40 flex items-center justify-center">
            <span className="text-white/60 text-center" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Vote for the next religion on X
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 w-60 h-40 flex items-center justify-center">
            <span className="text-white/60 text-center" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Vote for the next religion on X
            </span>
          </div>
        </div>
      </div>

      {/* Requested Religion Button - positioned below religion cards */}
      <div className={`absolute bottom-72 left-1/2 transform -translate-x-1/2 z-20 hidden md:block transition-opacity duration-300 ${showConfessions || showTools ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => setShowRequestedReligions(!showRequestedReligions)}
          className="bg-black/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span className="text-base font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            {showRequestedReligions ? 'back' : 'requested religions'}
          </span>
        </button>
      </div>

      {/* Confessions Button - positioned below requested religions button */}
      <div className={`absolute bottom-56 left-1/2 transform -translate-x-1/2 z-20 hidden md:block transition-opacity duration-300 ${showTools ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => setShowConfessions(!showConfessions)}
          className="bg-black/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span className="text-base font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            {showConfessions ? 'close confessions' : 'confessions'}
          </span>
        </button>
      </div>

      {/* Live Chat Button - positioned below cards */}
      <div className={`absolute bottom-40 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ${showConfessions || showTools ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => setShowLiveChat(true)}
          className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 md:px-6 md:py-3 rounded-xl border border-white/20 hover:bg-black/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-xs md:text-sm font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            heaven, live
          </span>
        </button>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdate={onProfileUpdate}
      />

      {/* Live Chat */}
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

      {/* Mobile: Swipeable full-screen cards */}
      {!showRequestedReligions && (
        <div className={`transition-opacity duration-300 ${showConfessions ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <MobileReligionCards
            onReligionClick={onReligionClick}
            getClickCount={getClickCount}
            isTransitioning={isTransitioning}
          />
        </div>
      )}

      {/* Requested Religions Cards - Mobile */}
      {showRequestedReligions && !showConfessions && (
        <div className="absolute inset-0 z-10 md:hidden flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center px-8">
            <div className="relative w-full max-w-xs h-80 overflow-hidden">
              {/* Cards container */}
              <div className="flex transition-transform duration-300 ease-out h-full">
                <div className="w-full flex-shrink-0 h-full flex items-center justify-center">
                  <div className="relative w-3/4 h-3/4">
                    <img
                      src="https://i.imgur.com/5eZqdQy.png"
                      alt="Nga"
                      className="w-full h-full object-contain cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => onReligionClick('Nga')}
                    />
                    <div className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm text-black text-sm font-bold px-3 py-2 rounded-full border border-white/50 shadow-lg">
                      {getClickCount('Nga')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests button at bottom */}
      <div className={`absolute bottom-8 left-8 z-20 transition-opacity duration-300 ${showConfessions || showTools ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex gap-3">
          <button
            onClick={onShowRequests || (() => {})}
            className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-black/40 transition-all duration-300 hover:scale-105"
          >
            <span
              className="text-base font-medium"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              requests
            </span>
          </button>

          {onShowAdmin && (
            <button
              onClick={onShowAdmin}
              className="bg-red-500/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-red-400/20 hover:bg-red-500/40 transition-all duration-300 hover:scale-105"
            >
              <span
                className="text-base font-medium"
                style={{ fontFamily: 'Poiret One, sans-serif' }}
              >
                admin
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Image at bottom right */}
      <div className={`absolute bottom-8 right-8 z-20 transition-opacity duration-300 ${showConfessions || showTools ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <a
          href="https://x.com/religionheaven"
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-all duration-300 hover:scale-105"
        >
          <img
            src="https://i.imgur.com/HIhlm3m.png"
            alt="Religion Heaven Twitter"
            className="w-auto h-12"
          />
        </a>
      </div>

      {/* Confessions Modal */}
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

      {/* Mobile Close Confessions Button - Below Modal */}
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