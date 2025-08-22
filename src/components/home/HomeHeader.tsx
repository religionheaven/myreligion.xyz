import React from "react";
import { LogOut, User } from "lucide-react";
import { UserProfile } from "../../services/userProfile";

interface HomeHeaderProps {
  onSignOut: () => void;
  onShowProfile: () => void;
  userProfile: UserProfile | null;
}

export function HomeHeader({ onSignOut, onShowProfile, userProfile }: HomeHeaderProps) {
  return (
    <>
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
          onClick={onShowProfile}
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
        <p
          className="text-white/60 text-xs md:text-sm"
          style={{ fontFamily: "Poiret One, sans-serif" }}
        >
          powered by heaven
        </p>
      </div>
    </>
  );
}
