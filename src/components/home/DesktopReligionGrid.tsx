import React from 'react';
import { MAIN_RELIGIONS } from '../../config/religions';
import { ReligionCard } from './ReligionCard';

interface DesktopReligionGridProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  isTransitioning: boolean;
  showRequestedReligions: boolean;
  showConfessions: boolean;
  showTools: boolean;
}

export function DesktopReligionGrid({
  onReligionClick,
  getClickCount,
  isTransitioning,
  showRequestedReligions,
  showConfessions,
  showTools,
}: DesktopReligionGridProps) {
  return (
    <div
      className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${
        isTransitioning || showRequestedReligions || showConfessions || showTools
          ? 'opacity-0 scale-75 translate-y-8'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
    >
      <div className="flex items-center gap-8">
        {MAIN_RELIGIONS.map((religion) => (
          <ReligionCard
            key={religion.name}
            religion={religion}
            onClick={onReligionClick}
            getClickCount={getClickCount}
          />
        ))}
      </div>
    </div>
  );
}