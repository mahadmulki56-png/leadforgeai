import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, LayoutDashboard, Database, Kanban, 
  Download, ShieldCheck, Zap, X, ChevronRight, Globe 
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Launch New Lead Search', icon: Search, action: () => { onSelectView('search'); onClose(); } },
    { label: 'Open Lead Directory & Map', icon: Database, action: () => { onSelectView('results'); onClose(); } },
    { label: 'AI Outreach Studio & Proposals', icon: Sparkles, action: () => { onSelectView('outreach'); onClose(); } },
    { label: 'View CRM Sales Pipeline', icon: Kanban, action: () => { onSelectView('crm'); onClose(); } },
    { label: 'Export Leads & CRM Sync', icon: Download, action: () => { onSelectView('export'); onClose(); } },
    { label: 'System Admin & Telemetry', icon: ShieldCheck, action: () => { onSelectView('admin'); onClose(); } },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800/80">
          <Search className="h-5 w-5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action..."
            className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none placeholder:text-slate-500"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-400">No command matching "{query}"</p>
          ) : (
            filtered.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={act.action}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/10 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white">{act.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
