import React from 'react';
import { REQUESTED_RELIGIONS } from '../../config/religions';
import { ReligionCard } from './ReligionCard';

interface DesktopRequestedReligionsProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  showRequestedReligions: boolean;
  showConfessions: boolean;
  showTools: boolean;
}

export function DesktopRequestedReligions({
  onReligionClick,
  getClickCount,
  showRequestedReligions,
  showConfessions,
  showTools,
}: DesktopRequestedReligionsProps) {
  return (
    <div
      className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${
        showRequestedReligions && !showConfessions && !showTools
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-50 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-8">
        {REQUESTED_RELIGIONS.map((religion) => (
          <ReligionCard
            key={religion.name}
            religion={religion}
            onClick={onReligionClick}
            getClickCount={getClickCount}
          />
        ))}
        <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 w-60 h-40 flex items-center justify-center">
          <span
            className="text-white/60 text-center"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Vote for the next religion on X
          </span>
        </div>
      </div>
    </div>
  );
}