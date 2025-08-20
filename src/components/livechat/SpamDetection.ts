import {
  SPAM_DETECTION_CONFIG,
  LINK_PATTERNS,
  CRYPTO_PATTERNS,
  CONTACT_PATTERNS,
  CRYPTO_KEYWORDS,
  SUSPICIOUS_PATTERNS,
} from './constants';

// ============================================================================
// RATE LIMITING TRACKER
// ============================================================================

interface UserRateLimit {
  messages: number[];
  violations: number;
  lastViolation: number;
  currentPenalty: number;
}

const userRateLimits = new Map<string, UserRateLimit>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 300000;
  
  for (const [userId, data] of userRateLimits.entries()) {
    // Remove old message timestamps
    data.messages = data.messages.filter(timestamp => timestamp > fiveMinutesAgo);
    
    // Reset violations if user has been good for 5 minutes
    if (data.lastViolation < fiveMinutesAgo) {
      data.violations = 0;
      data.currentPenalty = 0;
    }
    
    // Remove user if no recent activity
    if (data.messages.length === 0 && data.lastViolation < fiveMinutesAgo) {
      userRateLimits.delete(userId);
    }
  }
}, 60000); // Clean up every minute

// ============================================================================
// ENHANCED RATE LIMITING
// ============================================================================

export const checkRateLimit = (userId: string): { 
  isRateLimited: boolean; 
  message: string; 
  cooldownTime: number;
} => {
  const now = Date.now();
  
  // Get or create user rate limit data
  let userData = userRateLimits.get(userId);
  if (!userData) {
    userData = {
      messages: [],
      violations: 0,
      lastViolation: 0,
      currentPenalty: 0
    };
    userRateLimits.set(userId, userData);
  }
  
  // Check if user is currently in penalty period
  if (userData.currentPenalty > 0 && (now - userData.lastViolation) < userData.currentPenalty) {
    const remainingTime = Math.ceil((userData.currentPenalty - (now - userData.lastViolation)) / 1000);
    return {
      isRateLimited: true,
      message: `🚫 Rate limited. Please wait ${remainingTime} seconds before sending another message.`,
      cooldownTime: remainingTime
    };
  }
  
  // Reset penalty if enough time has passed
  if (userData.currentPenalty > 0 && (now - userData.lastViolation) >= userData.currentPenalty) {
    userData.currentPenalty = 0;
  }
  
  // Clean old messages
  const oneMinuteAgo = now - SPAM_DETECTION_CONFIG.RATE_LIMIT_WINDOWS.LONG.duration;
  userData.messages = userData.messages.filter(timestamp => timestamp > oneMinuteAgo);
  
  // Check rate limits (most restrictive first)
  const { SHORT, MEDIUM, LONG } = SPAM_DETECTION_CONFIG.RATE_LIMIT_WINDOWS;
  
  const shortWindowMessages = userData.messages.filter(t => t > now - SHORT.duration).length;
  const mediumWindowMessages = userData.messages.filter(t => t > now - MEDIUM.duration).length;
  const longWindowMessages = userData.messages.filter(t => t > now - LONG.duration).length;
  
  let violation = false;
  let violationType = '';
  
  if (shortWindowMessages >= SHORT.maxMessages) {
    violation = true;
    violationType = 'short';
  } else if (mediumWindowMessages >= MEDIUM.maxMessages) {
    violation = true;
    violationType = 'medium';
  } else if (longWindowMessages >= LONG.maxMessages) {
    violation = true;
    violationType = 'long';
  }
  
  if (violation) {
    userData.violations++;
    userData.lastViolation = now;
    
    // Calculate penalty based on violation count
    const { PENALTIES } = SPAM_DETECTION_CONFIG;
    let penalty = PENALTIES.FIRST_VIOLATION;
    
    if (userData.violations >= 4) {
      penalty = PENALTIES.PERSISTENT_VIOLATION;
    } else if (userData.violations === 3) {
      penalty = PENALTIES.THIRD_VIOLATION;
    } else if (userData.violations === 2) {
      penalty = PENALTIES.SECOND_VIOLATION;
    }
    
    userData.currentPenalty = penalty;
    
    const penaltySeconds = Math.ceil(penalty / 1000);
    let message = `🚫 Sending messages too quickly! Please wait ${penaltySeconds} seconds.`;
    
    if (userData.violations > 1) {
      message += ` (Violation #${userData.violations})`;
    }
    
    return {
      isRateLimited: true,
      message,
      cooldownTime: penaltySeconds
    };
  }
  
  // Add current message timestamp
  userData.messages.push(now);
  
  return {
    isRateLimited: false,
    message: '',
    cooldownTime: 0
  };
};

