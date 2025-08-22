import React from "react";
import { MAIN_RELIGIONS } from "../../config/religions";

interface MobileReligionCardsProps {
  onReligionClick: (religion: string) => void;
  getClickCount: (religion: string) => string | number;
  isTransitioning: boolean;
}

export function MobileReligionCards({
  onReligionClick,
  getClickCount,
  isTransitioning,
}: MobileReligionCardsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

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

    if (isLeftSwipe && currentIndex < MAIN_RELIGIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div
      className={`absolute inset-0 z-10 md:hidden flex items-center justify-center transition-all duration-700 ease-in-out ${
        isTransitioning ? "opacity-0 scale-75 translate-y-8" : "opacity-100 scale-100 translate-y-0"
      }`}
    >
      <div className="w-full h-full flex items-center justify-center px-8">
        <div
          className="relative w-full max-w-xs h-80 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Cards container */}
          <div
            className="flex transition-transform duration-300 ease-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {MAIN_RELIGIONS.map((religion, index) => (
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
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {MAIN_RELIGIONS.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white shadow-lg scale-110"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>

          {/* Swipe indicators */}
          {currentIndex > 0 && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
              ←
            </div>
          )}
          {currentIndex < MAIN_RELIGIONS.length - 1 && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 text-xs">
              →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
