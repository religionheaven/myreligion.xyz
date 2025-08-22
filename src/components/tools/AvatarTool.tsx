import React, { useState } from 'react';
import { Upload, Palette } from 'lucide-react';

export function AvatarTool() {
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
        setBackgroundType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundType === 'image' && backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return {
      backgroundColor: backgroundColor,
    };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Avatar Preview */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div
            className="w-[500px] h-[500px] rounded-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center"
            style={getBackgroundStyle()}
          >
            {avatarImage ? (
              <img
                src={avatarImage}
                alt="Avatar"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white/60 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4" />
                <p style={{ fontFamily: 'Poiret One, sans-serif' }}>
                  Upload your avatar image
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Avatar Upload */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3
            className="text-white font-medium mb-4 text-lg"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Avatar Image
          </h3>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 text-center">
              <Upload className="w-6 h-6 text-white/80 mx-auto mb-2" />
              <span className="text-white/80 text-sm">
                {avatarImage ? 'Change Avatar' : 'Upload Avatar'}
              </span>
            </div>
          </label>
        </div>

        {/* Background Controls */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3
            className="text-white font-medium mb-4 text-lg"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Background
          </h3>

          {/* Background Type Toggle */}
          <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1 mb-4 border border-white/20">
            <button
              onClick={() => setBackgroundType('color')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                backgroundType === 'color'
                  ? 'bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setBackgroundType('image')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                backgroundType === 'image'
                  ? 'bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Image
            </button>
          </div>

          {/* Color Picker */}
          {backgroundType === 'color' && (
            <div className="space-y-3">
              <label className="block text-white/80 text-sm">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-white/30 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          )}

          {/* Image Upload */}
          {backgroundType === 'image' && (
            <div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="hidden"
                />
                <div className="bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 text-center">
                  <Palette className="w-6 h-6 text-white/80 mx-auto mb-2" />
                  <span className="text-white/80 text-sm">
                    {backgroundImage ? 'Change Background' : 'Upload Background'}
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Download Button */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <button
            disabled={!avatarImage}
            className="w-full bg-white/80 hover:bg-white/90 text-black py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Download Avatar
          </button>
        </div>
      </div>
    </div>
  );
}