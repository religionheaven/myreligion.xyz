import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, Globe } from 'lucide-react';
import { AdminAnalytics, LiveUser } from '../../services/adminAnalytics';

import { Globe2 } from 'lucide-react';

export function LiveUsersPanel() {
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiveUsers();

    // Refresh every 30 seconds
    const interval = setInterval(loadLiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLiveUsers = async () => {
    setLoading(true);
    const users = await AdminAnalytics.getLiveUsers();
    setLiveUsers(users);
    setLoading(false);
  };

  const formatLastActivity = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg text-white font-medium"
          style={{ fontFamily: 'Poiret One, sans-serif' }}
        >
          Live Users ({liveUsers.length})
        </h3>
        <button
          onClick={loadLiveUsers}
          className="text-white/60 hover:text-white text-sm transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">Loading live users...</div>
        </div>
      ) : liveUsers.length === 0 ? (
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
          <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No users currently online</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveUsers.map((user) => (
            <div key={user.id} className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium text-sm">{user.username}</span>
                </div>
                <span className="text-white/60 text-xs">{user.session_duration}m</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastActivity(user.last_activity)}</span>
                </div>

                {/* Display IP Address */}
                {user.location_data.ip && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Globe2 className="w-3 h-3" />
                    <span className="font-mono text-xs">{user.location_data.ip}</span>
                  </div>
                )}

                {user.location_data.country && (
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {user.location_data.city && `${user.location_data.city}, `}
                      {user.location_data.country}
                    </span>
                  </div>
                )}

                {user.current_page && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{user.current_page}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
