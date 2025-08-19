import React from 'react';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatViewProps {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  loadingSession: boolean;
  religion: string;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onStopResponse: () => void;
}

export function ChatView({
  messages,
  inputValue,
  isLoading,
  loadingSession,
  religion,
  onInputChange,
  onSendMessage,
  onStopResponse,
}: ChatViewProps) {
  return (
    <div className="relative z-10 flex flex-col h-full">
      {loadingSession && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading chat...</p>
          </div>
        </div>
      )}

      <ChatMessages messages={messages} isLoading={isLoading} religion={religion} />

      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSubmit={onSendMessage}
        onStop={onStopResponse}
        isLoading={isLoading}
        religion={religion}
      />
    </div>
  );
}
