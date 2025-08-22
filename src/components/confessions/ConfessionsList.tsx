import React from "react";
import { Confession } from "../../services/confessions";
import { ConfessionCard } from "./ConfessionCard";

interface ConfessionsListProps {
  confessions: Confession[];
  loading: boolean;
  onVote: (confessionId: string, voteType: "upvote" | "downvote") => void;
  formatTimeAgo: (timestamp: string) => string;
}

export function ConfessionsList({
  confessions,
  loading,
  onVote,
  formatTimeAgo,
}: ConfessionsListProps) {
  if (loading) {
    return (
      <div className="text-center text-white/60 mt-10 md:mt-20">
        <p style={{ fontFamily: "Poiret One, sans-serif" }}>Loading confessions...</p>
      </div>
    );
  }

  if (confessions.length === 0) {
    return (
      <div className="text-center text-white/60 mt-10 md:mt-20">
        <p style={{ fontFamily: "Poiret One, sans-serif" }}>
          No confessions yet. Be the first to share...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {confessions.map((confession) => (
        <ConfessionCard
          key={confession.id}
          confession={confession}
          onVote={onVote}
          formatTimeAgo={formatTimeAgo}
        />
      ))}
    </div>
  );
}
