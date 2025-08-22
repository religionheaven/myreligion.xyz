import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  BarChart3,
  Settings,
  Shield,
  Database,
  MessageSquare,
  Eye,
  Activity,
  MessageCircle,
  Ban,
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminAnalytics, AdminStats } from '../../services/adminAnalytics';
import { LiveUsersPanel } from './LiveUsersPanel';
import { SiteVisitsPanel } from './SiteVisitsPanel';
import { MessageMonitorPanel } from './MessageMonitorPanel';
import { RequestsPanel } from './RequestsPanel';
import { BanManagementPanel } from './BanManagementPanel';

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const { adminUser, hasPermission } = useAdmin();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'live-users' | 'site-visits' | 'messages' | 'requests' | 'bans' | 'settings'
  >('overview');
  const [systemStats, setSystemStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    if (!hasPermission('view_analytics')) return;

    setLoading(true);
    const stats = await AdminAnalytics.getAdminStats();
    setSystemStats(stats);
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, permission: 'view_analytics' },
    { id: 'live-users', label: 'Live Users', icon: Users, permission: 'view_analytics' },
    { id: 'site-visits', label: 'Site Visits', icon: Eye, permission: 'view_analytics' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, permission: 'view_analytics' },
    { id: 'requests', label: 'Requests', icon: MessageCircle, permission: 'view_analytics' },
    { id: 'bans', label: 'Ban Management', icon: Ban, permission: 'moderate_content' },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'system_settings' },
  ] as const;

  const availableTabs = tabs.filter((tab) => hasPermission(tab.permission));

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            'url(https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGNkanZobTJ2Y3FhNmJxdXdzaGw5NGl0aTh6bmVydHJ4aDB3MzRpOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/FESFit0BwFBkk9rkLb/giphy.gif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Mobile background */}
      <div
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: 'url(https://i.imgur.com/llHxOih.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Header */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="absolute top-8 left-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="flex justify-center">
          <div className="text-center">
            <Shield className="w-12 h-12 text-white mx-auto mb-2" />
            <h1 className="text-2xl text-white" style={{ fontFamily: 'Poiret One, sans-serif' }}>
              Admin Panel
            </h1>
            <p className="text-white/60 text-sm">
              Welcome, {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-white/20 p-6">
              <div className="flex gap-4">
                {availableTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <OverviewTab systemStats={systemStats} loading={loading} />
              )}
              {activeTab === 'live-users' && <LiveUsersPanel />}
              {activeTab === 'site-visits' && <SiteVisitsPanel />}
              {activeTab === 'messages' && <MessageMonitorPanel />}
              {activeTab === 'requests' && <RequestsPanel />}
              {activeTab === 'bans' && <BanManagementPanel />}
              {activeTab === 'settings' && <SettingsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  systemStats,
  loading,
}: {
  systemStats: AdminStats | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading system overview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl text-white mb-4" style={{ fontFamily: 'Poiret One, sans-serif' }}>
        System Overview
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{systemStats?.totalUsers || 0}</div>
              <div className="text-white/60 text-sm">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">{systemStats?.totalVisits || 0}</div>
              <div className="text-white/60 text-sm">Site Visits</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{systemStats?.totalMessages || 0}</div>
              <div className="text-white/60 text-sm">Total Messages</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-white">{systemStats?.activeUsers || 0}</div>
              <div className="text-white/60 text-sm">Total Accounts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Countries and Religions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg text-white mb-4" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            Top Countries
          </h3>
          <div className="space-y-3">
            {systemStats?.topCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">#{index + 1}</span>
                  <span className="text-white">{country.country}</span>
                </div>
                <span className="text-white/80">{country.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg text-white mb-4" style={{ fontFamily: 'Poiret One, sans-serif' }}>
            Popular Religions
          </h3>
          <div className="space-y-3">
            {systemStats?.topReligions.map((religion, index) => (
              <div key={religion.religion} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">#{index + 1}</span>
                  <span className="text-white capitalize">{religion.religion}</span>
                </div>
                <span className="text-white/80">{religion.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg text-white mb-4" style={{ fontFamily: 'Poiret One, sans-serif' }}>
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{systemStats?.activeUsers || 0}</div>
            <div className="text-white/60 text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{systemStats?.totalRequests || 0}</div>
            <div className="text-white/60 text-sm">User Requests</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {Math.round(
            {systemStats?.recentActivity || 0}
              ) / 10}
            </div>
            <div className="text-white/60 text-sm">Msgs/User</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {Math.round(((systemStats?.totalVisits || 0) / (systemStats?.totalUsers || 1)) * 10) /
                10}
            </div>
            <div className="text-white/60 text-sm">Visits/User</div>
          <div className="text-white/60 text-sm">Recent Activity</div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl text-white mb-4" style={{ fontFamily: 'Poiret One, sans-serif' }}>
        System Settings
      </h2>
      <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
        <p className="text-white/60">System settings coming soon...</p>
      </div>
    </div>
  );
}
