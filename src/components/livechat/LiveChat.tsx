import React, { useState, useEffect, useRef } from 'react';
import { X, Users, Send, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ChatMessage } from './types';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WarningPopup } from './WarningPopup';
import { SpamDetection } from './SpamDetection';
import { getCachedMessages, cacheMessages } from './utils';
import {
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX_MESSAGES,
  RATE_LIMIT_PENALTY,
  SPAM_COOLDOWN_DURATION,
} from './constants';

interface LiveChatProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function LiveChat({ isVisible, onClose }: LiveChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showLinkWarning, setShowLinkWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isWarningFadingOut, setIsWarningFadingOut] = useState(false);
  const [userMessageTimestamps, setUserMessageTimestamps] = useState<number[]>([]);
  const [lastSpamWarning, setLastSpamWarning] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages on mount
  useEffect(() => {
    if (isVisible && user) {
      loadMessages();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('live_chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_chat_messages',
          },
          (payload) => {
            const newMessage = payload.new as any;
            // Add username from user profiles if available
            setMessages((prev) => [...prev, {
              id: newMessage.id,
              user_id: newMessage.user_id,
              username: newMessage.username || 'Anonymous',
              content: newMessage.content,
              created_at: newMessage.created_at,
            }]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isVisible, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) {
              clearInterval(cooldownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldownTime]);

  const loadMessages = async () => {
    try {
      // Try cache first
      const cachedMessages = getCachedMessages();
      if (cachedMessages.length > 0) {
        setMessages(cachedMessages);
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          id,
          user_id,
          content,
          created_at,
          user_profiles!inner(username, profile_photo_url)
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      const formattedMessages: ChatMessage[] = (data || []).map((msg: any) => ({
        id: msg.id,
        user_id: msg.user_id,
        username: msg.user_profiles?.username || 'Anonymous',
        profile_photo_url: msg.user_profiles?.profile_photo_url,
        content: msg.content,
        created_at: msg.created_at,
      }));

      setMessages(formattedMessages);
      cacheMessages(formattedMessages);
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showWarning = (message: string) => {
    setWarningMessage(message);
    setShowLinkWarning(true);
    setIsWarningFadingOut(false);

    setTimeout(() => {
      setIsWarningFadingOut(true);
      setTimeout(() => {
        setShowLinkWarning(false);
      }, 300);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || cooldownTime > 0 || !user) return;

    const now = Date.now();
    const newMessage = inputValue.trim();

    // Update message timestamps for rate limiting
    const updatedTimestamps = [...userMessageTimestamps, now].filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
    );
    setUserMessageTimestamps(updatedTimestamps);

    // Check for spam
    const spamCheck = SpamDetection.checkMessage(newMessage, user.id, updatedTimestamps);

    if (spamCheck.isSpam) {
      // Show warning if enough time has passed since last warning
      if (now - lastSpamWarning > SPAM_COOLDOWN_DURATION) {
        showWarning(spamCheck.reason || 'Message blocked');
        setLastSpamWarning(now);
      }

      // Apply cooldown based on severity
      let cooldownDuration = 3; // Default 3 seconds
      if (spamCheck.severity === 'high') {
        cooldownDuration = Math.min(30, 5 + updatedTimestamps.length * 2); // Up to 30 seconds
      } else if (spamCheck.severity === 'medium') {
        cooldownDuration = Math.min(15, 3 + updatedTimestamps.length); // Up to 15 seconds
      }

      setCooldownTime(cooldownDuration);
      setInputValue('');
      return;
    }

    setIsLoading(true);
    setInputValue('');

    try {
      const { error } = await supabase.from('live_chat_messages').insert({
        user_id: user.id,
        content: newMessage,
      });

      if (error) {
        console.error('Error sending message:', error);
        showWarning('Failed to send message. Please try again.');
        setInputValue(newMessage); // Restore message
      } else {
        // Apply standard cooldown
        setCooldownTime(3);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      showWarning('Failed to send message. Please try again.');
      setInputValue(newMessage); // Restore message
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-2xl h-[600px] mx-4 flex flex-col relative overflow-hidden">
        {/* Radiance effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none rounded-3xl"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

        {/* Warning Popup */}
        <WarningPopup
          showLinkWarning={showLinkWarning}
          warningMessage={warningMessage}
          isWarningFadingOut={isWarningFadingOut}
        />

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <h2
              className="text-xl text-white font-medium"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              Live Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="text-center text-white/60 mt-20">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p style={{ fontFamily: 'Poiret One, sans-serif' }}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative z-10">
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            cooldownTime={cooldownTime}
          />
        </div>
      </div>
    </div>
  );
}