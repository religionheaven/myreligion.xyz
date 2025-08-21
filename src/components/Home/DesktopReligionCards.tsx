import React from 'react';

interface DesktopReligionCardsProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  isTransitioning: boolean;
  showRequestedReligions: boolean;
  showConfessions: boolean;
}

export function DesktopReligionCards({
  onReligionClick,
  getClickCount,
  isTransitioning,
  showRequestedReligions,
  showConfessions,
}: DesktopReligionCardsProps) {
  return (
    <div
      className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${isTransitioning || showRequestedReligions || showConfessions ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
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
  );
}