import React, { useState } from 'react';
import { 
  Kanban, Plus, Flame, DollarSign, CheckCircle2, Clock, 
  ChevronRight, Phone, Mail, Sparkles, Filter, AlertCircle, Navigation 
} from 'lucide-react';
import { BusinessLead, CrmStage } from '../types';
import { handleGoogleMapsClick } from '../lib/utils/googleMaps';

interface CrmPipelineViewProps {
  leads: BusinessLead[];
  onSelectLead: (lead: BusinessLead) => void;
  onUpdateStage: (leadId: string, newStage: CrmStage) => void;
}

export const CrmPipelineView: React.FC<CrmPipelineViewProps> = ({
  leads,
  onSelectLead,
  onUpdateStage
}) => {
  const stages: { id: CrmStage; title: string; color: string }[] = [
    { id: 'new', title: 'New Leads', color: 'border-blue-500 text-blue-500' },
    { id: 'contacted', title: 'Contacted', color: 'border-purple-500 text-purple-500' },
    { id: 'interested', title: 'Interested', color: 'border-amber-500 text-amber-500' },
    { id: 'proposal', title: 'Proposal Sent', color: 'border-indigo-500 text-indigo-500' },
    { id: 'won', title: 'Closed Won 🎉', color: 'border-emerald-500 text-emerald-500' },
    { id: 'lost', title: 'Closed Lost', color: 'border-slate-400 text-slate-400' }
  ];

  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const wonPipelineValue = leads.filter(l => l.crmStatus === 'won').reduce((sum, l) => sum + l.dealValue, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Agency CRM Sales Pipeline
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track lead outreach status, proposals sent, and deal closures.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/60 border border-slate-800 text-white text-xs font-bold backdrop-blur-md shadow-lg">
            Total Pipeline: <span className="text-emerald-400 font-extrabold">${totalPipelineValue.toLocaleString()}</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            Closed Won: <span className="font-black">${wonPipelineValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-6">
        {stages.map((stage) => {
          const stageLeads = leads.filter(l => l.crmStatus === stage.id);
          const stageValue = stageLeads.reduce((s, l) => s + l.dealValue, 0);

          return (
            <div
              key={stage.id}
              className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className={`p-3 rounded-2xl bg-slate-950/60 border-l-4 ${stage.color} border-y border-r border-slate-800/80 backdrop-blur-md shadow-md space-y-1 mb-3`}>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white">{stage.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-slate-200">
                    {stageLeads.length}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">${stageValue.toLocaleString()}</p>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-[11px] font-semibold border border-dashed border-slate-800/80 rounded-2xl">
                    No leads in stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-slate-800/60 hover:border-indigo-500/80 shadow-lg transition-all cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs text-white group-hover:text-indigo-400 line-clamp-1">
                          {lead.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-400 shrink-0">
                          {lead.opportunityScore} Score
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] text-slate-400">
                          {lead.industry} • {lead.city}
                        </p>
                        {lead.googleMapsVerified && lead.googleMapsUrl && (
                          <button
                            onClick={(e) => handleGoogleMapsClick(e, lead.googleMapsUrl, lead.id, lead.name)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 shrink-0"
                            title="View on Google Maps"
                          >
                            <Navigation className="h-3 w-3" />
                            <span>Maps</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                        <span className="font-black text-emerald-400">${lead.dealValue}</span>

                        {/* Stage Selector Dropdown */}
                        <select
                          value={lead.crmStatus}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateStage(lead.id, e.target.value as CrmStage)}
                          className="px-2 py-1 rounded-lg bg-slate-950/80 text-[10px] font-bold text-slate-300 border border-slate-700/80 focus:outline-none"
                        >
                          {stages.map(s => (
                            <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
