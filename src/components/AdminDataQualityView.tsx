import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Server, Activity, Clock, Filter, CheckCircle2, 
  XCircle, RefreshCw, Zap, Database, AlertTriangle, ChevronRight, 
  Layers, BarChart2, Radio, Globe, Search, MapPin, ExternalLink 
} from 'lucide-react';
import { UserProfile } from '../types';

interface AdminDataQualityViewProps {
  user: UserProfile;
}

export const AdminDataQualityView: React.FC<AdminDataQualityViewProps> = ({ user }) => {
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'providers' | 'errors' | 'maps'>('history');

  const fetchTelemetry = () => {
    setLoading(true);
    fetch('/api/admin/telemetry')
      .then(res => res.json())
      .then(data => {
        setTelemetryData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Telemetry fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetch('/api/admin/telemetry')
        .then(res => res.json())
        .then(data => setTelemetryData(data))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const stats = telemetryData?.telemetry || {};
  const totalSearches = stats.totalSearches || 0;
  const successfulSearches = stats.successfulSearches || (totalSearches - (stats.failedSearches || 0));
  const failedSearches = stats.failedSearches || 0;
  const searchSuccessRate = totalSearches > 0 ? Math.round((successfulSearches / totalSearches) * 100) : 100;

  const totalRawDiscovered = stats.totalRawDiscovered || (stats.totalLeadsDiscovered + stats.duplicatesFiltered) || 0;
  const duplicatesFiltered = stats.duplicatesFiltered || 0;
  const duplicateRemovalRate = totalRawDiscovered > 0 
    ? Math.min(100, Math.round((duplicatesFiltered / totalRawDiscovered) * 100)) 
    : 0;

  const avgLatency = stats.averageLatencyMs || stats.lastSearchTimeMs || 0;
  const lastLatency = stats.lastSearchTimeMs || 0;

  const getLatencyBadge = (ms: number) => {
    if (ms <= 0) return { label: 'Idle', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
    if (ms < 800) return { label: 'Ultra Fast', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (ms < 2000) return { label: 'Normal', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    return { label: 'High Latency', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  };

  const latencyBadge = getLatencyBadge(lastLatency);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span>Realtime Data Quality & API Telemetry Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            API Health & Quality Monitor
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
            Live monitoring of search provider response times, fuzzy duplicate removal efficiency, HTTP enrichment checks, and search pipeline success rates.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
              autoRefresh 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span>Auto-Refresh (5s)</span>
          </button>

          <button
            onClick={fetchTelemetry}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Provider Response Time */}
        <div className="p-5 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Provider Latency</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{lastLatency > 0 ? `${lastLatency}ms` : '0ms'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${latencyBadge.color}`}>
              {latencyBadge.label}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Avg Response Time:</span>
            <span className="font-bold text-slate-200">{avgLatency}ms</span>
          </div>
        </div>

        {/* Card 2: Duplicate Removal Rate */}
        <div className="p-5 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duplicate Removal Rate</span>
            <Filter className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{duplicateRemovalRate}%</span>
            <span className="text-xs font-bold text-rose-400">Filtered</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Duplicates Removed:</span>
            <span className="font-bold text-rose-400">{duplicatesFiltered} Records</span>
          </div>
        </div>

        {/* Card 3: Search Success Metric */}
        <div className="p-5 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{searchSuccessRate}%</span>
            <span className="text-xs font-bold text-emerald-400">Healthy</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Searches (Success / Total):</span>
            <span className="font-bold text-slate-200">{successfulSearches} / {totalSearches}</span>
          </div>
        </div>

        {/* Card 4: Discovered Leads Volume */}
        <div className="p-5 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clean Leads Delivered</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.totalLeadsDiscovered || 0}</span>
            <span className="text-xs font-bold text-amber-400">Cleaned</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Websites Verified:</span>
            <span className="font-bold text-slate-200">{stats.websitesVerifiedCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Visual Quality Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duplicate Removal Efficiency Visualizer */}
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Filter className="h-4 w-4 text-rose-400" />
                <span>Fuzzy Duplicate Removal Efficiency</span>
              </h3>
              <p className="text-xs text-slate-400">
                Visual ratio of raw provider entries vs filtered duplicates vs delivered clean business leads.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              {duplicateRemovalRate}% Duplicate Ratio
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>Raw Discovered: <strong className="text-white">{totalRawDiscovered}</strong></span>
              <span>Duplicates Stripped: <strong className="text-rose-400">{duplicatesFiltered}</strong></span>
              <span>Delivered: <strong className="text-emerald-400">{stats.totalLeadsDiscovered || 0}</strong></span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${100 - duplicateRemovalRate}%` }} 
                title="Delivered Clean Leads"
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${duplicateRemovalRate}%` }} 
                title="Duplicates Filtered"
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                High-Quality Clean Leads ({100 - duplicateRemovalRate}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Fuzzy Duplicates Purged ({duplicateRemovalRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* API Response Time & Pipeline Health Visualizer */}
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <span>Provider Latency & Success Pipeline</span>
              </h3>
              <p className="text-xs text-slate-400">
                Active Provider: <strong className="text-indigo-400">{telemetryData?.activeProvider || 'OpenStreetMap'}</strong>
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {searchSuccessRate}% Success Rate
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>Successful API Calls: <strong className="text-emerald-400">{successfulSearches}</strong></span>
              <span>Failed API Calls: <strong className="text-rose-400">{failedSearches}</strong></span>
              <span>Avg Speed: <strong className="text-indigo-400">{avgLatency}ms</strong></span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${searchSuccessRate}%` }} 
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${100 - searchSuccessRate}%` }} 
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Successful Searches ({searchSuccessRate}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Provider Errors ({100 - searchSuccessRate}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Search Pipeline History ({stats.searchHistory?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'providers'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Provider Performance Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'errors'
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Error & Exception Logs ({stats.errorLogs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'maps'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Google Maps Verification Clicks ({stats.googleMapsClicks || 0})</span>
          </button>
        </div>

        {/* Tab 1: Search Pipeline History */}
        {activeTab === 'history' && (
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-4 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-400" />
                <span>Live Search Execution Log</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Showing last {stats.searchHistory?.length || 0} executions
              </span>
            </div>

            {(!stats.searchHistory || stats.searchHistory.length === 0) ? (
              <div className="text-center py-12 space-y-3">
                <Search className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-xs font-medium">No discovery search executions logged in current session yet.</p>
                <p className="text-slate-500 text-[11px]">Run a search from the Business Discovery tab to populate realtime pipeline metrics.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-black">
                      <th className="pb-3 px-3">Search ID</th>
                      <th className="pb-3 px-3">Target Query</th>
                      <th className="pb-3 px-3">Raw Discovered</th>
                      <th className="pb-3 px-3">Duplicates Purged</th>
                      <th className="pb-3 px-3">Clean Leads Delivered</th>
                      <th className="pb-3 px-3">Provider</th>
                      <th className="pb-3 px-3">Latency</th>
                      <th className="pb-3 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.searchHistory.map((h: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors text-slate-200">
                        <td className="py-3 px-3 font-mono text-[11px] text-indigo-400 font-bold">{h.searchId}</td>
                        <td className="py-3 px-3 font-semibold text-white">{h.query}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{h.rawCount || h.resultsCount}</td>
                        <td className="py-3 px-3 text-rose-400 font-bold font-mono">-{h.duplicatesRemoved || 0}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {h.resultsCount} Leads
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium">{h.provider}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-indigo-300 font-bold">{h.latencyMs || stats.lastSearchTimeMs || 0}ms</td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                          {new Date(h.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Provider Performance Breakdown */}
        {activeTab === 'providers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 space-y-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">OpenStreetMap / Overpass API</h4>
                    <p className="text-xs text-slate-400">Official Open Data Engine (Default Provider)</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  Active Provider
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">API Key Requirement</span>
                  <p className="font-bold text-emerald-400">None (Open Access)</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Avg Latency</span>
                  <p className="font-bold text-white font-mono">{avgLatency ? `${avgLatency}ms` : 'Ready'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 space-y-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">Google Places API (New)</h4>
                    <p className="text-xs text-slate-400">Google Cloud Platform Places Engine</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  telemetryData?.hasGoogleKey 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {telemetryData?.hasGoogleKey ? 'Configured' : 'Optional (Fallback)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Status</span>
                  <p className="font-bold text-slate-200">
                    {telemetryData?.hasGoogleKey ? 'Ready for live calls' : 'Set GOOGLE_PLACES_API_KEY to activate'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Priority</span>
                  <p className="font-bold text-indigo-400">High when key present</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Error & Exception Logs */}
        {activeTab === 'errors' && (
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-4 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <span>Runtime Error & Exception Log</span>
              </h3>
              <span className="text-xs text-slate-400">
                {stats.errorLogs?.length || 0} Total Logged Errors
              </span>
            </div>

            {(!stats.errorLogs || stats.errorLogs.length === 0) ? (
              <div className="text-center py-12 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-emerald-400 text-xs font-bold">Zero exceptions logged in current runtime session.</p>
                <p className="text-slate-400 text-[11px]">All search requests and provider connections are functioning smoothly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.errorLogs.map((err: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px] text-rose-400">
                      <span>Search ID: {err.searchId || 'N/A'}</span>
                      <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white font-medium">{err.error}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Google Maps Verification Analytics */}
        {activeTab === 'maps' && (
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-6 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <span>Google Maps Lead Verification Telemetry</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tracks user verification events when business leads are inspected on official Google Maps business listings.
                </p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black shrink-0">
                Total Verification Clicks: {stats.googleMapsClicks || 0}
              </div>
            </div>

            {(!stats.googleMapsClickLogs || stats.googleMapsClickLogs.length === 0) ? (
              <div className="text-center py-12 space-y-2">
                <MapPin className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-xs font-bold">No Google Maps verification clicks recorded yet in this session.</p>
                <p className="text-slate-500 text-[11px]">When users click "View on Google Maps" on cards or lead details, real-time events populate here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-black">
                      <th className="pb-3 px-3">Lead ID</th>
                      <th className="pb-3 px-3">Business Name</th>
                      <th className="pb-3 px-3">Google Maps Listing Link</th>
                      <th className="pb-3 px-3">Timestamp</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {stats.googleMapsClickLogs.map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 text-indigo-400 font-bold">{log.leadId}</td>
                        <td className="py-3 px-3 text-white font-sans font-bold">{log.leadName || 'Business Lead'}</td>
                        <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                          <a href={log.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400">
                            {log.url}
                          </a>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-3 px-3 text-right font-sans">
                          <a
                            href={log.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold"
                          >
                            <span>Verify Link</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
