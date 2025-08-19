import React, { useState, useEffect } from 'react';
import { MessageSquare, MapPin, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { AdminAnalytics, MessageAnalytics } from '../../services/adminAnalytics';

export function MessageMonitorPanel() {
  const [messages, setMessages] = useState<MessageAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sensitive' | 'recent'>('all');

  useEffect(() => {
    loadMessages();

    // Refresh every 30 seconds
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const messagesData = await AdminAnalytics.getMessageAnalytics(150);
    setMessages(messagesData);
    setLoading(false);
  };

  const filteredMessages = messages.filter((message) => {
    if (filter === 'sensitive') return message.contains_sensitive;
    if (filter === 'recent') return Date.now() - new Date(message.created_at).getTime() < 3600000; // Last hour
    return true;
  });

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.3) return 'Positive';
    if (score < -0.3) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg text-white font-medium"
          style={{ fontFamily: 'Poiret One, sans-serif' }}
        >
          Message Monitor ({filteredMessages.length})
        </h3>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
          >
            <option value="all">All Messages</option>
            <option value="recent">Recent (1h)</option>
            <option value="sensitive">Sensitive</option>
          </select>

          <button
            onClick={loadMessages}
            className="text-white/60 hover:text-white text-sm transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-white">{messages.length}</div>
              <div className="text-white/60 text-xs">Total Messages</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {
                  messages.filter((m) => Date.now() - new Date(m.created_at).getTime() < 3600000)
                    .length
                }
              </div>
              <div className="text-white/60 text-xs">Last Hour</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {messages.filter((m) => m.contains_sensitive).length}
              </div>
              <div className="text-white/60 text-xs">Sensitive</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {Math.round(
                  messages.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) /
                    messages.length /
                    1000,
                ) || 0}
                s
              </div>
              <div className="text-white/60 text-xs">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">Loading messages...</div>
        </div>
      ) : (
        <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-white/5 sticky top-0">
                <tr className="text-left text-white/80 text-sm">
                  <th className="p-3">User</th>
                  <th className="p-3">Religion</th>
                  <th className="p-3">Length</th>
                  <th className="p-3">Sentiment</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Flags</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr key={message.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-3">
                      <span className="text-white text-sm">{message.username}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-white/80 text-sm capitalize">{message.religion}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-white/60 text-sm">{message.message_length} chars</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-sm ${getSentimentColor(message.sentiment_score)}`}>
                        {getSentimentLabel(message.sentiment_score)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {message.location_data.city && `${message.location_data.city}, `}
                          {message.location_data.country || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-white/60 text-sm">
                        {formatTimeAgo(message.created_at)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {message.contains_sensitive && (
                          <AlertTriangle
                            className="w-4 h-4 text-red-400"
                            title="Sensitive content"
                          />
                        )}
                        {message.response_time_ms && message.response_time_ms > 10000 && (
                          <Clock className="w-4 h-4 text-yellow-400" title="Slow response" />
                        )}
                      </div>
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
