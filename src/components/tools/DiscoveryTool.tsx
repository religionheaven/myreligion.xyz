import React, { useState } from 'react';
import { Search, TrendingUp, Users, Globe, Star } from 'lucide-react';

export function DiscoveryTool() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'trending' | 'popular' | 'new'>('trending');

  // Mock data for discovery - this would come from your API in the future
  const discoveryItems = {
    trending: [
      { id: 1, name: 'Christianity Chat', users: 1247, category: 'Religion', rating: 4.8 },
      { id: 2, name: 'Islamic Studies', users: 892, category: 'Religion', rating: 4.9 },
      { id: 3, name: 'Buddhist Meditation', users: 634, category: 'Spirituality', rating: 4.7 },
      { id: 4, name: 'Jewish Traditions', users: 423, category: 'Religion', rating: 4.6 },
    ],
    popular: [
      { id: 5, name: 'Prayer Groups', users: 2156, category: 'Community', rating: 4.9 },
      { id: 6, name: 'Scripture Study', users: 1834, category: 'Education', rating: 4.8 },
      { id: 7, name: 'Faith Discussions', users: 1567, category: 'Discussion', rating: 4.7 },
      { id: 8, name: 'Spiritual Guidance', users: 1234, category: 'Support', rating: 4.8 },
    ],
    new: [
      { id: 9, name: 'Modern Faith', users: 156, category: 'Discussion', rating: 4.5 },
      { id: 10, name: 'Youth Ministry', users: 234, category: 'Community', rating: 4.6 },
      { id: 11, name: 'Interfaith Dialogue', users: 89, category: 'Discussion', rating: 4.4 },
      { id: 12, name: 'Digital Worship', users: 67, category: 'Innovation', rating: 4.3 },
    ],
  };

  const currentItems = discoveryItems[selectedCategory];

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
          Explore trending religious content and communities on heaven.xyz
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for religious content..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50 transition-all duration-300"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            selectedCategory === 'trending'
              ? 'bg-white/20 text-white border border-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">Trending</span>
        </button>
        <button
          onClick={() => setSelectedCategory('popular')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            selectedCategory === 'popular'
              ? 'bg-white/20 text-white border border-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">Popular</span>
        </button>
        <button
          onClick={() => setSelectedCategory('new')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            selectedCategory === 'new'
              ? 'bg-white/20 text-white border border-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">New</span>
        </button>
      </div>

      {/* Discovery Items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentItems
            .filter((item) =>
              searchQuery === '' ||
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <div
                key={item.id}
                className="bg-white/10 rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium text-lg mb-1">{item.name}</h4>
                    <span className="text-white/60 text-sm">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white/80 text-sm">{item.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{item.users.toLocaleString()} users</span>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200 opacity-0 group-hover:opacity-100">
                    Explore
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <Globe className="w-12 h-12 text-white/60 mx-auto mb-3" />
            <h4
              className="text-white font-medium text-lg mb-2"
              style={{ fontFamily: 'Poiret One, sans-serif' }}
            >
              More Coming Soon
            </h4>
            <p className="text-white/60 text-sm">
              We're building an extensive discovery platform to help you find the best religious
              content and communities. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}