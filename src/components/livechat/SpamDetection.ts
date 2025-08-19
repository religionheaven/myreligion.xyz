import {
  SPAM_DETECTION_CONFIG,
  LINK_PATTERNS,
  CRYPTO_PATTERNS,
  CONTACT_PATTERNS,
  CRYPTO_KEYWORDS,
  SUSPICIOUS_PATTERNS,
} from './constants';

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
