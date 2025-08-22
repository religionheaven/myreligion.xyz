import React, { useState } from 'react';
import { Search, TrendingUp, Zap, Globe, Code, ExternalLink } from 'lucide-react';

export function DiscoveryTool() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-lg">
        <Globe className="w-16 h-16 text-white/60 mx-auto mb-6" />
        <h3
          className="text-white font-medium text-2xl mb-4"
          style={{ fontFamily: 'Poiret One, sans-serif' }}
        >
          Discovery Tool
        </h3>
        <p className="text-white/60 text-lg mb-6 leading-relaxed">
          SDK Integration with heaven.xyz coming soon
        </p>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          This tool will help users find upcoming token runners through heaven.xyz integration, 
          enabling better trading decisions with real-time market data and analytics.
        </p>
        <a
          href="https://heaven.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border border-white/20"
        >
          <span className="text-sm font-medium">Visit Heaven.xyz</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}