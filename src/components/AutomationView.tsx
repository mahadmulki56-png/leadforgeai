import React, { useState } from 'react';
import { 
  Zap, Mail, MessageSquare, Phone, Plus, Play, Pause, 
  BarChart2, Clock, ChevronRight, CheckCircle2, Sparkles 
} from 'lucide-react';
import { AutomationSequence } from '../types';

interface AutomationViewProps {
  sequences: AutomationSequence[];
  onToggleSequence: (id: string) => void;
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  sequences,
  onToggleSequence
}) => {
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Automated Outreach Drip Sequences
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Configure automated follow-up sequences across Email, WhatsApp, and Social DMs.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Sequence Campaign</span>
        </button>
      </div>

      {/* Campaign Cards List */}
      <div className="space-y-4">
        {sequences.map((seq) => (
          <div
            key={seq.id}
            className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 shadow-2xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-white">{seq.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    seq.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {seq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Trigger: <strong className="text-slate-200">{seq.triggerEvent}</strong> • Channel: <strong className="text-indigo-400 uppercase">{seq.channel}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <p className="font-extrabold text-white">{seq.leadsEnrolled} Leads Enrolled</p>
                  <p className="text-[11px] text-emerald-400 font-bold">{seq.responseRate}% Response Rate</p>
                </div>

                <button
                  onClick={() => onToggleSequence(seq.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    seq.status === 'active'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                      : 'bg-emerald-600 text-white shadow-md'
                  }`}
                >
                  {seq.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sequence Steps Timeline Preview */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sequence Timeline Steps ({seq.steps.length})</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {seq.steps.map((step, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400">Day {step.delayDays} • Step {sIdx + 1}</span>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-sans">
                      {step.subject || step.template}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
