import React from 'react';
import { 
  Building2, Search, Flame, Zap, Sparkles, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Globe, ShieldAlert, Award, 
  CheckCircle, Clock, ChevronRight, BarChart3, Filter, AlertTriangle
} from 'lucide-react';
import { BusinessLead, UserProfile } from '../types';

interface DashboardViewProps {
  leads: BusinessLead[];
  user: UserProfile;
  onSelectLead: (lead: BusinessLead) => void;
  onSelectView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  user,
  onSelectLead,
  onSelectView
}) => {
  const primeLeads = leads.filter(l => l.opportunityLevel === 'prime' || l.opportunityScore >= 85);
  const noWebsiteLeads = leads.filter(l => !l.websiteAudit.hasWebsite);
  const noSslLeads = leads.filter(l => l.websiteAudit.hasWebsite && !l.websiteAudit.sslValid);

  const stats = [
    {
      title: 'Total Leads Discovered',
      value: '1,428',
      change: '+18.4%',
      isPositive: true,
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      subtitle: 'Across 14 vertical categories'
    },
    {
      title: 'Prime Opportunities (85+)',
      value: primeLeads.length.toString(),
      change: '+12 this week',
      isPositive: true,
      icon: Flame,
      color: 'from-amber-500 to-rose-600',
      subtitle: 'High-conversion service targets'
    },
    {
      title: 'No Website Goldmines',
      value: noWebsiteLeads.length.toString(),
      change: '100% Win Rate Target',
      isPositive: true,
      icon: Globe,
      color: 'from-purple-500 to-indigo-600',
      subtitle: 'Operating strictly on GMB/FB'
    },
    {
      title: 'Security Risks (No SSL)',
      value: noSslLeads.length.toString(),
      change: 'Urgent Pitch Ready',
      isPositive: true,
      icon: ShieldAlert,
      color: 'from-rose-500 to-pink-600',
      subtitle: 'Chrome displays "Not Secure"'
    }
  ];

  const recentActivity = [
    { type: 'discovery', title: 'New Prime Lead Found', lead: 'Vanguard Plumbing & HVAC', detail: 'No Website (184 reviews, 4.9 stars)', time: '12m ago', icon: Flame },
    { type: 'ai', title: 'AI Cold Email Generated', lead: 'Apex Dental Care', detail: 'Non-SSL audit pitch ready', time: '45m ago', icon: Sparkles },
    { type: 'crm', title: 'Proposal Accepted ($5,500)', lead: 'Elysian Wellness Spa', detail: 'Moved to Closed Won stage', time: '2h ago', icon: CheckCircle }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
              <span>Agency Lead Engine Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{user.name}</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Discover local businesses in need of digital services. Your AI scanner has detected <strong className="text-amber-400 font-bold">{primeLeads.length} Prime Opportunity Leads</strong> waiting for outreach.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectView('search')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" />
              <span>Launch Lead Discovery</span>
            </button>
            <button
              onClick={() => onSelectView('outreach')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 font-bold text-sm backdrop-blur-md transition-all"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>AI Outreach Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className="glass-card glass-card-hover group relative overflow-hidden rounded-3xl p-5 shadow-2xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${stat.color} text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`glass-pill inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                  stat.isPositive ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                <p className="text-xs font-semibold text-slate-300">{stat.title}</p>
                <p className="text-[11px] text-slate-400">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frosted Glass Analytics & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Audit Deficit & Opportunity Matrix */}
        <div className="glass-card rounded-3xl p-6 space-y-5 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Audit Deficit Breakdown</h3>
                <p className="text-[11px] text-slate-400">Highest Converting Pitch Angles across Scanned Leads</p>
              </div>
            </div>
            <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] font-bold text-indigo-300">
              Live Telemetry
            </span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Missing Website (100% Win Target)', count: noWebsiteLeads.length, pct: 88, color: 'from-purple-500/80 to-indigo-500/80', badge: 'High ROI' },
              { label: 'Insecure HTTP (No SSL Certificate)', count: noSslLeads.length, pct: 64, color: 'from-rose-500/80 to-pink-500/80', badge: 'Security Risk' },
              { label: 'Slow Mobile PageSpeed (< 45/100)', count: Math.round(leads.length * 0.45), pct: 45, color: 'from-amber-500/80 to-orange-500/80', badge: 'Speed' },
              { label: 'Low Google Review Score (< 4.2 ★)', count: Math.round(leads.length * 0.32), pct: 32, color: 'from-emerald-500/80 to-teal-500/80', badge: 'Reputation' }
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    {item.label}
                    <span className="glass-pill px-2 py-0.5 rounded-md text-[9px] font-extrabold text-slate-300">
                      {item.badge}
                    </span>
                  </span>
                  <span className="font-extrabold text-white">{item.count} leads ({item.pct}%)</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-950/60 p-0.5 border border-white/10 backdrop-blur-md overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 shadow-lg`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Revenue Potential & Industry Yield */}
        <div className="glass-card rounded-3xl p-6 space-y-5 shadow-2xl border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Estimated Deal Value by Vertical</h3>
                <p className="text-[11px] text-slate-400">Average Agency Revenue per Closed Client</p>
              </div>
            </div>
            <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300">
              Avg $4,850 / Lead
            </span>
          </div>

          <div className="space-y-4">
            {[
              { vertical: 'Medical & Dental Practices', value: '$8,500', pct: 92, color: 'from-emerald-400/80 to-cyan-500/80' },
              { vertical: 'Legal & Financial Services', value: '$7,200', pct: 78, color: 'from-blue-400/80 to-indigo-500/80' },
              { vertical: 'Home Services (HVAC & Plumbing)', value: '$5,400', pct: 65, color: 'from-indigo-400/80 to-purple-500/80' },
              { vertical: 'Wellness, Spa & Fitness', value: '$3,800', pct: 42, color: 'from-purple-400/80 to-pink-500/80' }
            ].map((v, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{v.vertical}</span>
                  <span className="font-black text-emerald-400">{v.value} est. deal</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-950/60 p-0.5 border border-white/10 backdrop-blur-md overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${v.color} transition-all duration-700 shadow-lg`}
                    style={{ width: `${v.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Hot Leads & Discovery Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Prime Lead Opportunities (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-white">Top AI Recommended Prospects</h2>
            </div>
            <button
              onClick={() => onSelectView('results')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All Directory ({leads.length}) <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {primeLeads.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 text-center space-y-4">
                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-12 h-12 mx-auto flex items-center justify-center">
                  <Search className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">No Lead Data In Workspace Yet</h3>
                  <p className="text-xs text-slate-400">Launch a live business discovery search to populate your directory with real local leads.</p>
                </div>
                <button
                  onClick={() => onSelectView('search')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all inline-flex items-center gap-2"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Start Discovery Search</span>
                </button>
              </div>
            ) : (
              primeLeads.slice(0, 4).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="group p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 hover:bg-slate-800/60 hover:border-indigo-500/80 shadow-xl transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-white group-hover:text-indigo-400 transition-colors">
                          {lead.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Score: {lead.opportunityScore}/100
                        </span>
                        {!lead.websiteAudit.hasWebsite && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            NO WEBSITE
                          </span>
                        )}
                        {lead.websiteAudit.hasWebsite && !lead.websiteAudit.sslValid && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            NO SSL
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{lead.industry}</span>
                        <span>•</span>
                        <span>{lead.city}, {lead.state}</span>
                        <span>•</span>
                        <span className="font-semibold text-amber-400">★ {lead.googleRating} ({lead.reviewCount} reviews)</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {lead.aiOpportunityHighlights.slice(0, 2).map((h, i) => (
                          <span key={i} className="text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
                            💡 {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
                      <span className="text-xs font-bold text-white">
                        Est. Value: <span className="text-emerald-400">${lead.dealValue}</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white text-indigo-300 text-xs font-bold transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Audit & Pitch</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Discovery Activity & Quick Preset Search */}
        <div className="space-y-6">
          {/* Recent System Activity Feed */}
          <div className="rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Live System Log</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Realtime</span>
            </div>

            <div className="space-y-3">
              {recentActivity.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 border border-indigo-500/20">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{act.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-400">{act.lead}</p>
                      <p className="text-[11px] text-slate-400 truncate">{act.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Lead Presets Launch */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-300" />
              <h3 className="font-bold text-sm">Quick Lead Filters</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Launch instant pre-filtered searches for specific high-converting agency services:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onSelectView('search')}
                className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold flex items-center justify-between"
              >
                <span>🔥 Businesses with NO Website</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onSelectView('search')}
                className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold flex items-center justify-between"
              >
                <span>🔒 Insecure HTTP Sites (No SSL)</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onSelectView('search')}
                className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold flex items-center justify-between"
              >
                <span>📱 Mobile Unfriendly PageSpeed</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