// ============================================================================
// SPAM DETECTION FUNCTIONS
// ============================================================================

export const detectSpam = (
  message: string,
  recentMessages: string[],
  lastMessageTime: number,
): { isSpam: boolean; message: string } => {
  const lowerMessage = message.toLowerCase();

  // 1. Duplicate message check
  if (recentMessages.includes(message)) {
    return { isSpam: true, message: "🚫 Please don't repeat the same message" };
  }

  // 2. Too frequent messaging
  const now = Date.now();
  if (now - lastMessageTime < SPAM_DETECTION_CONFIG.MIN_MESSAGE_INTERVAL) {
    return { isSpam: true, message: '🚫 Please slow down your messaging' };
  }

  // 3. Excessive caps
  const capsCount = (message.match(/[A-Z]/g) || []).length;
  const letterCount = (message.match(/[A-Za-z]/g) || []).length;
  if (letterCount > 5 && capsCount / letterCount > SPAM_DETECTION_CONFIG.MAX_CAPS_RATIO) {
    return { isSpam: true, message: "🚫 Please don't use excessive caps" };
  }

  // 4. Excessive repetition of characters
  const repeatRegex = new RegExp(`(.)\\1{${SPAM_DETECTION_CONFIG.MAX_REPEATED_CHARS},}`);
  if (repeatRegex.test(message)) {
    return { isSpam: true, message: "🚫 Please don't repeat characters excessively" };
  }

  // 5. Excessive emojis
  const emojiCount = (
    message.match(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    ) || []
  ).length;
  if (emojiCount > SPAM_DETECTION_CONFIG.MAX_EMOJIS) {
    return { isSpam: true, message: '🚫 Please limit emojis to 5 per message' };
  }

  // 6. Suspicious patterns
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(message))) {
    return { isSpam: true, message: '🚫 Promotional content is not allowed' };
  }

  // 7. Excessive punctuation
  const punctuationCount = (message.match(/[!?.,;:]/g) || []).length;
  if (punctuationCount > message.length * SPAM_DETECTION_CONFIG.MAX_PUNCTUATION_RATIO) {
    return { isSpam: true, message: '🚫 Please reduce excessive punctuation' };
  }

  // 8. Only numbers or special characters
  if (/^[0-9\s\W]+$/.test(message) && message.trim().length > 3) {
    return { isSpam: true, message: '🚫 Please write meaningful messages' };
  }

  // 9. Gibberish detection
  if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/.test(message)) {
    return { isSpam: true, message: '🚫 Please write coherent messages' };
  }

  return { isSpam: false, message: '' };
};

export const detectProhibitedContent = (
  message: string,
): { isProhibited: boolean; message: string } => {
  // Check for links
  const containsLink = LINK_PATTERNS.some((pattern) => pattern.test(message));
  if (containsLink) {
    return { isProhibited: true, message: '🚫 Links are not allowed in chat' };
  }

  // Check for crypto addresses
  const containsCrypto = CRYPTO_PATTERNS.some((pattern) => pattern.test(message));
  if (containsCrypto) {
    return { isProhibited: true, message: '🚫 Crypto addresses are not allowed in chat' };
  }

  // Check for contact information
  const containsContact = CONTACT_PATTERNS.some((pattern) => pattern.test(message));
  if (containsContact) {
    return { isProhibited: true, message: '🚫 Contact information is not allowed in chat' };
  }

  // Check for crypto keywords
  const containsCryptoKeywords = CRYPTO_KEYWORDS.some((pattern) => pattern.test(message));
  if (containsCryptoKeywords) {
    return { isProhibited: true, message: '🚫 Crypto promotion is not allowed in chat' };
  }

  return { isProhibited: false, message: '' };
};
