import React from 'react';
import { ChatMessage as ChatMessageType } from './types';
import { formatTime } from './utils';
import { formatMessageContent } from './MessageFormatter';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();

  return (
    <div
      key={message.id}
      className={`flex gap-3 ${message.user_id === user?.id ? 'flex-row-reverse' : ''}`}
    >
      <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
        {message.profile_photo_url ? (
          <img
            src={message.profile_photo_url}
            alt={message.username}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-white text-xs font-medium">
            {message.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`flex items-center gap-2 mb-1 ${message.user_id === user?.id ? 'flex-row-reverse' : ''}`}
        >
          <span className="text-white/80 text-sm font-medium">{message.username}</span>
          <span className="text-white/40 text-xs">{formatTime(message.created_at)}</span>
        </div>
        <div
          className={`backdrop-blur-sm rounded-2xl px-4 py-2 border ${
            message.user_id === user?.id
              ? 'bg-white/70 text-gray-800 border-white/50 max-w-fit ml-auto'
              : 'bg-white/10 text-white border-white/20 max-w-fit'
          }`}
        >
          <div className="text-sm leading-relaxed break-words space-y-1">
            <div className="space-y-2">{formatMessageContent(message.content)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
