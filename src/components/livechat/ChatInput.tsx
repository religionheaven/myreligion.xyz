import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  cooldownTime: number;
}

export function ChatInput({
  inputValue,
  setInputValue,
  handleSubmit,
  isLoading,
  cooldownTime,
}: ChatInputProps) {
  return (
    <div className="p-6 border-t border-white/20">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            maxLength={200}
            className="w-full px-4 py-3 bg-black/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300 text-white placeholder-white/60 hover:bg-black/30 text-sm"
            disabled={isLoading || cooldownTime > 0}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-xs">
            {inputValue.length}/200
          </div>
        </div>
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading || cooldownTime > 0}
          className="px-6 py-3 bg-white/80 backdrop-blur-sm text-black rounded-2xl hover:bg-white/90 transition-all duration-300 hover:scale-105 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
        >
          {cooldownTime > 0 ? (
            <span className="text-sm font-medium">{cooldownTime}s</span>
          ) : isLoading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Guidelines */}
      <div className="mt-3 text-white/40 text-xs text-center">
        <p>
          Be respectful • No spam/links/crypto/contact info • Max 200 characters • 3s cooldown • No
          excessive caps/emojis
        </p>
      </div>
    </div>
  );
}
