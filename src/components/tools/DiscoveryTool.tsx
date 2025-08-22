import React, { useState } from 'react';
import { Globe, ExternalLink } from 'lucide-react';

export function DiscoveryTool() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-xs lg:max-w-md xl:max-w-lg px-4">
        <Globe className="w-12 lg:w-14 xl:w-16 h-12 lg:h-14 xl:h-16 text-white/60 mx-auto mb-4 lg:mb-6" />
        <h3
          className="text-white font-medium text-lg lg:text-xl xl:text-2xl mb-3 lg:mb-4"
          style={{ fontFamily: 'Poiret One, sans-serif' }}
        >
          Discovery Tool
        </h3>
        <p className="text-white/60 text-sm lg:text-base xl:text-lg mb-4 lg:mb-6 leading-relaxed">
          SDK Integration with heaven.xyz coming soon
        </p>
        <p className="text-white/40 text-xs lg:text-sm mb-6 lg:mb-8 leading-relaxed">
          This tool will help users find upcoming token runners through heaven.xyz integration, 
          enabling better trading decisions with real-time market data and analytics.
        </p>
        <a
          href="https://heaven.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-105 border border-white/20 text-sm lg:text-base"
        >
          <span className="font-medium">Visit Heaven.xyz</span>
          <ExternalLink className="w-3 lg:w-4 h-3 lg:h-4" />
        </a>
      </div>
    </div>
  );
}