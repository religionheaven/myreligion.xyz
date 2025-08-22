import React from "react";
import { ArrowLeft } from "lucide-react";
import { ChatSession } from "../../services/chat/store";
import { ChatHistoryCard } from "./ChatHistoryCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatHistoryViewProps {
  chatSessions: ChatSession[];
  loadingHistory: boolean;
  religion: string;
  onBack: () => void;
  onChatSessionClick: (sessionId: string) => void;
  onDeleteChat: (sessionId: string, e: React.MouseEvent) => void;
  deletingSessionId: string | null;
  formatDate: (date: string) => string;
}

export function ChatHistoryView({
  chatSessions,
  loadingHistory,
  religion,
  onBack,
  onChatSessionClick,
  onDeleteChat,
  deletingSessionId,
  formatDate,
}: ChatHistoryViewProps) {
  return (
    <div className="relative z-10 h-full p-6">
      {/* Back to Chat button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Chat</span>
        </button>
      </div>

      {/* Chat History Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl text-white" style={{ fontFamily: "Poiret One, sans-serif" }}>
          Chat History
        </h2>
      </div>

      {/* 5x5 Grid of Chat Previews */}
      <div className="h-full max-h-[calc(100%-120px)] overflow-y-auto custom-scrollbar">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/60">Loading chat history...</div>
          </div>
        ) : chatSessions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/60 text-center">
              <p className="mb-2">No chat history yet</p>
              <p className="text-sm">Start a conversation to see your chats here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {chatSessions.map((session) => (
              <ChatHistoryCard
                key={session.id}
                session={session}
                formatDate={formatDate}
                religion={religion}
                onClick={() => onChatSessionClick(session.id)}
                onDelete={(e) => onDeleteChat(session.id, e)}
                isDeleting={deletingSessionId === session.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
