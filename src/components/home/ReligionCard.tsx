import React from 'react';
import { Religion } from '../../config/religions';

interface ReligionCardProps {
  religion: Religion;
  onClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  className?: string;
}

export function ReligionCard({ religion, onClick, getClickCount, className = '' }: ReligionCardProps) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={religion.image}
        alt={religion.name}
        className="w-60 h-auto transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform active:scale-95"
        onClick={() => onClick(religion.name)}
      />
      <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
        {getClickCount(religion.name)}
      </div>
    </div>
  );
}