import React from "react";
import { SortOption } from "../../services/confessions";

interface ConfessionHeaderProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export function ConfessionHeader({ sortBy, setSortBy }: ConfessionHeaderProps) {
  return (
    <div className="bg-black/30 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 border-b border-white/20">
      <div className="flex items-center justify-between">
        <h3
          className="text-white font-medium text-lg md:text-xl"
          style={{ fontFamily: "Poiret One, sans-serif" }}
        >
          Confessions
        </h3>

        {/* Sort Options */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("recent")}
            className={`px-2 md:px-3 py-1 rounded-lg text-xs transition-all duration-200 ${
              sortBy === "recent"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy("top")}
            className={`px-2 md:px-3 py-1 rounded-lg text-xs transition-all duration-200 ${
              sortBy === "top"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setSortBy("lowest")}
            className={`px-2 md:px-3 py-1 rounded-lg text-xs transition-all duration-200 ${
              sortBy === "lowest"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            Lowest
          </button>
        </div>
      </div>
    </div>
  );
}
