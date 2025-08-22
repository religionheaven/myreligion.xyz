import React, { useState } from 'react';
import { Palette } from 'lucide-react';

export function AvatarTool() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');

  const downloadAvatar = async () => {
    if (!selectedAvatar) return;

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 500;
      canvas.height = 500;

      // Draw background
      if (backgroundType === 'color') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, 500, 500);
      } else if (backgroundType === 'image' && backgroundImage) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          bgImg.onload = resolve;
          bgImg.src = backgroundImage;
        });
        ctx.drawImage(bgImg, 0, 0, 500, 500);
      } else {
        // Default white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 500, 500);
      }

      // Draw avatar
      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        avatarImg.onload = resolve;
        avatarImg.src = selectedAvatar;
      });

      // Calculate dimensions to fit avatar within canvas while maintaining aspect ratio
      const aspectRatio = avatarImg.width / avatarImg.height;
      let drawWidth = 500;
      let drawHeight = 500;
      let offsetX = 0;
      let offsetY = 0;

      if (aspectRatio > 1) {
        drawHeight = 500 / aspectRatio;
        offsetY = (500 - drawHeight) / 2;
      } else {
        drawWidth = 500 * aspectRatio;
        offsetX = (500 - drawWidth) / 2;
      }

      ctx.drawImage(avatarImg, offsetX, offsetY, drawWidth, drawHeight);

      // Download the image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'avatar.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading avatar:', error);
    }
  };

  // Predefined avatar options from database
  const avatarOptions = [
    { id: 'white', name: 'White', url: 'https://i.imgur.com/5YjvR61.png' },
    { id: 'black', name: 'Black', url: 'https://i.imgur.com/YF9ZSrq.png' },
    { id: 'christian', name: 'Christian', url: 'https://i.imgur.com/KLkXhhW.png' },
    { id: 'jewish', name: 'Jewish', url: 'https://i.imgur.com/WaBoB1X.png' },
    { id: 'islamic', name: 'Islamic', url: 'https://i.imgur.com/JkLEbS3.png' },
    { id: 'hindu', name: 'Hindu', url: 'https://i.imgur.com/fhaXuTH.png' },
    { id: 'nga', name: 'Nigga', url: 'https://i.imgur.com/5eZqdQy.png' },
    { id: 'yzy', name: 'YZY', url: 'https://i.imgur.com/OZ097br.png' },
    { id: 'degen', name: 'Degenerate', url: 'https://i.imgur.com/kyc0s9S.png' },
  ];

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
    <div className="flex gap-8 h-full">
      {/* Background Controls - Left Side */}
      <div className="w-80 space-y-6">
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
                  <img 
                    src="https://i.imgur.com/PlWBSjs.gif" 
                    alt="Upload" 
                    className="w-6 h-6 mx-auto mb-2" 
                  />
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
            onClick={downloadAvatar}
            disabled={!selectedAvatar}
            className="w-full bg-white/80 hover:bg-white/90 text-black py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Download Avatar
          </button>
        </div>
      </div>

      {/* Avatar Preview - Center */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div
            className="w-[500px] h-[500px] rounded-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center"
            style={getBackgroundStyle()}
          >
            {selectedAvatar ? (
              <img
                src={selectedAvatar}
                alt="Avatar"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-white/60 text-center">
                <p style={{ fontFamily: 'Poiret One, sans-serif' }}>
                  Select an avatar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection - Right Side */}
      <div className="w-80">
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3
            className="text-white font-medium mb-4 text-lg"
            style={{ fontFamily: 'Poiret One, sans-serif' }}
          >
            Choose Avatar
          </h3>
          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.url)}
                className={`relative p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  selectedAvatar === avatar.url
                    ? 'border-white/60 bg-white/20'
                    : 'border-white/20 bg-white/10 hover:bg-white/20'
                }`}
              >
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-full h-16 object-contain mb-2"
                />
                <span className="text-white/80 text-xs block">{avatar.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}