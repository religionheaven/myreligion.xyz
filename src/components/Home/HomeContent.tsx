import React from 'react';
import { LogOut, MessageCircle } from 'lucide-react';
import { ReligionClickData } from '../../services/religionClicks';
import { UserProfile } from '../../services/userProfile';
import { Confession, SortOption } from '../../services/confessions';
import { MobileReligionCards } from './MobileReligionCards';
import { DesktopReligionCards } from './DesktopReligionCards';
import { RequestedReligionCards } from './RequestedReligionCards';
import { ActionButtons } from './ActionButtons';
import { ProfileModal } from '../ProfileModal';
import LiveChat from '../LiveChat';
import { ConfessionsModal } from '../confessions/ConfessionsModal';

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

export function HomeContent({
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
            <div className="w-5 h-5 bg-white/60 rounded-full" />
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

      {/* Mobile Requested Religion and Confessions Buttons */}
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

      {/* Desktop Religion Cards */}
      <DesktopReligionCards
        onReligionClick={onReligionClick}
        getClickCount={getClickCount}
        isTransitioning={isTransitioning}
        showRequestedReligions={showRequestedReligions}
        showConfessions={showConfessions}
      />

      {/* Requested Religions Cards - Desktop */}
      <RequestedReligionCards
        onReligionClick={onReligionClick}
        getClickCount={getClickCount}
        showRequestedReligions={showRequestedReligions}
        showConfessions={showConfessions}
      />

      {/* Mobile Religion Cards */}
      <MobileReligionCards
        onReligionClick={onReligionClick}
        getClickCount={getClickCount}
        isTransitioning={isTransitioning}
        showRequestedReligions={showRequestedReligions}
        showConfessions={showConfessions}
      />

      {/* Action Buttons */}
      <ActionButtons
        showConfessions={showConfessions}
        showRequestedReligions={showRequestedReligions}
        setShowRequestedReligions={setShowRequestedReligions}
        setShowConfessions={setShowConfessions}
        setShowLiveChat={setShowLiveChat}
        onShowRequests={onShowRequests}
        onShowAdmin={onShowAdmin}
      />

      {/* Image at bottom right */}
      <div className={`absolute bottom-8 right-8 z-20 transition-opacity duration-300 ${showConfessions ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

      {/* Mobile Close Confessions Button */}
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