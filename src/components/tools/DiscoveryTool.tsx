import React, { useState } from 'react';
import { Search, TrendingUp, Zap, Globe, Code, ExternalLink } from 'lucide-react';

export function DiscoveryTool() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h3
          className="text-white font-medium mb-4 text-2xl"
          style={{ fontFamily: 'Poiret One, sans-serif' }}
        >
          Discovery
        </h3>
        <p className="text-white/60 text-sm">
          heaven.xyz SDK + AI Integration: Smarter discovery. Better trading.
        </p>
      </div>

      {/* SDK Status */}
      <div className="mb-6">
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-6 h-6 text-blue-400" />
            <h4 className="text-white font-medium text-lg" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Heaven.xyz SDK Integration
            </h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Connection Status</span>
              <span className="text-yellow-400 text-sm">Pending Integration</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">API Version</span>
              <span className="text-white/60 text-sm">v1.0 (Coming Soon)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Token Discovery</span>
              <span className="text-white/60 text-sm">Not Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-4" style={{ fontFamily: 'Poiret One, sans-serif' }}>
          Planned Features
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Token Runners</span>
            </div>
            <p className="text-white/60 text-sm">
              Real-time discovery of upcoming token launches and trending opportunities
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Trading Signals</span>
            </div>
            <p className="text-white/60 text-sm">
              Advanced analytics and signals for better trading decisions
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Market Research</span>
            </div>
            <p className="text-white/60 text-sm">
              Deep market analysis and research tools for informed trading
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Cross-Platform</span>
            </div>
            <p className="text-white/60 text-sm">
              Seamless integration across multiple trading platforms and exchanges
            </p>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/10 rounded-2xl p-8 border border-white/20 max-w-md">
            <Globe className="w-16 h-16 text-white/60 mx-auto mb-4" />
            <h4
              className="text-white font-medium text-xl mb-3"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              SDK Integration In Progress
            </h4>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              We're currently awaiting the SDK integration with heaven.xyz to bring you powerful 
              token discovery and trading tools. This will enable real-time access to upcoming 
              token runners and advanced trading analytics.
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
      </div>
    </div>
  );
}