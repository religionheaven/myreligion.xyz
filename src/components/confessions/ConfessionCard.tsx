import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Confession } from "../../services/confessions";

interface ConfessionCardProps {
  confession: Confession;
  onVote: (confessionId: string, voteType: "upvote" | "downvote") => void;
  formatTimeAgo: (timestamp: string) => string;
}

export function ConfessionCard({ confession, onVote, formatTimeAgo }: ConfessionCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/20">
      {/* Own confession indicator */}
      {confession.is_own && (
        <div className="mb-1 md:mb-2">
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 md:py-1 rounded-full border border-blue-500/30">
            Yours
          </span>
        </div>
      )}

      <p className="text-white/90 text-sm leading-relaxed mb-2 md:mb-3">{confession.content}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Upvote Button */}
          <button
            onClick={() => onVote(confession.id, "upvote")}
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
            onClick={() => onVote(confession.id, "downvote")}
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
        <div className="text-white/40 text-xs">{formatTimeAgo(confession.created_at)}</div>
      </div>
    </div>
  );
}
