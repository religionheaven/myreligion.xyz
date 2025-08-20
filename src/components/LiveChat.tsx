import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Import organized components & utils
import { LiveChatProps, ChatMessage } from './livechat/types';
import { SPAM_DETECTION_CONFIG } from './livechat/constants';
import { getCachedMessages, cacheMessages } from './livechat/utils';
import { detectSpam, detectProhibitedContent, checkRateLimit } from './livechat/SpamDetection';
import { ChatMessage as ChatMessageComponent } from './livechat/ChatMessage';
import { ChatInput } from './livechat/ChatInput';
import { WarningPopup } from './livechat/WarningPopup';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LiveChat: React.FC<LiveChatProps> = ({ isVisible }) => {
  const { user } = useAuth();

  // ---------------- State ----------------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showLinkWarning, setShowLinkWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('🚫 Links are not allowed in chat');
  const [isWarningFadingOut, setIsWarningFadingOut] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [recentMessages, setRecentMessages] = useState<string[]>([]);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  // ---------------- Refs ----------------
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ---------------- Mobile Detection ----------------
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768); // Tailwind "md"
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Cooldown countdown
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  // Auto-scroll behavior
  useEffect(() => {
    if (messages.length === 0) return;

    const scrollToEnd = (behavior: ScrollBehavior) => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior });
      }, 100);
    };

    if (isInitialLoad) {
      setIsInitialLoad(false);
      scrollToEnd('auto');
    } else if (isAtBottom) {
      scrollToEnd('smooth');
    }
  }, [messages.length, isInitialLoad, isAtBottom]);

  // Load + realtime subscription
  useEffect(() => {
    if (!isVisible) return;

    let cleanup: (() => void) | undefined;
    let pollInterval: NodeJS.Timeout | undefined;

    loadMessages();
    cleanup = setupRealtimeSubscription();
    pollInterval = setInterval(loadMessages, 1000);

    return () => {
      cleanup?.();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isVisible, user]);

  // Clear state if user logs out
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setInputValue('');
      setIsLoading(false);
      setCooldownTime(0);
      setIsInitialLoad(true);
      setIsAtBottom(true);
    }
  }, [user]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  const scrollToBottomForced = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setIsAtBottom(true);
    }, 200);
  };

  const showWarning = (msg: string) => {
    setWarningMessage(msg);
    setShowLinkWarning(true);
    setIsWarningFadingOut(false);

    setTimeout(() => setIsWarningFadingOut(true), 1700);
    setTimeout(() => {
      setShowLinkWarning(false);
      setIsWarningFadingOut(false);
    }, 2000);
  };

  const updateSpamTracking = (msg: string) => {
    setLastMessageTime(Date.now());
    setRecentMessages((prev) => {
      const updated = [...prev, msg];
      return updated.slice(-SPAM_DETECTION_CONFIG.DUPLICATE_CHECK_LIMIT);
    });
  };

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const loadMessages = async () => {
    try {
      const cached = getCachedMessages();
      if (cached.length > 0) setMessages(cached);

      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('id, user_id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      if (!data?.length) {
        setMessages([]);
        return;
      }

      const uniqueUserIds = [...new Set(data.map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, username, profile_photo_url')
        .in('user_id', uniqueUserIds);

      const userMap = new Map(
        (profiles || []).map((p) => [
          p.user_id,
          { username: p.username, profile_photo_url: p.profile_photo_url },
        ]),
      );

      const formatted: ChatMessage[] = data
        .map((msg) => ({
          id: msg.id,
          user_id: msg.user_id,
          username: userMap.get(msg.user_id)?.username || 'Anonymous',
          profile_photo_url: userMap.get(msg.user_id)?.profile_photo_url || null,
          content: msg.content,
          created_at: msg.created_at,
        }))
        .reverse();

      setMessages(formatted);
      cacheMessages(formatted);
    } catch (err) {
      console.error('Error in loadMessages:', err);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('live_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_chat_messages' },
        async (payload) => {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('username, profile_photo_url')
            .eq('user_id', payload.new.user_id)
            .maybeSingle();

          const newMsg: ChatMessage = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            username: userProfile?.username || 'Anonymous',
            profile_photo_url: userProfile?.profile_photo_url || null,
            content: payload.new.content,
            created_at: payload.new.created_at,
          };

          setMessages((prev) => {
            const updated = [...prev, newMsg];
            const trimmed = updated.slice(-100);
            cacheMessages(trimmed);
            return trimmed;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || isLoading || cooldownTime > 0) return;

    if (inputValue.length > 200) {
      alert('Message too long! Maximum 200 characters.');
      return;
    }

    // Enhanced rate limiting check
    const rateLimitCheck = checkRateLimit(user.id);
    if (rateLimitCheck.isRateLimited) {
      showWarning(rateLimitCheck.message);
      setCooldownTime(rateLimitCheck.cooldownTime);
      return;
    }

    // Spam detection
    const spamCheck = detectSpam(inputValue.trim(), recentMessages, lastMessageTime);
    if (spamCheck.isSpam) {
      showWarning(spamCheck.message);
      return;
    }

    // Prohibited content
    const prohibitedCheck = detectProhibitedContent(inputValue.trim());
    if (prohibitedCheck.isProhibited) {
      showWarning(prohibitedCheck.message);
      return;
    }

    setIsLoading(true);
    const messageContent = inputValue.trim();
    setInputValue('');

    try {
      const { error } = await supabase.from('live_chat_messages').insert({
        user_id: user.id,
        content: messageContent,
      });

      if (error) {
        console.error('Error sending message:', error);
        setInputValue(messageContent);

        if (error.message.includes('rate limit') || error.message.includes('cooldown')) {
          alert('Please wait before sending another message.');
          setCooldownTime(SPAM_DETECTION_CONFIG.RATE_LIMIT_COOLDOWN / 1000);
        } else {
          alert('Failed to send message. Please try again.');
        }
      } else {
        setCooldownTime(SPAM_DETECTION_CONFIG.COOLDOWN_DURATION / 1000);
        updateSpamTracking(messageContent);
        scrollToBottomForced();
        setTimeout(loadMessages, 100);
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setInputValue(messageContent);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isVisible) return null;

  // Show mobile-only warning
  if (isMobile) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center bg-black/40 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl">
        <p className="text-white/80 font-medium" style={{ fontFamily: 'Poiret One, sans-serif' }}>
          Live Chat is only available on desktop.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[800px] max-w-[1000px] mx-auto">
      <div className="bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm px-6 py-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-white" />
              <h3
                className="text-white font-medium"
                style={{ fontFamily: 'Poiret One, sans-serif' }}
              >
                Live Chat
              </h3>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Users className="w-4 h-4" />
              <span>Global</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-[600px] overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="text-center text-white/60 mt-20">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p style={{ fontFamily: 'Poiret One, sans-serif' }}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((msg) => <ChatMessageComponent key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          cooldownTime={cooldownTime}
        />

        {/* Warning */}
        <WarningPopup
          showLinkWarning={showLinkWarning}
          warningMessage={warningMessage}
          isWarningFadingOut={isWarningFadingOut}
        />
      </div>
    </div>
  );
};

export default React.memo(LiveChat);
