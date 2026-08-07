import React from 'react';
import { 
  LayoutDashboard, Search, Database, FileText, Sparkles, 
  Kanban, Zap, Download, ShieldCheck, MapPin, CheckSquare, 
  BarChart2, Radio, Sliders, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  savedLeadsCount: number;
  crmCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  savedLeadsCount,
  crmCount
}) => {
  const menuGroups = [
    {
      title: 'DISCOVERY ENGINE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'search', label: 'Lead Discovery Search', icon: Search, badge: 'AI Powered' },
        { id: 'results', label: 'Lead Directory & Map', icon: Database, count: savedLeadsCount },
      ]
    },
    {
      title: 'INTELLIGENCE & AI',
      items: [
        { id: 'analyzer', label: 'Website & Social Audit', icon: FileText },
        { id: 'outreach', label: 'AI Outreach & Proposals', icon: Sparkles, badge: 'Gemini 3.6' },
      ]
    },
    {
      title: 'CRM & AUTOMATION',
      items: [
        { id: 'crm', label: 'CRM Sales Pipeline', icon: Kanban, count: crmCount },
        { id: 'automation', label: 'Drip Sequences', icon: Zap },
      ]
    },
    {
      title: 'SYSTEM & INTEGRATIONS',
      items: [
        { id: 'export', label: 'Export & CRM Sync', icon: Download },
        { id: 'admin', label: 'Admin & Telemetry', icon: ShieldCheck },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-xl flex flex-col justify-between shrink-0 hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              {group.title}
            </h3>
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:shadow-indigo-900/40'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${
                        isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && (
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Banner */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-indigo-900/80 via-slate-900 to-purple-900/80 border border-indigo-500/30 text-white space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-ping" />
            <span>AI Scanner Active</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
            99.9% Compliance
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">
          Compliant enrichment engine active. Discovering verified local contacts daily.
        </p>
        <button 
          onClick={() => onSelectView('search')}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition-all"
        >
          <span>Launch AI Discovery</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};
