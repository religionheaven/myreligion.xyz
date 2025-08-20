import { supabase } from '../lib/supabase';

export interface Confession {
  id: string;
  user_id?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
  updated_at: string;
  user_vote?: 'upvote' | 'downvote' | null;
  is_own?: boolean;
}

export interface ConfessionVote {
  id: string;
  confession_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export type SortOption = 'recent' | 'top' | 'lowest';

export class ConfessionService {
  // Get confessions with optional sorting
  static async getConfessions(
    sortBy: SortOption = 'recent',
    limit: number = 50,
    userId?: string,
  ): Promise<Confession[]> {
    try {
      let query = supabase.from('confessions').select('id, user_id, content, upvotes, downvotes, score, created_at, updated_at');

      // Apply sorting
      switch (sortBy) {
        case 'top':
          query = query.order('score', { ascending: false });
          break;
        case 'lowest':
          query = query.order('score', { ascending: true });
          break;
        case 'recent':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      query = query.limit(limit);

      const { data: confessions, error } = await query;

      if (error) {
        console.error('Error fetching confessions:', error);
        return [];
      }

      if (!confessions || confessions.length === 0) {
        return [];
      }

      // Get user votes if userId is provided
      let userVotes: ConfessionVote[] = [];
      if (userId) {
        const confessionIds = confessions.map((c) => c.id);
        const { data: votes, error: votesError } = await supabase
          .from('confession_votes')
          .select('*')
          .eq('user_id', userId)
          .in('confession_id', confessionIds);

        if (!votesError && votes) {
          userVotes = votes;
        }
      }

      // Map confessions with user votes
      return confessions.map((confession) => {
        const userVote = userVotes.find((vote) => vote.confession_id === confession.id);
        console.log(`Loading confession ${confession.id}: upvotes=${confession.upvotes}, downvotes=${confession.downvotes}, score=${confession.score}`);
        return {
          ...confession,
          user_vote: userVote?.vote_type || null,
          is_own: userId ? confession.user_id === userId : false,
        };
      });
    } catch (error) {
      console.error('Error in getConfessions:', error);
      return [];
    }
  }

  // Submit a new confession
  static async submitConfession(content: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!content.trim()) {
        return { success: false, error: 'Content cannot be empty' };
      }

      // Check content for prohibited patterns
      const contentCheck = this.validateConfessionContent(content);
      if (!contentCheck.isValid) {
        return { success: false, error: contentCheck.error };
      }

      // Check user confession limit
      const { data: existingConfessions, error: countError } = await supabase
        .from('confessions')
        .select('id')
        .eq('user_id', userId);

      if (countError) {
        console.error('Error checking confession count:', countError);
        return { success: false, error: 'Failed to check confession limit' };
      }

      if (existingConfessions && existingConfessions.length >= 2) {
        return { success: false, error: 'You can only submit 2 confessions maximum' };
      }

      const { error } = await supabase.from('confessions').insert({
        user_id: userId,
        content: content.trim(),
      });

      if (error) {
        console.error('Error submitting confession:', error);
        return { success: false, error: 'Failed to submit confession' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in submitConfession:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Validate confession content
  private static validateConfessionContent(content: string): { isValid: boolean; error?: string } {
    // Check for links
    const linkPatterns = [
      /https?:\/\/[^\s]+/gi,
      /www\.[^\s]+/gi,
      /[a-zA-Z0-9-]+\.(com|org|net|edu|gov|mil|int|co|io|me|tv|cc|ly|be|to|it|us|uk|ca|de|fr|jp|au|in|br|ru|cn|za|mx|es|nl|se|no|dk|fi|pl|cz|hu|ro|bg|hr|si|sk|lt|lv|ee|is|ie|pt|gr|tr|il|ae|sa|eg|ma|ng|ke|gh|tz|ug|zw|zm|mw|bw|sz|ls|na|ao|mz|mg|mu|sc|re|yt|km|dj|so|et|er|sd|ss|td|cf|cm|gq|ga|cg|cd|st|gw|gn|sl|lr|ci|bf|ml|ne|sn|gm|cv|mr)/gi,
      /bit\.ly|tinyurl|t\.co|goo\.gl|short\.link|ow\.ly|is\.gd|buff\.ly/gi,
      /discord\.gg|discord\.com\/invite/gi,
      /youtube\.com|youtu\.be|vimeo\.com|twitch\.tv/gi,
      /facebook\.com|instagram\.com|twitter\.com|x\.com|tiktok\.com|snapchat\.com/gi,
      /[^\s]*\.[a-zA-Z]{2,}[^\s]*/gi,
    ];

    const containsLink = linkPatterns.some(pattern => pattern.test(content));
    if (containsLink) {
      return { isValid: false, error: 'Links are not allowed in confessions' };
    }

    // Check for contact information - STRICTLY PROHIBITED
    const contactPatterns = [
      // Email addresses
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi, // Email
      // Phone numbers (various formats)
      /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, // Phone
      /\b(?:\+?[0-9]{1,4}[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b/g, // International phone
      // Social media and messaging platforms
      /\btelegram\.me\/[a-zA-Z0-9_]+/gi,
      /\bt\.me\/[a-zA-Z0-9_]+/gi,
      /\b@[a-zA-Z0-9_]{1,15}\b/g, // Social handles
      /\binsta\s*:\s*[a-zA-Z0-9_]+/gi,
      /\bsnap\s*:\s*[a-zA-Z0-9_]+/gi,
      /\btiktok\s*:\s*[a-zA-Z0-9_]+/gi,
      // Contact requests
      /\bdm\s+me\b/gi,
      /\bcontact\s+me\b/gi,
      /\bmessage\s+me\b/gi,
      /\btext\s+me\b/gi,
      /\bcall\s+me\b/gi,
      /\bhit\s+me\s+up\b/gi,
      /\bhmu\b/gi,
      // Messaging apps
      /\bwhatsapp\b/gi,
      /\bskype\b/gi,
      /\bdiscord\b/gi,
      /\bsignal\b/gi,
      /\bviber\b/gi,
      /\bkik\b/gi,
      /\bline\s+app\b/gi,
      /\bwechat\b/gi,
      // Crypto addresses (common patterns)
      /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/g, // Bitcoin
      /\b0x[a-fA-F0-9]{40}\b/g, // Ethereum
      /\b[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}\b/g, // Litecoin
      /\bbc1[a-z0-9]{39,59}\b/gi, // Bitcoin Bech32
      // Generic contact patterns
      /\bfind\s+me\s+on\b/gi,
      /\badd\s+me\s+on\b/gi,
      /\bfollow\s+me\s+on\b/gi,
      /\bmy\s+[a-zA-Z]+\s+is\s+[a-zA-Z0-9_@.]+/gi,
    ];

    const containsContact = contactPatterns.some(pattern => pattern.test(content));
    if (containsContact) {
      return { isValid: false, error: 'Contact information is STRICTLY PROHIBITED in confessions' };
    }

    return { isValid: true };
  }

  // Vote on a confession
  static async voteOnConfession(
    confessionId: string,
    userId: string,
    voteType: 'upvote' | 'downvote',
  ): Promise<boolean> {
    try {
      console.log(`Starting vote operation: ${voteType} on ${confessionId} by ${userId}`);
      
      // Check if user already voted on this confession
      const { data: existingVote, error: fetchError } = await supabase
        .from('confession_votes')
        .select('*')
        .eq('confession_id', confessionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing vote:', fetchError);
        return false;
      }

      console.log('Existing vote:', existingVote);

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Same vote type - remove the vote (toggle off)
          console.log('Removing existing vote');
          const { error: deleteError } = await supabase
            .from('confession_votes')
            .delete()
            .eq('id', existingVote.id);

          if (deleteError) {
            console.error('Error removing vote:', deleteError);
            return false;
          }
        } else {
          // Different vote type - update the vote
          console.log('Updating existing vote');
          const { error: updateError } = await supabase
            .from('confession_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);

          if (updateError) {
            console.error('Error updating vote:', updateError);
            return false;
          }
        }
      } else {
        // No existing vote - create new vote
        console.log('Creating new vote');
        const { error: insertError } = await supabase.from('confession_votes').insert({
          confession_id: confessionId,
          user_id: userId,
          vote_type: voteType,
        });

        if (insertError) {
          console.error('Error inserting vote:', insertError);
          return false;
        }
      }

      console.log('Vote operation completed, waiting for trigger...');
      
      // Wait a moment for database triggers to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the counts were updated by the trigger
      const { data: updatedConfession, error: verifyError } = await supabase
        .from('confessions')
        .select('upvotes, downvotes, score')
        .eq('id', confessionId)
        .single();
        
      if (verifyError) {
        console.error('Error verifying confession update:', verifyError);
        // Fallback to manual update if trigger failed
        await this.updateConfessionCounts(confessionId);
      } else {
        console.log('Confession after trigger:', updatedConfession);
        // If trigger didn't work, do manual update
        if (updatedConfession.upvotes === 0 && updatedConfession.downvotes === 0 && updatedConfession.score === 0) {
          console.log('Trigger did not update counts, doing manual update');
          await this.updateConfessionCounts(confessionId);
        }
      }

      return true;
    } catch (error) {
      console.error('Error in voteOnConfession:', error);
      return false;
    }
  }

  // Manually update confession vote counts and score
  private static async updateConfessionCounts(confessionId: string): Promise<void> {
    try {
      console.log(`Manual count update for confession ${confessionId}`);
      
      // Get current vote counts
      const { data: votes, error: votesError } = await supabase
        .from('confession_votes')
        .select('vote_type')
        .eq('confession_id', confessionId);

      if (votesError) {
        console.error('Error fetching votes for count update:', votesError);
        return;
      }

      console.log(`Found ${votes?.length || 0} votes for confession ${confessionId}:`, votes);
      
      const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0;
      const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0;
      const score = upvotes - downvotes;

      console.log(`Calculated counts: upvotes=${upvotes}, downvotes=${downvotes}, score=${score}`);
      
      // Update the confession with new counts
      const { error: updateError } = await supabase
        .from('confessions')
        .update({
          upvotes,
          downvotes,
          score
        })
        .eq('id', confessionId);

      if (updateError) {
        console.error('Error updating confession counts:', updateError);
        return;
      }

      console.log(`Updated confession ${confessionId}: upvotes=${upvotes}, downvotes=${downvotes}, score=${score}`);
      
      // Verify the update worked
      const { data: updatedConfession, error: verifyError } = await supabase
        .from('confessions')
        .select('upvotes, downvotes, score')
        .eq('id', confessionId)
        .single();
        
      if (verifyError) {
        console.error('Error verifying confession update:', verifyError);
      } else {
        console.log(`Verified confession ${confessionId} after manual update:`, updatedConfession);
      }
    } catch (error) {
      console.error('Error in updateConfessionCounts:', error);
    }
  }

  // Get confession statistics
  static async getConfessionStats(): Promise<{
    totalConfessions: number;
    totalVotes: number;
    topConfession: Confession | null;
  }> {
    try {
      const [confessionsResult, votesResult, topResult] = await Promise.all([
        supabase.from('confessions').select('*', { count: 'exact', head: true }),
        supabase.from('confession_votes').select('*', { count: 'exact', head: true }),
        supabase
          .from('confessions')
          .select('*')
          .order('score', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        totalConfessions: confessionsResult.count || 0,
        totalVotes: votesResult.count || 0,
        topConfession: topResult.data || null,
      };
    } catch (error) {
      console.error('Error getting confession stats:', error);
      return {
        totalConfessions: 0,
        totalVotes: 0,
        topConfession: null,
      };
    }
  }

  // Delete a confession (admin only)
  static async deleteConfession(confessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('confessions').delete().eq('id', confessionId);

      if (error) {
        console.error('Error deleting confession:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteConfession:', error);
      return false;
    }
  }
}