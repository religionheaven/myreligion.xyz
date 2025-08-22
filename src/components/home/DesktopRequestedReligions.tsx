import React from "react";
import { REQUESTED_RELIGIONS } from "../../config/religions";
import { ReligionCard } from "./ReligionCard";

interface DesktopRequestedReligionsProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  showRequestedReligions: boolean;
  showConfessions: boolean;
  showTools: boolean;
  isTransitioningFromChat: boolean;
  lastSelectedReligion: string | null;
  setShowRequestedReligions: (show: boolean) => void;
}

export function DesktopRequestedReligions({
  onReligionClick,
  getClickCount,
  showRequestedReligions,
  showConfessions,
  showTools,
  isTransitioningFromChat,
  lastSelectedReligion,
}: DesktopRequestedReligionsProps) {
  return (
    <div
      className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${
        showRequestedReligions && !showConfessions && !showTools
          ? "opacity-100 scale-100"
          : "opacity-0 scale-50 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-center gap-4 lg:gap-6 xl:gap-8 2xl:gap-12 px-4">
        {/* Back Button */}
        <button
          onClick={() => setShowRequestedReligions(false)}
          className="bg-black/50 backdrop-blur-sm text-white px-4 lg:px-6 xl:px-8 py-3 lg:py-4 rounded-xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span
            className="text-sm lg:text-base font-medium"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            back to religions
          </span>
        </button>
        
        {REQUESTED_RELIGIONS.map((religion) => (
          <ReligionCard
            key={religion.name}
            religion={religion}
            onClick={onReligionClick}
            getClickCount={getClickCount}
            isHighlighted={isTransitioningFromChat && lastSelectedReligion === religion.name}
            className="w-[clamp(180px,15vw,280px)] h-auto"
          />
        ))}
        <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-4 lg:p-6 xl:p-8 w-[clamp(180px,15vw,280px)] h-[clamp(120px,12vw,200px)] flex items-center justify-center">
          <span
            className="text-white/60 text-center text-sm lg:text-base"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Vote for the next religion on X
          </span>
        </div>
      </div>
    </div>
  );
}
