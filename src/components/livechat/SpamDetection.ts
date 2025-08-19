import {
  SPAM_PATTERNS,
  INAPPROPRIATE_PATTERNS,
  MAX_MESSAGE_LENGTH,
  MIN_MESSAGE_INTERVAL,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX_MESSAGES,
} from './constants';

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
}

export class SpamDetection {
  private static userMessageHistory = new Map<string, number[]>();

  static checkMessage(
    content: string,
    userId: string,
    messageTimestamps: number[]
  ): SpamCheckResult {
    const now = Date.now();

    // Check rate limiting first (highest priority)
    if (messageTimestamps.length >= RATE_LIMIT_MAX_MESSAGES) {
      const oldestRelevantMessage = messageTimestamps[messageTimestamps.length - RATE_LIMIT_MAX_MESSAGES];
      if (now - oldestRelevantMessage < RATE_LIMIT_WINDOW) {
        return {
          isSpam: true,
          reason: 'Rate limit exceeded',
          severity: 'high'
        };
      }
    }

    // Check message length
    if (content.length > MAX_MESSAGE_LENGTH) {
      return {
        isSpam: true,
        reason: 'Message too long',
        severity: 'medium'
      };
    }

    // Check for empty or whitespace-only messages
    if (!content.trim()) {
      return {
        isSpam: true,
        reason: 'Empty message',
        severity: 'low'
      };
    }

    // Check minimum interval between messages
    const userHistory = this.userMessageHistory.get(userId) || [];
    if (userHistory.length > 0) {
      const lastMessageTime = userHistory[userHistory.length - 1];
      if (now - lastMessageTime < MIN_MESSAGE_INTERVAL) {
        return {
          isSpam: true,
          reason: 'Messages sent too quickly',
          severity: 'medium'
        };
      }
    }

    // Check spam patterns
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(content)) {
        return {
          isSpam: true,
          reason: 'Spam pattern detected',
          severity: 'medium'
        };
      }
    }

    // Check inappropriate content
    for (const pattern of INAPPROPRIATE_PATTERNS) {
      if (pattern.test(content)) {
        return {
          isSpam: true,
          reason: 'Inappropriate content',
          severity: 'high'
        };
      }
    }

    // Update user message history
    const updatedHistory = [...userHistory, now].slice(-20); // Keep last 20 messages
    this.userMessageHistory.set(userId, updatedHistory);

    return {
      isSpam: false,
      severity: 'low'
    };
  }

  static clearUserHistory(userId: string): void {
    this.userMessageHistory.delete(userId);
  }

  static getUserMessageCount(userId: string, timeWindow: number): number {
    const userHistory = this.userMessageHistory.get(userId) || [];
    const now = Date.now();
    return userHistory.filter(timestamp => now - timestamp < timeWindow).length;
  }
}