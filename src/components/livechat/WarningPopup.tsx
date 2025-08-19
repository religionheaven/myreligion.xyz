import React from 'react';

interface WarningPopupProps {
  showLinkWarning: boolean;
  warningMessage: string;
  isWarningFadingOut: boolean;
}

export function WarningPopup({
  showLinkWarning,
  warningMessage,
  isWarningFadingOut,
}: WarningPopupProps) {
  if (!showLinkWarning) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl border border-red-400/30 shadow-lg ${
          isWarningFadingOut ? 'animate-popup-out' : 'animate-popup-in'
        }`}
      >
        <p className="text-sm font-medium">{warningMessage}</p>
      </div>
    </div>
  );
}
