import React, { useState, useEffect } from "react";
import { Trash2, Brain, MessageSquare } from "lucide-react";
import { ChatStore, ChatSession } from "../../services/chat/store";

interface ChatHistoryCardProps {
  session: ChatSession;
  formatDate: (date: string) => string;
  religion: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
}

export function ChatHistoryCard({
  session,
  formatDate,
  religion,
  onClick,
  onDelete,
  isDeleting,
}: ChatHistoryCardProps) {
  const [preview, setPreview] = useState<string>("Loading...");
  const [stats, setStats] = useState<{
    totalMessages: number;
    importantMessages: number;
    islamicMessages: number;
    averageImportance: number;
  } | null>(null);

  useEffect(() => {
    const loadPreviewAndStats = async () => {
      try {
        const { session: sessionData, stats: sessionStats } = await ChatStore.getSessionWithStats(
          session.id
        );
        setStats(sessionStats);

        if (sessionStats.totalMessages === 0) {
          setPreview("No messages yet");
        } else {
          const messages = await ChatStore.getSessionMessages(session.id);
          const lastMessage = messages[messages.length - 1];
          const truncated = lastMessage.content.substring(0, 80);
          setPreview(truncated + (lastMessage.content.length > 80 ? "..." : ""));
        }
      } catch (error) {
        setPreview("Error loading preview");
      }
    };

    loadPreviewAndStats();
  }, [session.id]);

  return (
    <div
      onClick={onClick}
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer group relative overflow-hidden ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500/80 hover:bg-red-600/90 text-white p-1.5 rounded-lg hover:scale-110 transform transition-all duration-200"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Trash2 className="w-3 h-3" />
        )}
      </button>

      {/* Chat preview content */}
      <div className="relative z-10">
        <div
          className="text-white/80 text-xs mb-2"
          style={{ fontFamily: "Poiret One, sans-serif" }}
        >
          {formatDate(session.updated_at)}
        </div>
        <div className="text-white text-sm font-medium mb-2 line-clamp-2">
          {stats && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-white/60" />
              <span className="text-white/60 text-xs">{stats.totalMessages}</span>
              {stats.importantMessages > 0 && (
                <>
                  <Brain className="w-3 h-3 text-yellow-400/80 ml-1" />
                  <span className="text-yellow-400/80 text-xs">{stats.importantMessages}</span>
                </>
              )}
            </div>
          )}
          {session.title || `${religion} Chat`}
        </div>
        <div className="text-white/60 text-xs line-clamp-3">{preview}</div>
        {stats && stats.islamicMessages > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400/80 rounded-full"></div>
            <span className="text-green-400/80 text-xs">Religious content</span>
          </div>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );
}
