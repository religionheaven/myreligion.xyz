import { supabase } from '../lib/supabase';

export interface ReligionClickData {
  religion: string;
  click_count: number;
}

export class ReligionClickService {
  // Get click counts for all religions
  static async getAllClickCounts(): Promise<ReligionClickData[]> {
    const { data, error } = await supabase
      .from('religion_clicks')
      .select('religion, click_count')
      .order('religion');

    if (error) {
      console.error('Error fetching click counts:', error);
      return [];
    }

    return data || [];
  }

  // Increment click count for a specific religion
  static async incrementClickCount(religion: string): Promise<boolean> {
    try {
      // Try to increment existing record, or insert if it doesn't exist
      const { data: existingData, error: fetchError } = await supabase
        .from('religion_clicks')
        .select('*')
        .eq('religion', religion)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching current count:', fetchError);
        return false;
      }

      if (existingData) {
        // Update existing record
        const newCount = existingData.click_count + 1;
        const { error: updateError } = await supabase
          .from('religion_clicks')
          .update({ click_count: newCount })
          .eq('religion', religion);

        if (updateError) {
          console.error('Error updating click count:', updateError);
          return false;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('religion_clicks')
          .insert({ religion, click_count: 1 });

        if (insertError) {
          console.error('Error inserting click count:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in incrementClickCount:', error);
      return false;
    }
  }

  // Get click count for a specific religion
  static async getClickCount(religion: string): Promise<number> {
    const { data, error } = await supabase
      .from('religion_clicks')
      .select('click_count')
      .eq('religion', religion)
      .maybeSingle();

    if (error) {
      console.error('Error fetching click count:', error);
      return 0;
    }

    return data?.click_count || 0;
  }

  // Initialize click counts for all religions if they don't exist
  static async initializeClickCounts(): Promise<void> {
    const religions = ['Christianity', 'Judaism', 'Islam', 'Hinduism'];

    for (const religion of religions) {
      try {
        const { data: existing } = await supabase
          .from('religion_clicks')
          .select('id')
          .eq('religion', religion)
          .maybeSingle();

        if (!existing) {
          await supabase.from('religion_clicks').insert({ religion, click_count: 0 });
        }
      } catch (error) {
        console.error(`Error initializing ${religion} click count:`, error);
      }
    }
  }
}
