import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RequestsPage } from './RequestsPage';
import { ChatInterface } from './ChatInterface';
import { ReligionClickService, ReligionClickData } from '../services/religionClicks';
import { ProfileModal } from './ProfileModal';
import { UserProfileService, UserProfile } from '../services/userProfile';
import { useConfessions } from '../hooks/useConfessions';
import { HomeContent } from './Home/HomeContent';

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