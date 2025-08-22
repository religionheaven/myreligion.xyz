import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ConfessionService, Confession, SortOption } from "../services/confessions";

export function useConfessions() {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [confessionText, setConfessionText] = useState("");
  const [isSubmittingConfession, setIsSubmittingConfession] = useState(false);
  const [confessionSortBy, setConfessionSortBy] = useState<SortOption>("recent");
  const [loadingConfessions, setLoadingConfessions] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isWarningFadingOut, setIsWarningFadingOut] = useState(false);

  // Load confessions when sort changes
  useEffect(() => {
    loadConfessions();
  }, [confessionSortBy]);

  const loadConfessions = async () => {
    setLoadingConfessions(true);
    const fetchedConfessions = await ConfessionService.getConfessions(
      confessionSortBy,
      50,
      user?.id
    );
    setConfessions(fetchedConfessions);
    setLoadingConfessions(false);
  };

  const showWarningPopup = (message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
    setIsWarningFadingOut(false);

    setTimeout(() => setIsWarningFadingOut(true), 2700);
    setTimeout(() => {
      setShowWarning(false);
      setIsWarningFadingOut(false);
    }, 3000);
  };

  const handleSubmitConfession = async () => {
    if (!confessionText.trim() || isSubmittingConfession || !user) return;

    setIsSubmittingConfession(true);
    const result = await ConfessionService.submitConfession(confessionText, user.id);

    if (result.success) {
      setConfessionText("");
      // Reload confessions to show the new one
      await loadConfessions();
    } else {
      showWarningPopup(result.error || "Failed to submit confession. Please try again.");
    }

    setIsSubmittingConfession(false);
  };

  const handleVoteOnConfession = async (confessionId: string, voteType: "upvote" | "downvote") => {
    if (!user) return;

    console.log(`Voting ${voteType} on confession ${confessionId}`);

    // Optimistically update the UI first
    setConfessions((prevConfessions) =>
      prevConfessions.map((confession) => {
        if (confession.id === confessionId) {
          const currentVote = confession.user_vote;
          let newUpvotes = confession.upvotes;
          let newDownvotes = confession.downvotes;
          let newUserVote: "upvote" | "downvote" | null = voteType;

          // Handle vote logic
          if (currentVote === voteType) {
            // Same vote - remove it
            if (voteType === "upvote") {
              newUpvotes = Math.max(0, newUpvotes - 1);
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
            }
            newUserVote = null;
          } else if (currentVote && currentVote !== voteType) {
            // Different vote - change it
            if (currentVote === "upvote") {
              newUpvotes = Math.max(0, newUpvotes - 1);
              newDownvotes = newDownvotes + 1;
            } else {
              newDownvotes = Math.max(0, newDownvotes - 1);
              newUpvotes = newUpvotes + 1;
            }
          } else {
            // No previous vote - add new vote
            if (voteType === "upvote") {
              newUpvotes = newUpvotes + 1;
            } else {
              newDownvotes = newDownvotes + 1;
            }
          }

          console.log(
            `UI Update: ${confession.id} -> upvotes=${newUpvotes}, downvotes=${newDownvotes}, score=${newUpvotes - newDownvotes}`
          );

          return {
            ...confession,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            score: newUpvotes - newDownvotes,
            user_vote: newUserVote,
          };
        }
        return confession;
      })
    );

    // Then update the backend
    const success = await ConfessionService.voteOnConfession(confessionId, user.id, voteType);

    if (!success) {
      // If backend failed, reload to get correct state
      console.log("Backend vote failed, reloading confessions");
      await loadConfessions();
    } else {
      console.log("Backend vote successful");
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return {
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
    loadConfessions,
    showWarning,
    warningMessage,
    isWarningFadingOut,
  };
}
