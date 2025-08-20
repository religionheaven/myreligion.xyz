import React from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  religion: string;
}

export function ChatMessages({ messages, isLoading, religion }: ChatMessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Check if user is near bottom of chat
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  React.useEffect(() => {
    // Only auto-scroll if user is near bottom or if it's a new message
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 custom-scrollbar"
    >
      {messages.length === 0 && (
        <div className="text-center text-white/60 mt-20">
          <p style={{ fontFamily: 'Poiret One, sans-serif' }}>
            Welcome to your {religion} chat. Ask me anything!
          </p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-black/40 text-white border border-white/30 px-4 py-3 rounded-2xl animate-pulse">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDuration: '1.4s' }}
              ></div>
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
              ></div>
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
             {religion.toLowerCase() === 'nga' 
               ? 'Welcome to the Nga spiritual realm. What wisdom do you seek?'
               : `Welcome to your ${religion} chat. Ask me anything!`
             }
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
