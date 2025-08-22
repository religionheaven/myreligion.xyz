import React, { useState } from 'react';
import { ChatHeader } from './chat/ChatHeader';
import { ChatControls } from './chat/ChatControls';
import { ChatHistoryView } from './chat/ChatHistoryView';
import { ChatView } from './chat/ChatView';
import { useAuth } from '../contexts/AuthContext';
import { ChatStore, ChatSession } from '../services/chat/store';
import { MemoryManager } from '../services/chat/memoryManager';
import { MessageCache } from '../services/messageCache';
import { DraftManager } from '../services/draftManager';
import { ChatExport } from '../services/chatExport';
import { Analytics } from '../services/analytics';
import { ExportModal } from './chat/ExportModal';
import { SessionTracking } from '../services/sessionTracking';

interface ChatInterfaceProps {
  religion: string;
  onBack: () => void;
  isTransitioning: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  religion,
  onBack,
  isTransitioning,
}) => {
  const { user, signOut } = useAuth();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load existing active session or prepare for new one
  React.useEffect(() => {
    const loadActiveSession = async () => {
      if (!user) return;

      try {
        const sessions = await ChatStore.getUserSessions(user.id);
        // Find active session for this specific religion
        const activeSession = sessions.find(
          (session) =>
            session.is_active && session.title?.toLowerCase().includes(religion.toLowerCase()),
        );

        if (activeSession) {
          // Try to load from cache first
          const cachedMessages = MessageCache.getCachedMessages(activeSession.id);
          if (cachedMessages.length > 0) {
            const formattedMessages: Message[] = cachedMessages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(formattedMessages);
          }

          setCurrentSessionId(activeSession.id);
          const sessionMessages = await ChatStore.getSessionMessages(activeSession.id);
          const formattedMessages: Message[] = sessionMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }));
          setMessages(formattedMessages);

          // Cache the messages
          const cacheMessages = sessionMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            sessionId: activeSession.id,
          }));
          MessageCache.cacheMessages(activeSession.id, cacheMessages, religion);

          // Load draft if exists
          const draft = DraftManager.getDraft(activeSession.id);
          if (draft) {
            setInputValue(draft);
          }

          // Track session start
          Analytics.trackEvent('session_started', religion, activeSession.id);
        }
      } catch (error) {
        console.error('Error loading active session:', error);
        setConnectionError('Failed to load chat history. You can still start a new conversation.');
      }
    };

    loadActiveSession();
  }, [user, religion]);

  // Auto-save drafts
  React.useEffect(() => {
    if (currentSessionId && inputValue.trim()) {
      const timeoutId = setTimeout(() => {
        DraftManager.saveDraft(currentSessionId, inputValue);
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, currentSessionId]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Cancel any ongoing requests
      if (abortController) {
        abortController.abort();
      }

      // Cleanup expired cache and drafts
      MessageCache.cleanupCache();
      DraftManager.cleanupDrafts();
    };
  }, [abortController]);

  // Reset state when user changes (including sign out)
  React.useEffect(() => {
    if (!user) {
      // Clear all chat state when user signs out
      setMessages([]);
      setCurrentSessionId(null);
      setInputValue('');
      setIsLoading(false);
      setShowHistory(false);
      setChatSessions([]);
      setConnectionError(null);

      // Cancel any ongoing requests
      if (abortController) {
        abortController.abort();
        setAbortController(null);
      }
    }
  }, [user, abortController]);

  // Send a new message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (!user) return;

    // Clear any previous errors
    setConnectionError(null);
    setRetryCount(0);

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = inputValue;
    setInputValue('');

    // Clear draft since message is being sent
    if (currentSessionId) {
      DraftManager.clearDraft(currentSessionId);
    }

    try {
      // Ensure we have a session
      let sessionId = currentSessionId;
      if (!sessionId) {
        const newSession = await ChatStore.createSession(
          user.id,
          `${religion} Chat - ${new Date().toLocaleDateString()}`,
        );
        if (!newSession) {
          throw new Error('Failed to create chat session');
        }
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        Analytics.trackEvent('session_started', religion, sessionId);
      }

      // Save user message to database
      const savedUserMessage = await ChatStore.addMessage(sessionId, 'user', currentInput);

      // Track message analytics
      SessionTracking.trackMessage(
        savedUserMessage?.id || userMessage.id,
        user.id,
        sessionId,
        religion,
        currentInput.length,
      );

      // Add to cache
      MessageCache.addMessageToCache(
        sessionId,
        {
          id: userMessage.id,
          role: 'user',
          content: currentInput,
          timestamp: new Date(),
          sessionId,
        },
        religion,
      );

      // Track message
      Analytics.trackEvent('message_sent', religion, sessionId);

      // Get all messages for context building
      const allMessages = await ChatStore.getSessionMessages(sessionId);

      // Create a placeholder AI message that we'll update as we stream
      const aiMessageId = crypto.randomUUID();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Build optimized message history using memory manager
      const messageHistory = MemoryManager.buildMessageHistory(
        allMessages,
        '', // System prompt will be added by the edge function
        {
          maxMessages: 6,
          recentMessages: 3,
          importantMessages: 2,
          maxTokens: 1500,
        },
      );

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-religion`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentInput,
            religion: religion.toLowerCase(),
            messageHistory: messageHistory.slice(1), // Exclude system prompt, edge function will add it
          }),
          signal: controller.signal, // Add abort signal
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service error: ${response.status} - ${errorText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let fullResponse = '';
      const decoder = new TextDecoder();

      try {
        while (true) {
          // Check if request was aborted
          if (controller.signal.aborted) {
            break;
          }

          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  
                  // Apply Nga-specific text replacement in real-time
                  let displayResponse = fullResponse;
                  if (religion.toLowerCase() === 'nga') {
                    displayResponse = fullResponse.replace(/\*g/gi, 'ig');
                  }
                  
                  // Add a small delay for smoother typing effect
                  setTimeout(() => {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessageId ? { ...msg, content: displayResponse } : msg,
                      ),
                    );
                  }, 50); // 50ms delay for smoother appearance
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Save the complete AI response to database
      if (fullResponse) {
        // Apply Nga-specific text replacement
        let processedResponse = fullResponse;
        if (religion.toLowerCase() === 'nga') {
          console.log('Original response:', fullResponse);
          processedResponse = fullResponse.replace(/\*g/gi, 'ig');
          console.log('Processed response:', processedResponse);
          console.log('Replacement made:', fullResponse !== processedResponse);
        }

        // Update the final message with processed response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: processedResponse } : msg,
          ),
        );

        await ChatStore.addMessage(sessionId, 'assistant', processedResponse);

        // Add to cache
        MessageCache.addMessageToCache(
          sessionId,
          {
            id: aiMessageId,
            role: 'assistant',
            content: processedResponse,
            timestamp: new Date(),
            sessionId,
          },
          religion,
        );

        Analytics.trackEvent('ai_response_received', religion, sessionId);
      } else {
        const errorMsg = 'Sorry, I encountered an error while processing your question.';
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: errorMsg } : msg)),
        );
        await ChatStore.addMessage(sessionId, 'assistant', errorMsg);
      }

      // Update session title if this is the first message
      if (messages.length === 0) {
        const title = `${religion}: ${currentInput.length > 40 ? currentInput.substring(0, 40) + '...' : currentInput}`;
        await ChatStore.updateSessionTitle(sessionId, title);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was aborted by user
        console.log('AI response was stopped by user');
        // Remove the empty AI message
        setMessages((prev) => prev.filter((msg) => msg.content !== ''));
      } else {
        console.error('Error calling AI:', error);

        // Set user-friendly error message
        const errorMsg = error.message.includes('AI service error')
          ? 'The AI service is temporarily unavailable. Please try again.'
          : 'Connection failed. Please check your internet and try again.';

        setConnectionError(errorMsg);
        setRetryCount((prev) => prev + 1);

        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: errorMsg,
          timestamp: new Date(),
        };
        setMessages((prev) =>
          prev.map((msg) => (msg.role === 'assistant' && msg.content === '' ? errorMessage : msg)),
        );

        // Save error message to database if we have a session
        if (currentSessionId) {
          try {
            await ChatStore.addMessage(currentSessionId, 'assistant', errorMessage.content);
          } catch (dbError) {
            console.error('Error saving error message to database:', dbError);
          }
        }

        Analytics.trackEvent('error_occurred', religion, currentSessionId);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  // Retry failed request
  const handleRetry = () => {
    if (connectionError && retryCount < 3) {
      // Re-add the last user message to input
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      if (lastUserMessage) {
        setInputValue(lastUserMessage.content);
        // Remove the failed messages
        setMessages((prev) =>
          prev.filter(
            (m) => !(m.role === 'assistant' && m.content.includes('temporarily unavailable')),
          ),
        );
      }
      setConnectionError(null);
    }
  };

  // Stop AI response
  const handleStopResponse = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  // Start a fresh chat
  const handleNewChat = () => {
    // Clear draft for current session
    if (currentSessionId) {
      DraftManager.clearDraft(currentSessionId);
    }

    setMessages([]);
    setCurrentSessionId(null);
    setShowHistory(false);
    setConnectionError(null);
    setInputValue('');

    Analytics.trackEvent('new_chat_started', religion);
  };

  // Load chat history
  const handleChatHistory = async () => {
    if (!user) return;

    setLoadingHistory(true);
    try {
      const allSessions = await ChatStore.getUserSessions(user.id);
      // Filter sessions for this specific religion
      const religionSessions = allSessions.filter((session) =>
        session.title?.toLowerCase().includes(religion.toLowerCase()),
      );
      setChatSessions(religionSessions);
      setShowHistory(true);
      Analytics.trackEvent('chat_history_viewed', religion);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setConnectionError('Failed to load chat history. Please try again.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load a specific session
  const handleChatSessionClick = async (sessionId: string) => {
    // Clear draft for current session
    if (currentSessionId) {
      DraftManager.clearDraft(currentSessionId);
    }

    setLoadingSession(true);
    setCurrentSessionId(sessionId);

    try {
      // Try cache first
      const cachedMessages = MessageCache.getCachedMessages(sessionId);
      if (cachedMessages.length > 0) {
        const formattedMessages: Message[] = cachedMessages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
        setShowHistory(false);

        // Load draft
        const draft = DraftManager.getDraft(sessionId);
        if (draft) {
          setInputValue(draft);
        }

        Analytics.trackEvent('session_loaded', religion, sessionId);
        return;
      }

      // Fallback to database
      const sessionMessages = await ChatStore.getSessionMessages(sessionId);
      const formattedMessages: Message[] = sessionMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
      setMessages(formattedMessages);
      setShowHistory(false);

      // Cache the messages
      const cacheMessages = sessionMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        sessionId,
      }));
      MessageCache.cacheMessages(sessionId, cacheMessages, religion);

      // Load draft
      const draft = DraftManager.getDraft(sessionId);
      if (draft) {
        setInputValue(draft);
      }

      Analytics.trackEvent('session_loaded', religion, sessionId);
    } catch (error) {
      console.error('Error loading session messages:', error);
      setConnectionError('Failed to load chat session. Please try again.');
    } finally {
      setLoadingSession(false);
    }
  };

  // Delete a session
  const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSessionId(sessionId);

    try {
      await ChatStore.deleteSession(sessionId);
      setChatSessions((prev) => prev.filter((session) => session.id !== sessionId));

      // Clear cache and draft for deleted session
      MessageCache.cacheMessages(sessionId, [], religion);
      DraftManager.clearDraft(sessionId);

      Analytics.trackEvent('session_deleted', religion, sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      setConnectionError('Failed to delete chat session. Please try again.');
    } finally {
      setDeletingSessionId(null);
    }
  };

  // Export chat
  const handleExportChat = (format: 'text' | 'json' | 'markdown') => {
    if (messages.length === 0) return;

    const exportMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    const sessionTitle = chatSessions.find((s) => s.id === currentSessionId)?.title;

    switch (format) {
      case 'text':
        ChatExport.exportAsText(exportMessages, religion, sessionTitle);
        break;
      case 'json':
        ChatExport.exportAsJSON(exportMessages, religion, sessionTitle);
        break;
      case 'markdown':
        ChatExport.exportAsMarkdown(exportMessages, religion, sessionTitle);
        break;
    }

    Analytics.trackEvent('chat_exported', religion, currentSessionId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Add transition overlay for going back too
  if (isTransitioning) {
    return (
      <div
        className="min-h-screen relative overflow-hidden bg-white flex items-center justify-center"
        style={{
          backgroundImage:
            'url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNkanZobTJ2Y3FhNmJxdXdzaGw5NGl0aTh6bmVydHJ4aDB3MzRpOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FESFit0BwFBkk9rkLb/giphy.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-center">
          {/* Animated logo during transition */}
          <div className="relative mb-3">
            <img
              src="https://i.imgur.com/PlWBSjs.gif"
              alt="Religion Logo"
              className="w-16 h-auto mx-auto animate-pulse"
            />
            {/* Radial glow effect */}
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-ping"></div>
          </div>

          {/* Loading text */}
          <p className="text-white/90 text-sm" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            Returning to selection...
          </p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"></div>
            <div
              className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            'url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNkanZobTJ2Y3FhNmJxdXdzaGw5NGl0aTh6bmVydHJ4aDB3MzRpOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FESFit0BwFBkk9rkLb/giphy.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: 'url(https://i.imgur.com/llHxOih.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header */}
      <ChatHeader onBack={onBack} onSignOut={signOut} />

      {/* Chat Controls */}
      <ChatControls
        onNewChat={handleNewChat}
        onChatHistory={handleChatHistory}
        onExportChat={() => setShowExportModal(true)}
        hasMessages={messages.length > 0}
      />

      {/* Main Content */}
      <div className="pt-32 pb-8 px-8 h-screen">
        <div className="max-w-7xl mx-auto h-full">
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 h-full relative overflow-hidden">
            {/* Radiance effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none rounded-3xl"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

            {/* Connection Error Banner */}
            {connectionError && (
              <div className="absolute top-4 left-4 right-4 z-40">
                <div className="bg-red-500/80 backdrop-blur-sm text-white px-4 py-3 rounded-2xl border border-red-400/20 flex items-center justify-between">
                  <span className="text-sm">{connectionError}</span>
                  {retryCount < 3 && (
                    <button
                      onClick={handleRetry}
                      className="text-sm underline hover:no-underline ml-4"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            {showHistory ? (
              <ChatHistoryView
                chatSessions={chatSessions}
                loadingHistory={loadingHistory}
                religion={religion}
                onBack={() => setShowHistory(false)}
                onChatSessionClick={handleChatSessionClick}
                onDeleteChat={handleDeleteChat}
                deletingSessionId={deletingSessionId}
                formatDate={formatDate}
              />
            ) : (
              <ChatView
                messages={messages}
                inputValue={inputValue}
                isLoading={isLoading}
                loadingSession={loadingSession}
                religion={religion}
                onInputChange={setInputValue}
                onSendMessage={handleSubmit}
                onStopResponse={handleStopResponse}
              />
            )}

            {/* Export Modal */}
            <ExportModal
              isOpen={showExportModal}
              onClose={() => setShowExportModal(false)}
              onExport={handleExportChat}
              religion={religion}
              messageCount={messages.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
