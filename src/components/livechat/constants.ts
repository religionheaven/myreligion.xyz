// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

export const SPAM_DETECTION_CONFIG = {
  DUPLICATE_CHECK_LIMIT: 5,
  MIN_MESSAGE_INTERVAL: 1500, // 1.5 seconds base interval
  MAX_CAPS_RATIO: 0.7,
  MAX_REPEATED_CHARS: 4,
  MAX_EMOJIS: 5,
  MAX_PUNCTUATION_RATIO: 0.3,
  COOLDOWN_DURATION: 3000, // 3 seconds base cooldown (matches existing)
  RATE_LIMIT_COOLDOWN: 5000, // 5 seconds for rate limit violations

  // Progressive rate limiting
  RATE_LIMIT_WINDOWS: {
    SHORT: { duration: 15000, maxMessages: 5 }, // 5 messages in 15 seconds
    MEDIUM: { duration: 30000, maxMessages: 9 }, // 9 messages in 30 seconds (your original idea)
    LONG: { duration: 60000, maxMessages: 15 }, // 15 messages in 1 minute
  },

  // Progressive penalties
  PENALTIES: {
    FIRST_VIOLATION: 90000, // 1 minute 30 seconds total
    SECOND_VIOLATION: 180000, // 3 minutes total
    THIRD_VIOLATION: 300000, // 5 minutes total
    PERSISTENT_VIOLATION: 600000, // 10 minutes total
  },

  // Reset violation count after this period of good behavior
  VIOLATION_RESET_TIME: 300000, // 5 minutes
};

export const LINK_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /[a-zA-Z0-9-]+\.(com|org|net|edu|gov|mil|int|co|io|me|tv|cc|ly|be|to|it|us|uk|ca|de|fr|jp|au|in|br|ru|cn|za|mx|es|nl|se|no|dk|fi|pl|cz|hu|ro|bg|hr|si|sk|lt|lv|ee|is|ie|pt|gr|tr|il|ae|sa|eg|ma|ng|ke|gh|tz|ug|zw|zm|mw|bw|sz|ls|na|ao|mz|mg|mu|sc|re|yt|km|dj|so|et|er|sd|ss|td|cf|cm|gq|ga|cg|cd|st|gw|gn|sl|lr|ci|bf|ml|ne|sn|gm|cv|mr)/gi,
  /[a-zA-Z0-9-]+\.([a-zA-Z]{2,})/gi,
  /bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|ow\.ly|is\.gd|buff\.ly/gi,
  /discord\.gg|discord\.com\/invite/gi,
  /youtube\.com|youtu\.be|vimeo\.com|twitch\.tv/gi,
  /facebook\.com|instagram\.com|twitter\.com|x\.com|tiktok\.com|snapchat\.com/gi,
  /[^\s]*\.[a-zA-Z]{2,}[^\s]*/gi,
];

export const CRYPTO_PATTERNS = [
  /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g,
  /\b0x[a-fA-F0-9]{40}\b/g,
  /\b[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}\b/g,
  /\bbc1[a-z0-9]{39,59}\b/gi,
  /\b[rX][a-zA-Z0-9]{24,34}\b/g,
  /\b[A-Za-z0-9]{32,44}\b/g,
  /\bDQm[a-zA-Z0-9]{44}\b/g,
  /\b[a-zA-Z0-9]{26,35}\.eth\b/gi,
];

export const CONTACT_PATTERNS = [
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
  /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  /\btelegram\.me\/[a-zA-Z0-9_]+/gi,
  /\bt\.me\/[a-zA-Z0-9_]+/gi,
  /\b@[a-zA-Z0-9_]{1,15}\b/g,
  /\bdm\s+me\b/gi,
  /\bcontact\s+me\b/gi,
  /\bmessage\s+me\b/gi,
  /\bwhatsapp\b/gi,
  /\bskype\b/gi,
];

export const CRYPTO_KEYWORDS = [
  /\b(bitcoin|btc|ethereum|eth|crypto|blockchain|defi|nft|token|coin|mining|wallet|hodl|moon|lambo|diamond\s+hands|paper\s+hands|ape|degen|rugpull|pump|dump|shill|fud)\b/gi,
  /\b(binance|coinbase|kraken|uniswap|pancakeswap|metamask|trust\s+wallet|ledger|trezor)\b/gi,
  /\b(solana|sol|cardano|ada|polkadot|dot|chainlink|link|dogecoin|doge|shiba|inu)\b/gi,
  /\b(yield\s+farming|liquidity\s+pool|staking|airdrop|ico|ido|presale|whitelist)\b/gi,
  /\b(web3|dao|metaverse|gamefi|play\s+to\s+earn|p2e)\b/gi,
];

export const SUSPICIOUS_PATTERNS = [
  /\b(free\s+money|easy\s+money|get\s+rich|make\s+money\s+fast)\b/gi,
  /\b(click\s+here|visit\s+now|act\s+now|limited\s+time)\b/gi,
  /\b(100%\s+guaranteed|risk\s+free|no\s+risk)\b/gi,
  /\b(investment\s+opportunity|passive\s+income|financial\s+freedom)\b/gi,
  /\b(mlm|pyramid\s+scheme|ponzi|referral\s+program)\b/gi,
  /\b(forex|trading\s+signals|binary\s+options)\b/gi,
  /\b(work\s+from\s+home|make\s+money\s+online|earn\s+from\s+home)\b/gi,
];
