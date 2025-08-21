import React from 'react';

interface RequestedReligionCardsProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  showRequestedReligions: boolean;
  showConfessions: boolean;
}

export function RequestedReligionCards({
  onReligionClick,
  getClickCount,
  showRequestedReligions,
  showConfessions,
}: RequestedReligionCardsProps) {
  return (
    <>
      {/* Desktop Requested Religions Cards */}
      <div
        className={`absolute inset-0 z-10 hidden md:flex items-center justify-center transition-all duration-700 ease-in-out ${showRequestedReligions && !showConfessions ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
      >
        <div className="flex items-center gap-8">
          <div className="relative">
            <img
              src="https://i.imgur.com/5eZqdQy.png"
              alt="Nga"
              className="w-60 h-auto transition-all duration-700 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform"
              onClick={() => onReligionClick('Nga')}
            />
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
              {getClickCount('Nga')}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 w-60 h-40 flex items-center justify-center">
            <span className="text-white/60 text-center" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Vote for the next religion on X
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 w-60 h-40 flex items-center justify-center">
            <span className="text-white/60 text-center" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Vote for the next religion on X
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 w-60 h-40 flex items-center justify-center">
            <span className="text-white/60 text-center" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Vote for the next religion on X
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Requested Religions Cards */}
      {showRequestedReligions && !showConfessions && (
        <div className="absolute inset-0 z-10 md:hidden flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center px-8">
            <div className="relative w-full max-w-xs h-80 overflow-hidden">
              <div className="flex transition-transform duration-300 ease-out h-full">
                <div className="w-full flex-shrink-0 h-full flex items-center justify-center">
                  <div className="relative w-3/4 h-3/4">
                    <img
                      src="https://i.imgur.com/5eZqdQy.png"
                      alt="Nga"
                      className="w-full h-full object-contain cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => onReligionClick('Nga')}
                    />
                    <div className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm text-black text-sm font-bold px-3 py-2 rounded-full border border-white/50 shadow-lg">
                      {getClickCount('Nga')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}