import React from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop: () => void;
  isLoading: boolean;
  religion: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading,
  religion,
}: ChatInputProps) {
  return (
    <div className="p-4 md:p-6 border-t border-white/20 flex-shrink-0">
      <form onSubmit={onSubmit} className="flex gap-2 md:gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ask about ${religion}...`}
          className="flex-1 px-3 py-3 md:px-5 md:py-4 bg-black/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-black/30 text-sm md:text-base"
        />
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="px-4 py-3 md:px-7 md:py-4 bg-red-500/80 backdrop-blur-sm text-white rounded-2xl hover:bg-red-600/90 transition-all duration-300 hover:scale-105 border border-red-400/20 flex-shrink-0"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className="px-4 py-3 md:px-7 md:py-4 bg-white/80 backdrop-blur-sm text-black rounded-2xl hover:bg-white/90 transition-all duration-300 hover:scale-105 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
    </div>
  );
}
