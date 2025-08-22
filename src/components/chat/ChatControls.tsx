import React from "react";
import { Download } from "lucide-react";

interface ChatControlsProps {
  onNewChat: () => void;
  onChatHistory: () => void;
  onExportChat: () => void;
  hasMessages: boolean;
}

export function ChatControls({
  onNewChat,
  onChatHistory,
  onExportChat,
  hasMessages,
}: ChatControlsProps) {
  return (
    <div className="absolute top-20 left-8 flex gap-3 z-30">
      <button
        onClick={onNewChat}
        className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-black/40 transition-all duration-300 hover:scale-105"
      >
        <span className="text-sm font-medium" style={{ fontFamily: "Poiret One, sans-serif" }}>
          New Chat
        </span>
      </button>
      <button
        onClick={onChatHistory}
        className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-black/40 transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <span className="text-sm font-medium" style={{ fontFamily: "Poiret One, sans-serif" }}>
          Chat History
        </span>
      </button>
      {hasMessages && (
        <button
          onClick={onExportChat}
          className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-black/40 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium" style={{ fontFamily: "Poiret One, sans-serif" }}>
              Export
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
