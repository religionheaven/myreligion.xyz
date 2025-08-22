import React from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { Confession, SortOption } from "../../services/confessions";
import { WarningPopup } from "./WarningPopup";

interface ConfessionsModalProps {
  showConfessions: boolean;
  confessions: Confession[];
  confessionText: string;
  setConfessionText: (text: string) => void;
  isSubmittingConfession: boolean;
  handleSubmitConfession: () => void;
  confessionSortBy: SortOption;
  setConfessionSortBy: (sort: SortOption) => void;
  loadingConfessions: boolean;
  handleVoteOnConfession: (confessionId: string, voteType: "upvote" | "downvote") => void;
  formatTimeAgo: (timestamp: string) => string;
  showWarning: boolean;
  warningMessage: string;
  isWarningFadingOut: boolean;
  setShowConfessions: (show: boolean) => void;
}

export function ConfessionsModal({
  showConfessions,
  confessions,
  confessionText,
  setConfessionText,
  isSubmittingConfession,
  handleSubmitConfession,
  confessionSortBy,
  setConfessionSortBy,
  loadingConfessions,
  handleVoteOnConfession,
  formatTimeAgo,
  showWarning,
  warningMessage,
  isWarningFadingOut,
  setShowConfessions,
}: ConfessionsModalProps) {
  if (!showConfessions) return null;

  return (
    <div className="absolute bottom-72 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-4xl mx-2 md:mx-4">
      <div className="h-[50vh] md:h-[60vh] bg-black/50 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl border border-white/30 overflow-hidden flex flex-col">
        {/* Confessions Header */}
        <div className="bg-black/30 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3
                className="text-white font-medium text-lg md:text-xl"
                style={{ fontFamily: "Poiret One, sans-serif" }}
              >
                Confessions
              </h3>
              <button
                onClick={() => setShowConfessions(false)}
                className="text-white/60 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <button
                onClick={() => setConfessionSortBy("recent")}
                className={`px-2 md:px-3 py-1 rounded-lg text-xs transition-all duration-200 ${
                  confessionSortBy === "recent"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setConfessionSortBy("top")}
                className={`px-2 md:px-3 py-1 rounded-lg text-xs transition-all duration-200 ${
                  confessionSortBy === "top"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Top
              </button>
              <button
                onClick={() => setConfessionSortBy("lowest")}
                className={`px-2 md:px-3 py-1 rounded-lg text-xs transition-all duration-200 ${
                  confessionSortBy === "lowest"
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                Lowest
              </button>
            </div>
          </div>
        </div>

        {/* Confessions List */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto">
          {loadingConfessions ? (
            <div className="text-center text-white/60 mt-10 md:mt-20">
              <p style={{ fontFamily: "Poiret One, sans-serif" }}>Loading confessions...</p>
            </div>
          ) : confessions.length === 0 ? (
            <div className="text-center text-white/60 mt-10 md:mt-20">
              <p style={{ fontFamily: "Poiret One, sans-serif" }}>
                No confessions yet. Be the first to share...
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {confessions.map((confession) => (
                <div
                  key={confession.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/20"
                >
                  {/* Own confession indicator */}
                  {confession.is_own && (
                    <div className="mb-1 md:mb-2">
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 md:py-1 rounded-full border border-blue-500/30">
                        Yours
                      </span>
                    </div>
                  )}

                  <p className="text-white/90 text-sm leading-relaxed mb-2 md:mb-3">
                    {confession.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleVoteOnConfession(confession.id, "upvote")}
                        className={`flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-lg transition-all duration-200 ${
                          confession.user_vote === "upvote"
                            ? "bg-green-500/20 text-green-400"
                            : "text-white/60 hover:text-green-400 hover:bg-green-500/10"
                        }`}
                      >
                        <ChevronUp className="w-3 md:w-4 h-3 md:h-4" />
                        <span className="text-xs">{confession.upvotes}</span>
                      </button>

                      {/* Downvote Button */}
                      <button
                        onClick={() => handleVoteOnConfession(confession.id, "downvote")}
                        className={`flex items-center gap-1 px-1.5 md:px-2 py-1 rounded-lg transition-all duration-200 ${
                          confession.user_vote === "downvote"
                            ? "bg-red-500/20 text-red-400"
                            : "text-white/60 hover:text-red-400 hover:bg-red-500/10"
                        }`}
                      >
                        <ChevronDown className="w-3 md:w-4 h-3 md:h-4" />
                        <span className="text-xs">{confession.downvotes}</span>
                      </button>

                      {/* Score */}
                      <div className="text-white/60 text-xs">Score: {confession.score}</div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-white/40 text-xs">
                      {formatTimeAgo(confession.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confession Input - Fixed at bottom */}
        <div className="border-t border-white/20 p-3 md:p-6 bg-black/20 backdrop-blur-sm">
          <div className="flex gap-2 md:gap-3">
            <textarea
              value={confessionText}
              onChange={(e) => setConfessionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (confessionText.trim() && !isSubmittingConfession) {
                    handleSubmitConfession();
                  }
                }
              }}
              placeholder="Write your confession anonymously... (No links or contact info)"
              maxLength={500}
              className="flex-1 p-3 md:p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-white/15 resize-none min-h-[80px] md:min-h-[100px] max-h-[100px] md:max-h-[120px] confession-textarea text-sm"
              style={{ fontFamily: "Poiret One, sans-serif" }}
              disabled={isSubmittingConfession}
            />
            <button
              onClick={handleSubmitConfession}
              disabled={!confessionText.trim() || isSubmittingConfession}
              className="px-4 md:px-6 py-3 md:py-4 bg-white/80 backdrop-blur-sm text-black rounded-xl md:rounded-2xl hover:bg-white/90 transition-all duration-300 hover:scale-105 border border-white/20 self-end text-sm"
              style={{ fontFamily: "Poiret One, sans-serif" }}
            >
              {isSubmittingConfession ? "Submitting..." : "Submit"}
            </button>
          </div>
          <div className="mt-1 md:mt-2 flex flex-col md:flex-row justify-between text-white/40 text-xs gap-1 md:gap-0">
            <p style={{ fontFamily: "Poiret One, sans-serif" }}>
              <span className="hidden md:inline">
                Anonymous posting • Max 2 confessions per user • NO CONTACT INFO ALLOWED • Press
                Enter to submit
              </span>
              <span className="md:hidden">Anonymous • Max 2 per user • Enter to submit</span>
            </p>
            <p className="md:self-end">{confessionText.length}/500</p>
          </div>
        </div>
      </div>

      {/* Warning Popup */}
      <WarningPopup
        showWarning={showWarning}
        warningMessage={warningMessage}
        isWarningFadingOut={isWarningFadingOut}
      />
    </div>
  );
}
