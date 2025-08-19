import React, { useState, useEffect } from 'react';
import { Eye, MapPin, ExternalLink, User, Clock } from 'lucide-react';
import { AdminAnalytics, SiteVisit } from '../../services/adminAnalytics';

export function SiteVisitsPanel() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'authenticated' | 'anonymous'>('all');

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    setLoading(true);
    const visitsData = await AdminAnalytics.getSiteVisits(200);
    setVisits(visitsData);
    setLoading(false);
  };

  const filteredVisits = visits.filter((visit) => {
    if (filter === 'authenticated') return visit.user_id;
    if (filter === 'anonymous') return !visit.user_id;
    return true;
  });

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg text-white font-medium"
          style={{ fontFamily: 'Poiret One, sans-serif' }}
        >
          Site Visits ({filteredVisits.length})
        </h3>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
          >
            <option value="all">All Visits</option>
            <option value="authenticated">Authenticated</option>
            <option value="anonymous">Anonymous</option>
          </select>

          <button
            onClick={loadVisits}
            className="text-white/60 hover:text-white text-sm transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">Loading site visits...</div>
        </div>
      ) : (
        <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-white/5 sticky top-0">
                <tr className="text-left text-white/80 text-sm">
                  <th className="p-3">Visitor</th>
                  <th className="p-3">Page</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit) => (
                  <tr key={visit.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {visit.user_id ? (
                          <>
                            <User className="w-4 h-4 text-green-400" />
                            <span className="text-white text-sm">{visit.username}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-white/60" />
                            <span className="text-white/60 text-sm">Anonymous</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 text-sm">{visit.page_path}</span>
                        {visit.referrer && <ExternalLink className="w-3 h-3 text-white/40" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {visit.location_data.city && `${visit.location_data.city}, `}
                          {visit.location_data.country || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(visit.session_duration)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-white/60 text-sm">
                        {formatTimeAgo(visit.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
