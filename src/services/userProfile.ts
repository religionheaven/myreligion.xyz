import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  profile_photo_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export class UserProfileService {
  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Create or update user profile
  static async upsertUserProfile(
    userId: string,
    updates: Partial<Pick<UserProfile, 'username' | 'profile_photo_url' | 'bio'>>,
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            ...updates,
          },
          {
            onConflict: 'user_id',
          },
        )
        .select()
        .single();

      if (error) {
        console.error('Error upserting user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertUserProfile:', error);
      return null;
    }
  }

  // Upload profile photo to Supabase Storage
  static async uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be smaller than 5MB');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      // Update user profile with new photo URL
      await this.upsertUserProfile(userId, {
        profile_photo_url: photoUrl,
      });

      return photoUrl;
    } catch (error) {
      console.error('Error in uploadProfilePhoto:', error);
      return null;
    }
  }

  // Delete profile photo
  static async deleteProfilePhoto(userId: string): Promise<boolean> {
    try {
      // Get current profile to find photo URL
      const profile = await this.getUserProfile(userId);
      if (!profile?.profile_photo_url) {
        return true; // No photo to delete
      }

      // Extract filename from URL
      const url = new URL(profile.profile_photo_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting file:', deleteError);
        return false;
      }

      // Update profile to remove photo URL
      await this.upsertUserProfile(userId, {
        profile_photo_url: null,
      });

      return true;
    } catch (error) {
      console.error('Error in deleteProfilePhoto:', error);
      return false;
    }
  }

  // Initialize user profile (call this when user signs up or first logs in)
  static async initializeUserProfile(
    userId: string,
    username?: string,
  ): Promise<UserProfile | null> {
    try {
      // Check if profile already exists
      const existingProfile = await this.getUserProfile(userId);
      if (existingProfile) {
        return existingProfile;
      }

      // Create new profile
      return await this.upsertUserProfile(userId, {
        username: username || 'User',
      });
    } catch (error) {
      console.error('Error in initializeUserProfile:', error);
      return null;
    }
  }
}
