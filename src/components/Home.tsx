import React from 'react';
import { LogOut, User, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RequestsPage } from './RequestsPage';
import { ChatInterface } from './ChatInterface';
import { ReligionClickService, ReligionClickData } from '../services/religionClicks';
import { ProfileModal } from './ProfileModal';
import { UserProfileService, UserProfile } from '../services/userProfile';
import LiveChat from './LiveChat';

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

  // Live chat visibility state
  const [showLiveChat, setShowLiveChat] = React.useState(false);

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
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    // Reload profile after update
    const updatedProfile = await UserProfileService.getUserProfile(user.id);
    setUserProfile(updatedProfile);
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      signOut();
    }
  };

  const handleReligionClick = (religion: string) => {
    // Increment click count
    ReligionClickService.incrementClickCount(religion).then((success) => {
      if (success) {
        // Update local state
        setClickCounts((prev) =>
          prev.map((item) =>
            item.religion === religion ? { ...item, click_count: item.click_count + 1 } : item,
          ),
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
            onSignOut={signOut}
            isTransitioning={false}
            clickCounts={clickCounts}
            loadingCounts={loadingCounts}
            showProfileModal={showProfileModal}
            setShowProfileModal={setShowProfileModal}
            userProfile={userProfile}
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
      onSignOut={signOut}
      isTransitioning={isTransitioning}
      clickCounts={clickCounts}
      loadingCounts={loadingCounts}
      showProfileModal={showProfileModal}
      setShowProfileModal={setShowProfileModal}
      userProfile={userProfile}
      onProfileUpdate={handleProfileUpdate}
      showLiveChat={showLiveChat}
      setShowLiveChat={setShowLiveChat}
    />
  );
}

interface HomeContentProps {
  onReligionClick: (religion: string) => void;
  onShowRequests?: () => void;
  onShowAdmin?: () => void;
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
}: HomeContentProps) {
  const getClickCount = (religion: string) => {
    if (loadingCounts) return '...';
    const found = clickCounts.find((item) => item.religion === religion);
    return found?.click_count || 0;
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
          onClick={(e) => {
            console.log('Sign out clicked!');
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to sign out?')) {
              onSignOut();
            }
          }}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
          type="button"
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Profile button at top right */}
      <div className="absolute top-8 right-8 z-20">
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
        <p className="text-white/60 text-xs" style={{ fontFamily: 'Poiret One, sans-serif' }}>
          powered by heaven
        </p>
      </div>

      {/* Center image in true middle of page */}
      {/* Desktop: Center images in grid */}
      <div
        className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${isTransitioning ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
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

      {/* Live Chat Button - positioned below cards */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={() => setShowLiveChat(true)}
          className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-black/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
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
      <MobileReligionCards
        onReligionClick={onReligionClick}
        getClickCount={getClickCount}
        isTransitioning={isTransitioning}
      />

      {/* Requests button at bottom */}
      <div className="absolute bottom-8 left-8 z-20">
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
      <div className="absolute bottom-8 right-8 z-20">
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
    </div>
  );
}
