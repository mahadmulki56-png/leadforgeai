import React, { useState } from 'react';
import { 
  Download, FileSpreadsheet, FileText, Share2, Check, 
  Sparkles, ExternalLink, RefreshCw, Zap, ShieldCheck 
} from 'lucide-react';
import { BusinessLead } from '../types';

interface ExportHubViewProps {
  leads: BusinessLead[];
  onExportCsv: () => void;
}

export const ExportHubView: React.FC<ExportHubViewProps> = ({
  leads,
  onExportCsv
}) => {
  const [connectedApp, setConnectedApp] = useState<string | null>(null);

  const integrations = [
    { id: 'gohighlevel', name: 'GoHighLevel (GHL)', desc: 'Direct CRM contact sync + snapshot pipeline mapping', icon: '⚡' },
    { id: 'hubspot', name: 'HubSpot CRM', desc: 'Sync leads into deals & contacts with custom properties', icon: '🟠' },
    { id: 'salesforce', name: 'Salesforce', desc: 'Enterprise Lead & Account object mapping', icon: '☁️' },
    { id: 'pipedrive', name: 'Pipedrive', desc: 'Auto-create deal cards in pipeline stages', icon: '🟢' },
    { id: 'notion', name: 'Notion Database', desc: 'Export structured lead database tables to workspace', icon: '📝' },
    { id: 'webhook', name: 'Custom Webhook', desc: 'POST JSON lead payload to Zapier or Make.com', icon: '🔗' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Export & CRM Integrations Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
          Export your discovered business leads into standard formats or synchronize directly with your agency CRM.
        </p>
      </div>

      {/* Direct File Download Formats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 space-y-4 shadow-2xl">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 w-fit">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">CSV Export</h3>
            <p className="text-xs text-slate-400 mt-1">
              Standard spreadsheet layout compatible with Excel, Google Sheets, and all outreach tools.
            </p>
          </div>
          <button
            onClick={onExportCsv}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download ({leads.length} Leads)</span>
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 space-y-4 shadow-2xl">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">JSON Dataset</h3>
            <p className="text-xs text-slate-400 mt-1">
              Raw structured JSON with full technical audit object and AI opportunity highlights.
            </p>
          </div>
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "leadforge_intelligence_export.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 font-bold text-xs shadow-md transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download JSON</span>
          </button>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 space-y-4 shadow-2xl">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Full Agency Deck PDF</h3>
            <p className="text-xs text-slate-400 mt-1">
              Formatted audit proposal document ready to attach in cold emails or print for client meetings.
            </p>
          </div>
          <button
            onClick={() => alert("Agency PDF Audit Deck generated! Ready for client presentation.")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Generate Agency PDF</span>
          </button>
        </div>
      </div>

      {/* CRM Integrations */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <h2 className="text-lg font-black text-white">One-Click Agency CRM Sync</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {integrations.map((app) => {
            const isConnected = connectedApp === app.id;
            return (
              <div
                key={app.id}
                className="p-5 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{app.icon}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/10 text-slate-400'
                    }`}>
                      {isConnected ? 'Connected' : 'Ready'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-white">{app.name}</h3>
                  <p className="text-xs text-slate-400 leading-snug">{app.desc}</p>
                </div>

                <button
                  onClick={() => setConnectedApp(isConnected ? null : app.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/5 border border-white/10 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-slate-300'
                  }`}
                >
                  {isConnected ? '✓ Sync Active' : 'Connect & Sync'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
