import React from 'react';
import { Religion } from '../../config/religions';

interface ReligionCardProps {
  religion: Religion;
  onClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  className?: string;
  isHighlighted?: boolean;
}

export function ReligionCard({ religion, onClick, getClickCount, className = '', isHighlighted = false }: ReligionCardProps) {
  return (
    <div className={`relative ${className}`}>
      <img
        src={religion.image}
        alt={religion.name}
        className={`w-full h-auto transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 rounded-lg cursor-pointer transform active:scale-95 ${
          isHighlighted 
            ? 'border-white/80 shadow-2xl shadow-white/50 scale-110 animate-pulse' 
            : 'border-transparent hover:border-white/80'
        }`}
        onClick={() => onClick(religion.name)}
      />
      <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs lg:text-sm font-bold px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full border border-white/50 shadow-lg">
        {getClickCount(religion.name)}
      </div>
    </div>
  );
}