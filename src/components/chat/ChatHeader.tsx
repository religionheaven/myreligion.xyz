import React from "react";
import { ArrowLeft, LogOut } from "lucide-react";

interface ChatHeaderProps {
  onBack: () => void;
  onSignOut: () => void;
}

export function ChatHeader({ onBack, onSignOut }: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 pt-8 pb-4">
      {/* Back button at top left */}
      <div className="absolute top-8 left-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-500 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Sign out button at top right */}
      <div className="absolute top-8 right-8">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Logo at top center */}
      <div className="flex justify-center">
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
      <div className="hidden md:flex justify-center mt-2">
        <p className="text-white/60 text-xs" style={{ fontFamily: "Poiret One, sans-serif" }}>
          powered by heaven
        </p>
      </div>
    </div>
  );
}
