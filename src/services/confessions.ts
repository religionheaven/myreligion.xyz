import { supabase } from '../lib/supabase';

export interface Confession {
  id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
  updated_at: string;
  user_vote?: 'upvote' | 'downvote' | null;
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
      let query = supabase.from('confessions').select('*');

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
        };
      });
    } catch (error) {
      console.error('Error in getConfessions:', error);
      return [];
    }
  }

  // Submit a new confession
  static async submitConfession(content: string): Promise<boolean> {
    try {
      if (!content.trim()) {
        return false;
      }

      const { error } = await supabase.from('confessions').insert({
        content: content.trim(),
      });

      if (error) {
        console.error('Error submitting confession:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in submitConfession:', error);
      return false;
    }
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