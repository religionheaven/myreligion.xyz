import React from "react";
import { AvatarTool } from "../tools/AvatarTool";
import { DiscoveryTool } from "../tools/DiscoveryTool";

interface ToolsSectionProps {
  showTools: boolean;
  selectedTool: "avatar" | "discovery";
  setSelectedTool: (tool: "avatar" | "discovery") => void;
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
        <div className="absolute top-1/2 left-1/2 transform translate-x-[120px] -translate-y-[200px] lg:-translate-y-[240px] xl:-translate-y-[280px] 2xl:-translate-y-[320px]">
          <button
            onClick={handleToolsClick}
            className="bg-black/50 backdrop-blur-sm text-white px-4 lg:px-6 xl:px-8 py-3 lg:py-4 rounded-xl border border-white/20 hover:bg-black/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <span
              className="text-sm lg:text-base font-medium"
              style={{ fontFamily: "Poiret One, sans-serif" }}
            >
              {showTools ? "close tools" : "tools"}
            </span>
          </button>
        </div>
      </div>

      {/* Tool Navigation Buttons */}
      <div
        className={`absolute top-8 lg:top-10 xl:top-12 left-4 lg:left-6 xl:left-8 z-25 hidden md:flex transition-all duration-500 ease-in-out ${
          showTools ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            onClick={() => setSelectedTool("avatar")}
            className={`text-xl font-medium transition-colors duration-200 ${
              selectedTool === "avatar" ? "text-white" : "text-white/60 hover:text-white"
            }`}
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Avatar
          </button>
          <span className="text-white/40 text-base lg:text-lg">|</span>
          <button
            onClick={() => setSelectedTool("discovery")}
            className={`text-xl font-medium transition-colors duration-200 ${
              selectedTool === "discovery" ? "text-white" : "text-white/60 hover:text-white"
            }`}
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Discovery
          </button>
        </div>
      </div>

      {/* Tools Window */}
      <div
        className={`absolute top-[clamp(200px,25vh,300px)] left-4 lg:left-6 xl:left-8 right-4 lg:right-6 xl:right-8 bottom-4 lg:bottom-6 xl:bottom-8 z-15 bg-black/50 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/30 transition-all duration-500 ease-in-out hidden md:block overflow-y-auto ${
          showTools ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className={`p-4 lg:p-6 xl:p-8 min-h-full ${showTools ? "" : "pointer-events-none"}`}>
          <div className="min-h-full">
            {selectedTool === "avatar" && <AvatarTool />}
            {selectedTool === "discovery" && <DiscoveryTool />}
          </div>
        </div>
      </div>
    </>
  );
}
