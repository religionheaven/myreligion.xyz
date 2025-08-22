import React from 'react';
import { AvatarTool } from '../tools/AvatarTool';
import { DiscoveryTool } from '../tools/DiscoveryTool';

interface ToolsSectionProps {
  showTools: boolean;
  selectedTool: 'avatar' | 'discovery';
  setSelectedTool: (tool: 'avatar' | 'discovery') => void;
  handleToolsClick: () => void;
}

export function ToolsSection({
  showTools,
  selectedTool,
  setSelectedTool,
  handleToolsClick,
}: ToolsSectionProps) {
  return (
    <>
      {/* Tools Button - Desktop Only */}
      <div className="relative z-20 flex justify-center mt-8 hidden md:flex">
        <button
          onClick={handleToolsClick}
          className="bg-black/50 backdrop-blur-sm text-white px-8 py-4 rounded-2xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105"
        >
          <span
            className="text-lg font-medium"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            {showTools ? 'close tools' : 'tools'}
          </span>
        </button>
      </div>

      {/* Tool Navigation Buttons */}
      <div
        className={`absolute top-23 left-8 z-25 hidden md:flex transition-all duration-500 ease-in-out ${
          showTools ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-6">
          <button
            onClick={() => setSelectedTool('avatar')}
            className={`text-xl font-medium transition-colors duration-200 ${
              selectedTool === 'avatar' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Avatar
          </button>
          <span className="text-white/40 text-lg">|</span>
          <button
            onClick={() => setSelectedTool('discovery')}
            className={`text-xl font-medium transition-colors duration-200 ${
              selectedTool === 'discovery' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Discovery
          </button>
        </div>
      </div>

      {/* Tools Window */}
      <div
        className={`absolute top-60 left-8 right-8 bottom-2 z-15 bg-black/50 backdrop-blur-xl rounded-3xl border border-white/30 transition-all duration-500 ease-in-out hidden md:block overflow-y-auto ${
          showTools ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className={`p-8 min-h-full ${showTools ? '' : 'pointer-events-none'}`}>
          <div className="min-h-full">
            {selectedTool === 'avatar' && <AvatarTool />}
            {selectedTool === 'discovery' && <DiscoveryTool />}
          </div>
        </div>
      </div>
    </>
  );
}