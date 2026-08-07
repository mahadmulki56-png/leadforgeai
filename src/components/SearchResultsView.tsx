import React, { useState } from 'react';
import { 
  Table, LayoutGrid, Map, Flame, Globe, ShieldAlert, Star, 
  Download, Sparkles, Plus, ExternalLink, Filter, ChevronDown, Check,
  MapPin, CheckCircle2, AlertTriangle, Navigation
} from 'lucide-react';
import { BusinessLead } from '../types';
import { LeadMapView } from './LeadMapView';
import { handleGoogleMapsClick } from '../lib/utils/googleMaps';

interface SearchResultsViewProps {
  leads: BusinessLead[];
  onSelectLead: (lead: BusinessLead) => void;
  onAddToCrm: (lead: BusinessLead) => void;
  onExportCsv: () => void;
  onOpenSearch: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  leads,
  onSelectLead,
  onAddToCrm,
  onExportCsv,
  onOpenSearch
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'map'>('table');
  const [sortBy, setSortBy] = useState<'opportunityScore' | 'reviewCount' | 'googleRating' | 'dealValue'>('opportunityScore');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const sortedLeads = [...leads].sort((a, b) => b[sortBy] - a[sortBy]);

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(i => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Discovered Leads Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
              {leads.length} Results
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Compliant lead intelligence with automatic technical & social audit metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex p-1 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              <span>Map View</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white focus:outline-none"
          >
            <option value="opportunityScore" className="bg-slate-900">Sort: Opportunity Score</option>
            <option value="reviewCount" className="bg-slate-900">Sort: Most Reviews</option>
            <option value="googleRating" className="bg-slate-900">Sort: Highest Rating</option>
            <option value="dealValue" className="bg-slate-900">Sort: Estimated Deal Value</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700/80 backdrop-blur-md shadow-md transition-all"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar if items selected */}
      {selectedLeadIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-lg animate-in fade-in">
          <span>{selectedLeadIds.length} Leads Selected</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const targets = leads.filter(l => selectedLeadIds.includes(l.id));
                targets.forEach(t => onAddToCrm(t));
                setSelectedLeadIds([]);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold"
            >
              + Bulk Add to CRM
            </button>
            <button 
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded-lg bg-white text-indigo-700 font-bold"
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {leads.length === 0 ? (
        <div className="glass-panel p-10 rounded-3xl border border-white/10 text-center space-y-6 max-w-2xl mx-auto my-12 shadow-2xl">
          <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-16 h-16 mx-auto flex items-center justify-center">
            <Filter className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">No matching businesses found</h2>
            <p className="text-sm text-slate-400">
              The real business data provider returned 0 results matching your specific query and filter criteria.
            </p>
          </div>

          <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 text-left space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Recommended Adjustments:</p>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Expand your search radius (e.g. increase from 25km to 50km).</li>
              <li>Use a broader category keyword (e.g. "Local Services" or "Health" instead of narrow niches).</li>
              <li>Turn off restrictive toggles such as "No Website Only" or high review thresholds.</li>
              <li>Verify the city & state spelling (e.g. "Dallas, TX").</li>
            </ul>
          </div>

          <button
            onClick={onOpenSearch}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Modify Search Parameters</span>
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <LeadMapView leads={sortedLeads} onSelectLead={onSelectLead} onAddToCrm={onAddToCrm} />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="glass-card glass-card-hover group p-5 rounded-3xl border border-white/10 hover:border-indigo-500/80 shadow-2xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                      {lead.industry}
                    </span>
                    <h3 className="font-extrabold text-base text-white group-hover:text-indigo-400 transition-colors">
                      {lead.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      📍 {lead.city}, {lead.state}
                    </p>
                  </div>

                  <span className="glass-pill px-2.5 py-1 rounded-xl text-xs font-black text-amber-400 border border-amber-500/30 shrink-0">
                    {lead.opportunityScore} Score
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    ★ {lead.googleRating}
                  </span>
                  <span>•</span>
                  <span>{lead.reviewCount} Reviews</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-400">${lead.dealValue} Deal</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lead.googleMapsVerified ? (
                    <span className="glass-pill px-2 py-0.5 rounded-md text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Maps Verified
                    </span>
                  ) : (
                    <span className="glass-pill px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-400 border border-slate-700/50">
                      Maps listing unavailable
                    </span>
                  )}
                  {!lead.websiteAudit.hasWebsite && (
                    <span className="glass-pill px-2 py-0.5 rounded-md text-[10px] font-extrabold text-purple-300 border border-purple-500/30">
                      NO WEBSITE
                    </span>
                  )}
                  {lead.websiteAudit.hasWebsite && !lead.websiteAudit.sslValid && (
                    <span className="glass-pill px-2 py-0.5 rounded-md text-[10px] font-extrabold text-rose-300 border border-rose-500/30">
                      NO SSL
                    </span>
                  )}
                  {lead.websiteAudit.hasWebsite && !lead.websiteAudit.mobileFriendly && (
                    <span className="glass-pill px-2 py-0.5 rounded-md text-[10px] font-extrabold text-amber-300 border border-amber-500/30">
                      MOBILE SLOW
                    </span>
                  )}
                </div>

                {/* Google Maps View Button (Full-width for mobile, 44px minimum touch target) */}
                {lead.googleMapsVerified && lead.googleMapsUrl ? (
                  <button
                    onClick={(e) => handleGoogleMapsClick(e, lead.googleMapsUrl, lead.id, lead.name)}
                    className="w-full min-h-[44px] py-2 px-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-extrabold text-xs border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Navigation className="h-4 w-4 text-indigo-400" />
                    <span>View on Google Maps</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <div className="w-full min-h-[44px] py-2 px-3 rounded-2xl bg-slate-900/40 text-slate-500 font-medium text-xs border border-slate-800 flex items-center justify-center gap-1">
                    <span>Maps listing unavailable</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCrm(lead);
                  }}
                  className="glass-pill px-3 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
                >
                  + Add CRM
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLead(lead);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Audit & Pitch</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel overflow-x-auto rounded-3xl border border-white/10 shadow-2xl">
          <table className="w-full text-left text-xs">
            <thead className="glass-panel text-slate-400 font-extrabold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length === leads.length && leads.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-indigo-600 h-4 w-4 rounded"
                  />
                </th>
                <th className="p-4">Business & Location</th>
                <th className="p-4">Rating & Reviews</th>
                <th className="p-4">Technical Status</th>
                <th className="p-4">Google Maps</th>
                <th className="p-4">Opportunity Score</th>
                <th className="p-4">Deal Value</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {sortedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`glass-panel hover:bg-indigo-950/40 transition-all cursor-pointer ${
                      isSelected ? 'bg-indigo-950/60' : ''
                    }`}
                  >
                    <td className="p-4" onClick={(e) => toggleSelectLead(lead.id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="accent-indigo-600 h-4 w-4 rounded"
                      />
                    </td>

                    <td className="p-4 space-y-0.5">
                      <span className="font-extrabold text-sm text-white group-hover:text-indigo-400 transition-colors block">
                        {lead.name}
                      </span>
                      <p className="text-slate-400 text-xs">
                        {lead.industry} • {lead.city}, {lead.state}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{lead.googleRating}</span>
                        <span className="text-slate-400 font-normal">({lead.reviewCount})</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {!lead.websiteAudit.hasWebsite && (
                          <span className="glass-pill px-2 py-0.5 rounded text-[10px] font-extrabold text-purple-300 border border-purple-500/30">
                            NO WEBSITE
                          </span>
                        )}
                        {lead.websiteAudit.hasWebsite && !lead.websiteAudit.sslValid && (
                          <span className="glass-pill px-2 py-0.5 rounded text-[10px] font-extrabold text-rose-300 border border-rose-500/30">
                            NO SSL
                          </span>
                        )}
                        {lead.websiteAudit.hasWebsite && lead.websiteAudit.sslValid && (
                          <span className="glass-pill px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                            SSL Valid
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      {lead.googleMapsVerified && lead.googleMapsUrl ? (
                        <button
                          onClick={(e) => handleGoogleMapsClick(e, lead.googleMapsUrl, lead.id, lead.name)}
                          className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/30 transition-all flex items-center gap-1 shrink-0"
                        >
                          <Navigation className="h-3 w-3 text-indigo-400" />
                          <span>View Listing</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">
                          Unavailable
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="glass-pill px-2.5 py-1 rounded-xl text-xs font-black text-amber-400 border border-amber-500/30">
                          {lead.opportunityScore} / 100
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-emerald-400 text-sm">
                      ${lead.dealValue}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCrm(lead);
                          }}
                          className="glass-pill px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-slate-300 font-bold text-[11px]"
                        >
                          + CRM
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Audit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
