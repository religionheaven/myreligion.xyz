import React from "react";

import { useAuth } from "../contexts/AuthContext";
import { RequestsPage } from "./RequestsPage";
import { ChatInterface } from "./ChatInterface";
import LiveChat from "./livechat";
import { ReligionClickService, ReligionClickData } from "../services/religionClicks";
import { ProfileModal } from "./ProfileModal";
import { UserProfileService, UserProfile } from "../services/userProfile";
import { useConfessions } from "../hooks/useConfessions";
import { ConfessionsModal } from "./confessions/ConfessionsModal";

// Import new components
import { HomeHeader } from "./home/HomeHeader";
import { HomeButtons } from "./home/HomeButtons";
import { ToolsSection } from "./home/ToolsSection";
import { DesktopReligionGrid } from "./home/DesktopReligionGrid";
import { DesktopRequestedReligions } from "./home/DesktopRequestedReligions";
import { MobileReligionCards } from "./home/MobileReligionCards";
import { MobileRequestedReligionCards } from "./home/MobileRequestedReligionCards";

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
  const [selectedTool, setSelectedTool] = React.useState<"avatar" | "discovery">("avatar");
  const [isTransitioningToChat, setIsTransitioningToChat] = React.useState(false);
  const [isTransitioningFromChat, setIsTransitioningFromChat] = React.useState(false);
  const [lastSelectedReligion, setLastSelectedReligion] = React.useState<string | null>(null);

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
        const username = user.user_metadata?.username || "User";
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
    // Start transition animation
    setIsTransitioningToChat(true);

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

    // Delay setting the religion to allow animation to start
    setTimeout(() => {
      setSelectedReligion(religion);
      setLastSelectedReligion(religion);
      setIsTransitioningToChat(false);
    }, 300);
  };

  const handleBackFromChat = () => {
    // Start back transition animation
    setIsTransitioningFromChat(true);

    // Clear the selected religion after a delay to show the animation
    setTimeout(() => {
      setIsTransitioningFromChat(false);
      setLastSelectedReligion(null);
    }, 600); // Longer delay to show the animation

    setSelectedReligion(null);
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
    if (loadingCounts) return "...";
    const found = clickCounts.find((item) => item.religion === religion);
    return found?.click_count || 0;
  };

  if (showRequests) {
    return <RequestsPage onBack={onHideRequests || (() => {})} />;
  }

  if (selectedReligion) {
    return (
      <ChatInterface
        religion={selectedReligion}
        onBack={handleBackFromChat}
        isTransitioning={false}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            "url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNkanZobTJ2Y3FhNmJxdXdzaGw5NGl0aTh6bmVydHJ4aDB3MzRpOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FESFit0BwFBkk9rkLb/giphy.gif)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: "url(https://i.imgur.com/llHxOih.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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
        isTransitioning={isTransitioningToChat}
        showRequestedReligions={showRequestedReligions}
        setShowRequestedReligions={setShowRequestedReligions}
        showConfessions={showConfessions}
        showTools={showTools}
        isTransitioningFromChat={isTransitioningFromChat}
        lastSelectedReligion={lastSelectedReligion}
      />

      <DesktopRequestedReligions
        onReligionClick={handleReligionClick}
        getClickCount={getClickCount}
        showRequestedReligions={showRequestedReligions}
        showConfessions={showConfessions}
        showTools={showTools}
        isTransitioningFromChat={isTransitioningFromChat}
        lastSelectedReligion={lastSelectedReligion}
      />

      {/* Mobile Religion Cards */}
      {!showRequestedReligions && (
        <div
          className={`transition-opacity duration-300 ${
            showConfessions ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <MobileReligionCards
            onReligionClick={handleReligionClick}
            getClickCount={getClickCount}
            isTransitioning={isTransitioningToChat}
          />
        </div>
      )}

      {/* Mobile Requested Religion Cards */}
      {showRequestedReligions && !showConfessions && (
        <div className="absolute inset-0 z-10 md:hidden flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center px-8">
            <MobileRequestedReligionCards
              onReligionClick={handleReligionClick}
              getClickCount={getClickCount}
            />
          </div>
        </div>
      )}

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
              style={{ fontFamily: "Poiret One, sans-serif" }}
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
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60 md:hidden">
          <button
            onClick={() => setShowConfessions(false)}
            className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-medium hover:bg-black/90 transition-all duration-300 hover:scale-105 border border-white/20"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Close Confessions
          </button>
        </div>
      )}
    </div>
  );
}
