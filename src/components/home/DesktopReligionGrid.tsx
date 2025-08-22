import React from "react";
import { MAIN_RELIGIONS } from "../../config/religions";
import { ReligionCard } from "./ReligionCard";

interface DesktopReligionGridProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  isTransitioning: boolean;
  showRequestedReligions: boolean;
  setShowRequestedReligions: (show: boolean) => void;
  showConfessions: boolean;
  showTools: boolean;
  isTransitioningFromChat: boolean;
  lastSelectedReligion: string | null;
}

export function DesktopReligionGrid({
  onReligionClick,
  getClickCount,
  isTransitioning,
  showRequestedReligions,
  setShowRequestedReligions,
  showConfessions,
  showTools,
  isTransitioningFromChat,
  lastSelectedReligion,
}: DesktopReligionGridProps) {
  return (
    <div
      className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${
        (isTransitioning && !isTransitioningFromChat) ||
        showRequestedReligions ||
        showConfessions ||
        showTools
          ? "opacity-0 scale-75 translate-y-8 pointer-events-none"
          : "opacity-100 scale-100 translate-y-0"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4 lg:gap-6 xl:gap-8 2xl:gap-12 px-4">
        {/* Requested Religions Button */}
        <button
          onClick={() => setShowRequestedReligions(!showRequestedReligions)}
          className="bg-black/50 backdrop-blur-sm text-white px-4 lg:px-6 xl:px-8 py-3 lg:py-4 rounded-xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <span
            className="text-sm lg:text-base font-medium"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            {showRequestedReligions ? "religions" : "requested religions"}
          </span>
        </button>
        
        {/* Religion Cards */}
        <div className="flex items-center justify-center gap-4 lg:gap-6 xl:gap-8 2xl:gap-12">
        {MAIN_RELIGIONS.map((religion) => (
          <ReligionCard
            key={religion.name}
            religion={religion}
            onClick={onReligionClick}
            getClickCount={getClickCount}
            isHighlighted={isTransitioningFromChat && lastSelectedReligion === religion.name}
            className="w-[clamp(180px,15vw,280px)] h-auto"
          />
        ))}
        </div>
      </div>
    </div>
  );
}
