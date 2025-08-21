import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ActionButtonsProps {
  showConfessions: boolean;
  showRequestedReligions: boolean;
  setShowRequestedReligions: (show: boolean) => void;
  setShowConfessions: (show: boolean) => void;
  setShowLiveChat: (show: boolean) => void;
  onShowRequests?: () => void;
  onShowAdmin?: () => void;
}

export function ActionButtons({
  showConfessions,
  showRequestedReligions,
  setShowRequestedReligions,
  setShowConfessions,
  setShowLiveChat,
  onShowRequests,
  onShowAdmin,
}: ActionButtonsProps) {
  return (
    <>
      {/* Requested Religion Button - Desktop */}
      <div className={`absolute bottom-40 left-1/2 transform -translate-x-1/2 z-20 hidden md:block transition-opacity duration-300 ${showConfessions ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => setShowRequestedReligions(!showRequestedReligions)}
          className="bg-black/50 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span className="text-sm font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            {showRequestedReligions ? 'back' : 'requested religions'}
          </span>
        </button>
      </div>

      {/* Confessions Button - Desktop */}
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20 hidden md:block transition-opacity duration-300">
        <button
          onClick={() => setShowConfessions(!showConfessions)}
          className="bg-black/50 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span className="text-sm font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            {showConfessions ? 'close confessions' : 'confessions'}
          </span>
        </button>
      </div>

      {/* Live Chat Button */}
      <div className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ${showConfessions ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

      {/* Requests and Admin buttons at bottom left */}
      <div className={`absolute bottom-8 left-8 z-20 transition-opacity duration-300 ${showConfessions ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
    </>
  );
}