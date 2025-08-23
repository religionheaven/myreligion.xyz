import React, { useState } from "react";

export function AvatarTool() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color");

  const downloadAvatar = async () => {
    if (!selectedAvatar) return;

    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 500;
      canvas.height = 500;

      // Draw background
      if (backgroundType === "color") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, 500, 500);
      } else if (backgroundType === "image" && backgroundImage) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        await new Promise((resolve) => {
          bgImg.onload = resolve;
          bgImg.src = backgroundImage;
        });
        ctx.drawImage(bgImg, 0, 0, 500, 500);
      } else {
        // Default white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 500, 500);
      }

      // Draw avatar
      const avatarImg = new Image();
      avatarImg.crossOrigin = "anonymous";
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
          const link = document.createElement("a");
          link.href = url;
          link.download = "avatar.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");
    } catch (error) {
      console.error("Error downloading avatar:", error);
    }
  };

  // Predefined avatar options from database
  const avatarOptions = [
    { id: "white", name: "White", url: "https://i.imgur.com/5YjvR61.png" },
    { id: "black", name: "Black", url: "https://i.imgur.com/YF9ZSrq.png" },
    { id: "christian", name: "Christian", url: "https://i.imgur.com/KLkXhhW.png" },
    { id: "jewish", name: "Jewish", url: "https://i.imgur.com/WaBoB1X.png" },
    { id: "islamic", name: "Islamic", url: "https://i.imgur.com/JkLEbS3.png" },
    { id: "hindu", name: "Hindu", url: "https://i.imgur.com/fhaXuTH.png" },
    { id: "nga", name: "Nigga", url: "https://i.imgur.com/5eZqdQy.png" },
    { id: "yzy", name: "YZY", url: "https://i.imgur.com/OZ097br.png" },
    { id: "degen", name: "Degenerate", url: "https://i.imgur.com/kyc0s9S.png" },
    { id: "atheism", name: "Atheism", url: "https://i.imgur.com/he4T80b.png" },
  ];

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
        setBackgroundType("image");
      };
      reader.readAsDataURL(file);
    }
  };

  const getBackgroundStyle = () => {
    if (backgroundType === "image" && backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return {
      backgroundColor: backgroundColor,
    };
  };

  return (
    <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 xl:gap-8 h-full overflow-hidden">
      {/* Background Controls - Left Side */}
      <div className="w-full xl:w-80 space-y-4 lg:space-y-6 flex-shrink-0">
        <div className="bg-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20">
          <h3
            className="text-white font-medium mb-3 lg:mb-4 text-base lg:text-lg"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Background
          </h3>

          {/* Background Type Toggle */}
          <div className="flex bg-white/20 backdrop-blur-sm rounded-lg lg:rounded-xl p-1 mb-3 lg:mb-4 border border-white/20">
            <button
              onClick={() => setBackgroundType("color")}
              className={`flex-1 py-2 px-2 lg:px-3 rounded-md lg:rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 ${
                backgroundType === "color"
                  ? "bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setBackgroundType("image")}
              className={`flex-1 py-2 px-2 lg:px-3 rounded-md lg:rounded-lg text-xs lg:text-sm font-medium transition-all duration-300 ${
                backgroundType === "image"
                  ? "bg-black/80 text-white shadow-lg backdrop-blur-sm border border-white/20"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Image
            </button>
          </div>

          {/* Color Picker */}
          {backgroundType === "color" && (
            <div className="space-y-2 lg:space-y-3">
              <label className="block text-white/80 text-xs lg:text-sm">Background Color</label>
              <div className="flex items-center gap-2 lg:gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 lg:w-10 xl:w-12 h-8 lg:h-10 xl:h-12 rounded-md lg:rounded-lg border border-white/30 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-2 lg:px-3 py-1.5 lg:py-2 bg-white/10 border border-white/30 rounded-md lg:rounded-lg text-white placeholder-white/60 text-xs lg:text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          )}

          {/* Image Upload */}
          {backgroundType === "image" && (
            <div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="hidden"
                />
                <div className="bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg lg:rounded-xl p-3 lg:p-4 cursor-pointer transition-all duration-300 hover:scale-105 text-center">
                  <img
                    src="https://i.imgur.com/5YjvR61.png"
                    alt="Upload"
                    className="w-4 lg:w-5 xl:w-6 h-4 lg:h-5 xl:h-6 mx-auto mb-1 lg:mb-2"
                  />
                  <span className="text-white/80 text-xs lg:text-sm">
                    {backgroundImage ? "Change Background" : "Upload Background"}
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* GIF Image */}
        <div className="flex justify-center overflow-hidden">
          <img
            src="https://i.imgur.com/7iYbMnL.gif"
            alt="Avatar Tool"
            className="w-auto h-20 lg:h-24 xl:h-32 object-contain max-w-full"
          />
        </div>
        {/* Download Button */}
        <div className="bg-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20">
          <button
            onClick={downloadAvatar}
            disabled={!selectedAvatar}
            className="w-full bg-white/80 hover:bg-white/90 text-black py-2 lg:py-3 rounded-lg lg:rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm lg:text-base"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Download Avatar
          </button>
        </div>
      </div>

      {/* Avatar Preview - Center */}
      <div className="flex-1 flex items-center justify-center min-w-0 overflow-hidden mt-4 xl:mt-0">
        <div className="relative">
          <div
            className="w-[clamp(250px,30vw,400px)] h-[clamp(250px,30vw,400px)] rounded-xl lg:rounded-2xl border-2 border-white/20 overflow-hidden flex items-center justify-center"
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
                <p style={{ fontFamily: "Poiret One, sans-serif" }}>Select an avatar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection - Right Side */}
      <div className="w-full xl:w-80 flex-shrink-0 overflow-hidden mt-4 xl:mt-0">
        <div className="bg-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-6 border border-white/20">
          <h3
            className="text-white font-medium mb-3 lg:mb-4 text-base lg:text-lg"
            style={{ fontFamily: "Poiret One, sans-serif" }}
          >
            Choose Avatar
          </h3>
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 lg:gap-3 max-h-48 lg:max-h-64 overflow-y-auto custom-scrollbar">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.url)}
                className={`relative p-2 lg:p-3 rounded-lg lg:rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer flex-shrink-0 ${
                  selectedAvatar === avatar.url
                    ? "border-white/60 bg-white/20"
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                }`}
              >
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-full h-10 lg:h-12 xl:h-16 object-contain mb-1 lg:mb-2"
                />
                <span className="text-white/80 text-xs lg:text-sm block">{avatar.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
