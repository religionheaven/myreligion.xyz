import React, { useState, useEffect } from 'react';
import { Shield, Ban, UserX, Globe, Clock, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { BanManagement, BannedUser, BannedIP, BanLog } from '../../services/banManagement';
import { AdminAnalytics, LiveUser } from '../../services/adminAnalytics';

export function BanManagementPanel() {
  const [activeTab, setActiveTab] = useState<'users' | 'ips' | 'logs'>('users');
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [banLogs, setBanLogs] = useState<BanLog[]>([]);
  const [liveUsers, setLiveUsers] = useState<LiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState<{
    type: 'user' | 'ip';
    id: string;
    name: string;
  } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, ips, logs, live] = await Promise.all([
        BanManagement.getBannedUsers(),
        BanManagement.getBannedIPs(),
        BanManagement.getBanLogs(),
        AdminAnalytics.getLiveUsers(),
      ]);

      setBannedUsers(users);
      setBannedIPs(ips);
      setBanLogs(logs);
      setLiveUsers(live);
    } catch (error) {
      console.error('Error loading ban data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = (userId: string, username: string) => {
    setBanTarget({ type: 'user', id: username, name: username }); // Use username as ID for display
    setShowBanModal(true);
  };

  const handleBanIP = (ip: string) => {
    setBanTarget({ type: 'ip', id: ip, name: ip });
    setShowBanModal(true);
  };

  const executeBan = async () => {
    if (!banTarget || !banReason.trim()) return;

    try {
      let success = false;

      if (banTarget.type === 'user') {
        success = await BanManagement.banUser(
          banTarget.id,
          banReason,
          isPermanent,
          isPermanent ? undefined : expiresAt,
          true, // isUsername = true
        );

        if (success) {
          await BanManagement.logBanAction(
            'ban_user',
            banTarget.id,
            undefined,
            banReason,
            {},
            true,
          );
        }
      } else {
        success = await BanManagement.banIP(
          banTarget.id,
          banReason,
          isPermanent,
          isPermanent ? undefined : expiresAt,
        );

        if (success) {
          await BanManagement.logBanAction('ban_ip', undefined, banTarget.id, banReason);
        }
      }

      if (success) {
        setShowBanModal(false);
        setBanTarget(null);
        setBanReason('');
        setIsPermanent(true);
        setExpiresAt('');
        loadData();
      }
    } catch (error) {
      console.error('Error executing ban:', error);
    }
  };

  const handleUnban = async (type: 'user' | 'ip', id: string, name: string) => {
    if (!confirm(`Are you sure you want to unban ${name}?`)) return;

    try {
      let success = false;

      if (type === 'user') {
        // For unbanning, we need to use the user ID, not username
        // So we'll keep using the user ID from the banned users list
        success = await BanManagement.unbanUser(id, false); // isUsername = false
        if (success) {
          await BanManagement.logBanAction(
            'unban_user',
            id,
            undefined,
            'Unbanned by admin',
            {},
            false,
          );
        }
      } else {
        success = await BanManagement.unbanIP(id);
        if (success) {
          await BanManagement.logBanAction('unban_ip', undefined, id, 'Unbanned by admin');
        }
      }

      if (success) {
        loadData();
      }
    } catch (error) {
      console.error('Error unbanning:', error);
    }
  };

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

  const formatExpiry = (expiresAt?: string) => {
    if (!expiresAt) return 'Permanent';
    const date = new Date(expiresAt);
    const now = new Date();

    if (date < now) return 'Expired';

    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg text-white font-medium"
          style={{ fontFamily: 'Poiret One, sans-serif' }}
        >
          Ban Management
        </h3>
        <button
          onClick={loadData}
          className="text-white/60 hover:text-white text-sm transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            activeTab === 'users'
              ? 'bg-white/20 text-white border border-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span className="text-sm">Banned Users ({bannedUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ips')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            activeTab === 'ips'
              ? 'bg-white/20 text-white border border-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm">Banned IPs ({bannedIPs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
            activeTab === 'logs'
              ? 'bg-white/20 text-white border border-white/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm">Ban Logs</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-white/60">Loading ban data...</div>
        </div>
      ) : (
        <>
          {/* Live Users - Quick Ban Section */}
          {activeTab === 'users' && (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20 mb-6">
              <h4 className="text-white font-medium mb-3">Live Users - Quick Ban</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveUsers.slice(0, 6).map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">{user.username}</div>
                      <div className="text-white/60 text-xs">
                        {user.location_data.country} • {user.session_duration}m
                      </div>
                    </div>
                    <button
                      onClick={() => handleBanUser(user.id, user.username)}
                      className="bg-red-500/80 hover:bg-red-600/90 text-white p-1.5 rounded-lg transition-all duration-200"
                    >
                      <Ban className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banned Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0">
                    <tr className="text-left text-white/80 text-sm">
                      <th className="p-3">User</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Banned By</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Banned</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedUsers.map((ban) => (
                      <tr key={ban.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-3">
                          <div>
                            <div className="text-white font-medium">{ban.username}</div>
                            <div className="text-white/60 text-xs">{ban.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-white/80 text-sm">{ban.reason}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-white/60 text-sm">{ban.banned_by_username}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-white/60" />
                            <span className="text-white/60 text-sm">
                              {formatExpiry(ban.expires_at)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-white/60 text-sm">
                            {formatTimeAgo(ban.banned_at)}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleUnban('user', ban.user_id, ban.username)}
                            className="bg-green-500/80 hover:bg-green-600/90 text-white px-3 py-1 rounded-lg text-xs transition-all duration-200"
                          >
                            Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Banned IPs Tab */}
          {activeTab === 'ips' && (
            <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0">
                    <tr className="text-left text-white/80 text-sm">
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Associated User</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Banned</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bannedIPs.map((ban) => (
                      <tr key={ban.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-3">
                          <span className="text-white font-mono text-sm">{ban.ip_address}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-white/80 text-sm">
                            {ban.associated_username || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-white/80 text-sm">{ban.reason}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-white/60" />
                            <span className="text-white/60 text-sm">
                              {formatExpiry(ban.expires_at)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-white/60 text-sm">
                            {formatTimeAgo(ban.banned_at)}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleUnban('ip', ban.ip_address, ban.ip_address)}
                            className="bg-green-500/80 hover:bg-green-600/90 text-white px-3 py-1 rounded-lg text-xs transition-all duration-200"
                          >
                            Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ban Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0">
                    <tr className="text-left text-white/80 text-sm">
                      <th className="p-3">Action</th>
                      <th className="p-3">Target</th>
                      <th className="p-3">Admin</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banLogs.map((log) => (
                      <tr key={log.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              log.action.includes('ban') && !log.action.includes('unban')
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-green-500/20 text-green-300'
                            }`}
                          >
                            {log.action.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-white/80 text-sm">
                            {log.target_username || log.target_ip || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-white/60 text-sm">{log.admin_username}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-white/80 text-sm">{log.reason}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-white/60 text-sm">
                            {formatTimeAgo(log.created_at)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Ban Modal */}
      {showBanModal && banTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/30 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg text-white font-medium">
                Ban {banTarget.type === 'user' ? 'User' : 'IP Address'}
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-white/80 text-sm mb-2">
                Target: <strong>{banTarget.name}</strong>
              </p>
              {banTarget.type === 'user' && (
                <p className="text-white/60 text-xs">
                  Note: Banning a user will also automatically ban all IP addresses associated with
                  their account.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Reason</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter ban reason..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={isPermanent}
                    onChange={(e) => setIsPermanent(e.target.checked)}
                    className="rounded"
                  />
                  Permanent ban
                </label>
              </div>

              {!isPermanent && (
                <div>
                  <label className="block text-white/80 text-sm mb-2">Expires at</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 py-3 text-white/60 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={executeBan}
                disabled={!banReason.trim()}
                className="flex-1 bg-red-500/80 hover:bg-red-600/90 text-white py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ban {banTarget.type === 'user' ? 'User' : 'IP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
