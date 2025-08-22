import React, { useState } from "react";
import { X, Camera, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { UserProfileService, UserProfile } from "../services/userProfile";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: () => void;
}

export function ProfileModal({ isOpen, onClose, onProfileUpdate }: ProfileModalProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user profile
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      const userProfile = await UserProfileService.getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Initialize profile if it doesn't exist
        const username = user.user_metadata?.username || "User";
        const newProfile = await UserProfileService.initializeUserProfile(user.id, username);
        setProfile(newProfile);
      }
      setLoading(false);
    };

    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      const photoUrl = await UserProfileService.uploadProfilePhoto(user.id, file);

      if (photoUrl) {
        // Update local state
        setProfile((prev) => (prev ? { ...prev, profile_photo_url: photoUrl } : null));

        // Notify parent component of profile update
        onProfileUpdate?.();
      } else {
        alert("Failed to upload photo. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !user) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/60">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 max-w-md w-full mx-4">
        {/* Radiance effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none rounded-3xl"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3
              className="text-xl text-white font-medium"
              style={{ fontFamily: "Poiret One, sans-serif" }}
            >
              Profile
            </h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center overflow-hidden">
                {profile?.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-12 h-12 text-white/60" />
                )}
              </div>

              {/* Camera overlay */}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/90 transition-colors duration-200">
                <Camera className="w-4 h-4 text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            {isUploading && <div className="text-white/60 text-sm mb-2">Uploading...</div>}

            <button
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              className="text-white/80 hover:text-white text-sm underline transition-colors duration-200"
              disabled={isUploading}
            >
              Change Photo
            </button>
          </div>

          {/* Username */}
          <div className="text-center mb-6">
            <div className="text-white/60 text-sm mb-1">Username</div>
            <div
              className="text-white text-lg font-medium"
              style={{ fontFamily: "Poiret One, sans-serif" }}
            >
              {profile?.username || "User"}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-black/80 backdrop-blur-sm text-white py-3 rounded-2xl font-medium hover:bg-black/90 transition-all duration-300 hover:scale-105 border border-white/20"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
