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
          <div className="relative">
            <img
              src="https://i.imgur.com/OZ097br.png"
              alt="YZY"
              className="w-60 h-auto transition-all duration-700 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-white/50 border-2 border-transparent hover:border-white/80 rounded-lg cursor-pointer transform"
              onClick={() => onReligionClick('YZY')}
            />
            <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-sm text-black text-xs font-bold px-1.5 py-0.5 rounded-full border border-white/50 shadow-lg">
              {getClickCount('YZY')}
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
        </div>
      </div>

      {/* Mobile Requested Religions Cards */}
      {showRequestedReligions && !showConfessions && (
        <div className="absolute inset-0 z-10 md:hidden flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center px-8">
            <MobileRequestedReligions
              onReligionClick={onReligionClick}
              getClickCount={getClickCount}
            />
          </div>
        </div>
      )}
    </>
  );
}

// Mobile component for requested religions with swipe functionality
function MobileRequestedReligions({
  onReligionClick,
  getClickCount,
}: {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const requestedReligions = [
    { name: 'Nga', image: 'https://i.imgur.com/5eZqdQy.png' },
    { name: 'YZY', image: 'https://i.imgur.com/OZ097br.png' },
  ];

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < requestedReligions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="relative w-full max-w-xs h-80 overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {requestedReligions.map((religion, index) => (
          <div
            key={religion.name}
            className="w-full flex-shrink-0 h-full flex items-center justify-center"
          >
            <div className="relative w-3/4 h-3/4">
              <img
                src={religion.image}
                alt={religion.name}
                className="w-full h-full object-contain cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => onReligionClick(religion.name)}
              />
              <div className="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm text-black text-sm font-bold px-3 py-2 rounded-full border border-white/50 shadow-lg">
                {getClickCount(religion.name)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {requestedReligions.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {requestedReligions.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white shadow-lg scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Swipe indicators */}
      {currentIndex > 0 && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
          ←
        </div>
      )}
      {currentIndex < requestedReligions.length - 1 && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
          →
        </div>
      )}
    </div>
  );
}