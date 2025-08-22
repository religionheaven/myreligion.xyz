import React, { useState, useEffect } from "react";
import { MessageCircle, User, Clock, Tag } from "lucide-react";
import { AdminAnalytics, UserRequest } from "../../services/adminAnalytics";

export function RequestsPanel() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "General" | "Add Religion">("all");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    const requestsData = await AdminAnalytics.getUserRequests();
    setRequests(requestsData);
    setLoading(false);
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;
    return request.request_type === filter;
  });

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "Add Religion":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "General":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg text-white font-medium"
          style={{ fontFamily: "Poiret One, sans-serif" }}
        >
          User Requests ({filteredRequests.length})
        </h3>

        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
          >
            <option value="all">All Requests</option>
            <option value="General">General</option>
            <option value="Add Religion">Add Religion</option>
          </select>

          <button
            onClick={loadRequests}
            className="text-white/60 hover:text-white text-sm transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-white">{requests.length}</div>
              <div className="text-white/60 text-xs">Total Requests</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {requests.filter((r) => r.request_type === "Add Religion").length}
              </div>
              <div className="text-white/60 text-xs">Add Religion</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-lg font-bold text-white">
                {
                  requests.filter((r) => Date.now() - new Date(r.created_at).getTime() < 86400000)
                    .length
                }
              </div>
              <div className="text-white/60 text-xs">Last 24h</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">Loading requests...</div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
          <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-white/60" />
                  <div>
                    <span className="text-white font-medium">{request.username}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs border ${getRequestTypeColor(request.request_type)}`}
                      >
                        {request.request_type}
                      </span>
                      <span className="text-white/60 text-xs">
                        {formatTimeAgo(request.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-white/80 text-sm leading-relaxed">{request.request_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
