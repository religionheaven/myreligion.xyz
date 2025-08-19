export class DraftManager {
  private static readonly DRAFT_KEY_PREFIX = 'religion_draft_';
  private static readonly DRAFT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Save draft for a session
  static saveDraft(sessionId: string, content: string): void {
    if (!content.trim()) {
      this.clearDraft(sessionId);
      return;
    }

    try {
      const draft = {
        content: content.trim(),
        timestamp: Date.now(),
      };

      localStorage.setItem(`${this.DRAFT_KEY_PREFIX}${sessionId}`, JSON.stringify(draft));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }

  // Get draft for a session
  static getDraft(sessionId: string): string {
    try {
      const stored = localStorage.getItem(`${this.DRAFT_KEY_PREFIX}${sessionId}`);
      if (!stored) return '';

      const draft = JSON.parse(stored);

      // Check if draft is expired
      if (Date.now() - draft.timestamp > this.DRAFT_EXPIRY) {
        this.clearDraft(sessionId);
        return '';
      }

      return draft.content || '';
    } catch (error) {
      console.error('Error reading draft:', error);
      return '';
    }
  }

  // Clear draft for a session
  static clearDraft(sessionId: string): void {
    try {
      localStorage.removeItem(`${this.DRAFT_KEY_PREFIX}${sessionId}`);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }

  // Clear all expired drafts
  static cleanupDrafts(): void {
    try {
      const keys = Object.keys(localStorage);
      const draftKeys = keys.filter((key) => key.startsWith(this.DRAFT_KEY_PREFIX));

      draftKeys.forEach((key) => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const draft = JSON.parse(stored);
            if (Date.now() - draft.timestamp > this.DRAFT_EXPIRY) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted draft
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up drafts:', error);
    }
  }
}
