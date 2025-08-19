import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileService } from '../services/userProfile';
import { ChatMessage } from './livechat/ChatMessage';
import { ChatInput } from './livechat/ChatInput';
import { WarningPopup } from './livechat/WarningPopup';
import { SpamDetection } from './livechat/SpamDetection';
import { formatMessage } from './livechat/MessageFormatter';
import { 
  SPAM_COOLDOWN_DURATION, 
  RATE_LIMIT_WINDOW, 
  RATE_LIMIT_MAX_MESSAGES, 
  RATE_LIMIT_PENALTY 
} from './livechat/constants';
import type { LiveChatMessage, LiveChatUser } from './livechat/types';

interface LiveChatProps {
  isVisible: boolean;
}

export default function LiveChat({ isVisible }: LiveChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<LiveChatUser[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [spamTracker, setSpamTracker] = useState<Map<string, number[]>>(new Map());
  const [cooldownUsers, setCooldownUsers] = useState<Map<string, number>>(new Map());
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isVisible || !user) return;

    loadMessages();
    loadOnlineUsers();

    const messagesSubscription = supabase
      .channel('live_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              content: newMsg.content,
              user_id: newMsg.user_id,
              username: 'Loading...',
              created_at: newMsg.created_at,
            },
          ]);

          // Load username for the new message
          UserProfileService.getUserProfile(newMsg.user_id).then((profile) => {
            if (profile) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === newMsg.id ? { ...msg, username: profile.username || 'Anonymous' } : msg,
                ),
              );
            }
          });
        },
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [isVisible, user]);

  // Cooldown countdown effect
  useEffect(() => {
    if (!user) return;

    const userCooldown = cooldownUsers.get(user.id) || 0;
    const maxCooldown = Math.max(userCooldown, rateLimitCooldown);
    
    if (maxCooldown <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingCooldown = Math.max(0, userCooldown - now);
      const remainingRateLimit = Math.max(0, rateLimitCooldown - now);
      
      setCooldownUsers(prev => {
        const newMap = new Map(prev);
        if (remainingCooldown <= 0) {
          newMap.delete(user.id);
        }
        return newMap;
      });

      if (remainingRateLimit <= 0) {
        setRateLimitCooldown(0);
      }

      if (remainingCooldown <= 0 && remainingRateLimit <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUsers, rateLimitCooldown, user]);

  const loadMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      if (messagesData) {
        const userIds = [...new Set(messagesData.map((msg) => msg.user_id))];
        const profiles = await Promise.all(
          userIds.map((id) => UserProfileService.getUserProfile(id)),
        );

        const usernameMap = new Map();
        profiles.forEach((profile) => {
          if (profile) {
            usernameMap.set(profile.user_id, profile.username || 'Anonymous');
          }
        });

        const messagesWithUsernames = messagesData.map((msg) => ({
          id: msg.id,
          content: msg.content,
          user_id: msg.user_id,
          username: usernameMap.get(msg.user_id) || 'Anonymous',
          created_at: msg.created_at,
        }));

        setMessages(messagesWithUsernames);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadOnlineUsers = async () => {
    // This would typically load from a real-time presence system
    // For now, we'll show users who have sent messages recently
    try {
      const { data: recentMessages, error } = await supabase
        .from('live_chat_messages')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (recentMessages) {
        const uniqueUserIds = [...new Set(recentMessages.map((msg) => msg.user_id))];
        const profiles = await Promise.all(
          uniqueUserIds.map((id) => UserProfileService.getUserProfile(id)),
        );

        const onlineUsersList = profiles
          .filter((profile) => profile)
          .map((profile) => ({
            id: profile!.user_id,
            username: profile!.username || 'Anonymous',
            isOnline: true,
          }));

        setOnlineUsers(onlineUsersList);
      }
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isLoading) return;

    // Check rate limiting first
    const now = Date.now();
    const recentMessages = messageTimestamps.filter(
      timestamp => now - timestamp < RATE_LIMIT_WINDOW
    );

    if (recentMessages.length >= RATE_LIMIT_MAX_MESSAGES) {
      const cooldownEnd = now + RATE_LIMIT_PENALTY;
      setRateLimitCooldown(cooldownEnd);
      setWarningMessage('🚫 Rate limit exceeded. You are on cooldown for 5 minutes.');
      setShowWarning(true);
      return;
    }

    // Check regular cooldown
    const userCooldown = cooldownUsers.get(user.id) || 0;
    if (userCooldown > now) {
      return;
    }

    // Check for spam
    const spamResult = SpamDetection.checkMessage(newMessage, messageTimestamps);
    if (spamResult.isSpam) {
      if (spamResult.isRateLimit) {
        // Rate limit violation - 5 minute cooldown
        const cooldownEnd = now + RATE_LIMIT_PENALTY;
        setRateLimitCooldown(cooldownEnd);
      } else {
        // Regular spam - shorter cooldown
        const cooldownEnd = now + SPAM_COOLDOWN_DURATION;
        setCooldownUsers(prev => new Map(prev.set(user.id, cooldownEnd)));
      }
      
      setWarningMessage(spamResult.reason);
      setShowWarning(true);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('live_chat_messages').insert({
        content: formatMessage(newMessage.trim()),
        user_id: user.id,
      });

      if (error) throw error;

      // Update spam tracking
      setSpamTracker(prev => {
        const newTracker = new Map(prev);
        const userMessages = newTracker.get(user.id) || [];
        userMessages.push(now);
        // Keep only recent messages for spam detection
        const recentUserMessages = userMessages.filter(timestamp => now - timestamp < 30000);
        newTracker.set(user.id, recentUserMessages);
        return newTracker;
      });

      // Update message timestamps for rate limiting
      setMessageTimestamps(prev => {
        const updated = [...prev, now];
        // Keep only messages within the rate limit window
        return updated.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setWarningMessage('Failed to send message. Please try again.');
      setShowWarning(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingCooldown = () => {
    if (!user) return 0;
    
    const now = Date.now();
    const userCooldown = cooldownUsers.get(user.id) || 0;
    const remainingCooldown = Math.max(0, userCooldown - now);
    const remainingRateLimit = Math.max(0, rateLimitCooldown - now);
    
    return Math.max(remainingCooldown, remainingRateLimit);
  };

  const formatCooldownTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  if (!isVisible) return null;

  const remainingCooldown = getRemainingCooldown();

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-white font-semibold text-lg" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Heaven Live Chat
            </h2>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Users className="w-4 h-4" />
            <span>{onlineUsers.length} online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            <p style={{ fontFamily: 'Poiret One, sans-serif' }}>
              No messages yet. Be the first to say hello! 👋
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} currentUserId={user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        {remainingCooldown > 0 && (
          <div className="mb-3 flex items-center gap-2 text-orange-400 text-sm bg-orange-400/10 rounded-lg p-2">
            <Clock className="w-4 h-4" />
            <span>Cooldown: {formatCooldownTime(remainingCooldown)}</span>
          </div>
        )}
        
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          disabled={remainingCooldown > 0}
          placeholder={remainingCooldown > 0 ? "You are on cooldown..." : "Type your message..."}
        />
      </div>

      {/* Warning Popup */}
      <WarningPopup
        isVisible={showWarning}
        message={warningMessage}
        onClose={() => setShowWarning(false)}
      />
    </div>
  );
}