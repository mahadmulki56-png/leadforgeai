import React, { useState } from 'react';
import { 
  ArrowLeft, Building2, Phone, Mail, Globe, MapPin, Star, 
  Sparkles, ShieldCheck, ShieldAlert, Smartphone, Zap, FileText, 
  Send, Copy, Check, ExternalLink, RefreshCw, Layers, CheckSquare, 
  MessageSquare, Share2, DollarSign, ChevronRight, Award, CheckCircle2, AlertTriangle, Navigation
} from 'lucide-react';
import { BusinessLead, AIOutreachResponse } from '../types';
import { handleGoogleMapsClick, checkGoogleMapsConsistency, validateGoogleMapsUrl } from '../lib/utils/googleMaps';
import { LeadMapView } from './LeadMapView';
import { apiClient } from '../lib/api/client';

interface LeadDetailsViewProps {
  lead: BusinessLead;
  onBack: () => void;
  onAddToCrm: (lead: BusinessLead) => void;
}

export const LeadDetailsView: React.FC<LeadDetailsViewProps> = ({
  lead,
  onBack,
  onAddToCrm
}) => {
  if (!lead) {
    return (
      <div className="p-8 text-center space-y-6 max-w-xl mx-auto my-12 glass-panel rounded-3xl border border-white/10 shadow-2xl">
        <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-16 h-16 mx-auto flex items-center justify-center">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">No Lead Selected</h2>
          <p className="text-sm text-slate-400">
            Search and discover real local business leads first, then select a business to view detailed audit reports and AI outreach.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition-all"
        >
          Back to Search Directory
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'social' | 'ai' | 'outreach' | 'tasks'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gemini AI real call states
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [aiOutreachData, setAiOutreachData] = useState<AIOutreachResponse | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateAiOutreach = async () => {
    setIsGeneratingOutreach(true);
    try {
      const data = await apiClient.generateOutreach({
        businessName: lead.name,
        industry: lead.industry,
        city: lead.city,
        ownerName: lead.name.split(' ')[0] + ' Owner',
        highlights: lead.aiOpportunityHighlights,
        website: lead.website,
        rating: lead.googleRating
      });
      setAiOutreachData(data);
    } catch (err) {
      console.error('Outreach generation error:', err);
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddToCrm(lead)}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-all"
          >
            + Add to CRM Pipeline
          </button>
        </div>
      </div>

      {/* Business Header Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
                {lead.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-extrabold border border-amber-500/20">
                Opportunity Score: {lead.opportunityScore}/100
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {lead.name}
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 font-semibold">
              <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                <Star className="h-4 w-4 fill-amber-500" /> {lead.googleRating} ({lead.reviewCount} Google Reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-indigo-500" /> {lead.address}, {lead.city}, {lead.state}
              </span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 text-white space-y-1 text-right shrink-0 shadow-lg">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Est. Agency Deal Size</p>
            <p className="text-3xl font-black text-emerald-400">${lead.dealValue}</p>
            <p className="text-[11px] text-slate-300">Turnkey Site + Funnel Setup</p>
          </div>
        </div>

        {/* Contact Info Chips */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors">
            <Phone className="h-4 w-4 text-emerald-500" />
            <span>{lead.phone}</span>
          </a>

          <a href={`mailto:${lead.email}`} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors">
            <Mail className="h-4 w-4 text-indigo-500" />
            <span>{lead.email}</span>
          </a>

          {lead.website ? (
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:underline">
              <Globe className="h-4 w-4" />
              <span>{lead.website}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 font-extrabold border border-purple-500/20">
              <Globe className="h-4 w-4 text-purple-500" />
              NO WEBSITE DETECTED
            </span>
          )}

          {/* Google Maps Verification Chip */}
          {lead.googleMapsVerified && lead.googleMapsUrl ? (
            <button
              onClick={(e) => handleGoogleMapsClick(e, lead.googleMapsUrl, lead.id, lead.name)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30 hover:bg-emerald-500/20 transition-all min-h-[44px]"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Google Maps Verified</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-500/10 text-slate-500 dark:text-slate-400 font-bold border border-slate-500/20">
              <AlertTriangle className="h-4 w-4 text-slate-400" />
              <span>Maps listing unavailable</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
        {[
          { id: 'overview', label: 'Overview & Highlights', icon: Building2 },
          { id: 'maps', label: 'Google Maps Verification', icon: MapPin, badge: lead.googleMapsVerified ? 'Verified' : undefined },
          { id: 'audit', label: 'Technical Audit', icon: ShieldCheck },
          { id: 'social', label: 'Social Presence', icon: Share2 },
          { id: 'outreach', label: 'AI Outreach Studio', icon: Sparkles, badge: 'Gemini' },
          { id: 'tasks', label: 'Notes & Tasks', icon: CheckSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-400 text-slate-950">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <span>AI Opportunity Highlights</span>
              </h3>
              <div className="space-y-2.5">
                {lead.aiOpportunityHighlights.map((h, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                    <span className="text-amber-500 font-bold shrink-0">⚡</span>
                    <span className="leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                <span>Recommended Agency Services</span>
              </h3>
              <div className="space-y-2.5">
                {lead.aiRecommendedServices.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                    <span>{s}</span>
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Google Maps Verification */}
      {activeTab === 'maps' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">
                    Google Maps Verification
                  </h3>
                  {lead.googleMapsVerified ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Google Maps Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Listing Unavailable
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time data verification confirming that this business lead corresponds to an authentic physical business location.
                </p>
              </div>

              {lead.googleMapsVerified && lead.googleMapsUrl && (
                <button
                  onClick={(e) => handleGoogleMapsClick(e, lead.googleMapsUrl, lead.id, lead.name)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Open Google Maps Listing</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Consistency Check Status Banner */}
            {(() => {
              const consistency = checkGoogleMapsConsistency(lead);
              if (!consistency.isConsistent) {
                return (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
                    <span>{consistency.mismatchReason}</span>
                  </div>
                );
              }
              return null;
            })()}

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Business Title</span>
                <p className="text-sm font-black text-slate-900 dark:text-white">{lead.name}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Google Place ID</span>
                <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
                  {lead.googlePlaceId || 'N/A (Provider Element ID)'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verification Source</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {lead.googleMapsSource || 'Provider Data Engine'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Physical Address</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {lead.address}, {lead.city}, {lead.state}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coordinates (GPS)</span>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {lead.coordinates.lat.toFixed(5)}, {lead.coordinates.lng.toFixed(5)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rating & Review Count</span>
                <p className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{lead.googleRating} ({lead.reviewCount} Reviews)</span>
                </p>
              </div>
            </div>

            {/* Map Preview Container */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-500" />
                <span>Geographic Location & Verification Canvas</span>
              </h4>
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-[300px] relative">
                <LeadMapView leads={[lead]} onSelectLead={() => {}} onAddToCrm={onAddToCrm} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Technical Audit */}
      {activeTab === 'audit' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="font-black text-lg text-slate-900 dark:text-white">Technical Website & Performance Audit</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">PageSpeed Score</span>
              <p className="text-2xl font-black text-amber-500">{lead.websiteAudit.speedScore}/100</p>
              <p className="text-[11px] text-slate-500">{lead.websiteAudit.loadTimeMs}ms load time</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">SSL Security</span>
              <p className={`text-2xl font-black ${lead.websiteAudit.sslValid ? 'text-emerald-500' : 'text-rose-500'}`}>
                {lead.websiteAudit.sslValid ? 'Valid HTTPS' : 'Insecure HTTP'}
              </p>
              <p className="text-[11px] text-slate-500">{lead.websiteAudit.sslValid ? 'Encrypted Connection' : 'Chrome Flags Warning'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">CMS / Framework</span>
              <p className="text-2xl font-black text-indigo-500">{lead.websiteAudit.cmsDetected || 'None'}</p>
              <p className="text-[11px] text-slate-500">Domain Age: {lead.websiteAudit.domainAgeYears} yrs</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Online Booking</span>
              <p className={`text-2xl font-black ${lead.websiteAudit.hasOnlineBooking ? 'text-emerald-500' : 'text-rose-500'}`}>
                {lead.websiteAudit.hasOnlineBooking ? 'Installed' : 'Missing'}
              </p>
              <p className="text-[11px] text-slate-500">24/7 Lead Capture Widget</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Social Presence */}
      {activeTab === 'social' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="font-black text-lg text-slate-900 dark:text-white">Detected Social Profiles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(lead.social).map(([platform, link]) => (
              <a
                key={platform}
                href={link as string}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex items-center justify-between transition-all"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">{platform}</span>
                  <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{link}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-indigo-500" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: AI Outreach Studio (Gemini powered) */}
      {activeTab === 'outreach' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase">
                  Gemini 3.6 Flash Engine
                </span>
                <h3 className="text-xl font-black">AI Lead Outreach & Sales Pitch Studio</h3>
                <p className="text-xs text-slate-300">
                  Generate personalized cold emails, social DMs, phone scripts, and custom proposal packages tailored to {lead.name}.
                </p>
              </div>

              <button
                onClick={handleGenerateAiOutreach}
                disabled={isGeneratingOutreach}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-lg transition-all"
              >
                {isGeneratingOutreach ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{aiOutreachData ? 'Regenerate Outreach' : 'Generate Custom Pitch'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!aiOutreachData && !isGeneratingOutreach && (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <Sparkles className="h-10 w-10 text-indigo-500 mx-auto animate-bounce" />
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Ready to Pitch {lead.name}?</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click "Generate Custom Pitch" above to produce cold emails, Instagram DMs, phone cold call scripts, and pricing proposals in seconds.
              </p>
            </div>
          )}

          {aiOutreachData && (
            <div className="space-y-6 animate-in fade-in">
              {/* Cold Email Box */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span>Personalized Cold Email</span>
                  </h4>
                  <button
                    onClick={() => copyToClipboard(aiOutreachData.coldEmail.body, 'email')}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    {copiedKey === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'email' ? 'Copied!' : 'Copy Body'}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Subject: <span className="text-slate-900 dark:text-white font-normal">{aiOutreachData.coldEmail.subject}</span>
                  </p>
                  <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed border border-slate-100 dark:border-slate-700">
                    {aiOutreachData.coldEmail.body}
                  </pre>
                </div>
              </div>

              {/* Social DMs Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-600">Facebook DM</span>
                    <button onClick={() => copyToClipboard(aiOutreachData.socialDms.facebook, 'fb')} className="text-slate-400 hover:text-indigo-500">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {aiOutreachData.socialDms.facebook}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-pink-500">Instagram DM</span>
                    <button onClick={() => copyToClipboard(aiOutreachData.socialDms.instagram, 'ig')} className="text-slate-400 hover:text-indigo-500">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {aiOutreachData.socialDms.instagram}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-500">WhatsApp Message</span>
                    <button onClick={() => copyToClipboard(aiOutreachData.socialDms.whatsapp, 'wa')} className="text-slate-400 hover:text-indigo-500">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {aiOutreachData.socialDms.whatsapp}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Tasks & Notes */}
      {activeTab === 'tasks' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="font-black text-lg text-slate-900 dark:text-white">CRM Notes & Pending Reminders</h3>
          <div className="space-y-3">
            {lead.notes.map((n, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                📌 {n}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
