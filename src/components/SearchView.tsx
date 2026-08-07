import React, { useState } from 'react';
import { 
  Search, MapPin, Sliders, Sparkles, Filter, ShieldAlert, Globe, 
  Smartphone, Star, Phone, Mail, CheckCircle2, RefreshCw, ChevronDown, Zap 
} from 'lucide-react';
import { SearchFilters } from '../types';

interface SearchViewProps {
  onExecuteSearch: (filters: SearchFilters) => void;
  isSearching: boolean;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onExecuteSearch,
  isSearching
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    industry: 'All Industries',
    city: 'Austin',
    state: 'TX',
    country: 'United States',
    radiusKm: 25,
    keyword: '',
    noWebsiteOnly: false,
    hasFacebookOnly: false,
    hasInstagramOnly: false,
    hasWhatsAppOnly: false,
    hasEmailOnly: false,
    hasPhoneOnly: true,
    noSslOnly: false,
    mobileUnfriendlyOnly: false,
    minRating: 4.0,
    minReviews: 20,
    verifiedOnly: false,
    openNowOnly: false,
    recentlyAddedOnly: false,
    businessSize: 'All Sizes'
  });

  const [showAdvanced, setShowAdvanced] = useState(true);

  const industries = [
    'All Industries',
    'Healthcare & Dental',
    'Plumbing & HVAC',
    'Automotive & Detailing',
    'Food & Dining',
    'Beauty & Spa',
    'Legal Services',
    'Home Services & Solar',
    'Sports & Fitness',
    'Construction & Roofing',
    'Pet Care & Grooming',
    'Real Estate & Architecture'
  ];

  const presets = [
    {
      title: '🔥 Missing Website Goldmine',
      desc: 'High Google reviews but NO custom website',
      action: () => setFilters(prev => ({ ...prev, noWebsiteOnly: true, minRating: 4.2, minReviews: 30 }))
    },
    {
      title: '🔒 No SSL Security Risk',
      desc: 'Websites showing "Not Secure" warning',
      action: () => setFilters(prev => ({ ...prev, noSslOnly: true, noWebsiteOnly: false }))
    },
    {
      title: '⚡ Facebook-Only Businesses',
      desc: 'Active FB pages with no official domain',
      action: () => setFilters(prev => ({ ...prev, hasFacebookOnly: true, noWebsiteOnly: true }))
    },
    {
      title: '📱 Mobile Unfriendly Sites',
      desc: 'PageSpeed under 40 with poor mobile UX',
      action: () => setFilters(prev => ({ ...prev, mobileUnfriendlyOnly: true, noWebsiteOnly: false }))
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteSearch(filters);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Compliant Local Lead Discovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Local Business Intelligence Search
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
          Specify your target niche, location, and technical vulnerabilities to discover high-value local business prospects ready for digital service upgrades.
        </p>
      </div>

      {/* Quick Filter Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={preset.action}
            className="p-3.5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 hover:bg-slate-800/60 hover:border-indigo-500/80 text-left transition-all shadow-xl group"
          >
            <span className="font-extrabold text-xs text-white group-hover:text-indigo-400 transition-colors">
              {preset.title}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              {preset.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Search Form Card */}
      <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Core Parameters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Target Industry / Niche</label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {industries.map((ind, idx) => (
                <option key={idx} value={ind} className="bg-slate-900 text-white">{ind}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">City & State</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="City (e.g. Austin)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                placeholder="State (TX)"
                className="w-20 px-3 py-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Keywords (Optional)</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="e.g. Emergency, Dental Implants, Detailing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Radius Slider */}
        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-indigo-400" />
              Search Radius: <span className="text-indigo-400 font-extrabold">{filters.radiusKm} km ({Math.round(filters.radiusKm * 0.621)} miles)</span>
            </span>
            <span className="text-slate-400">Targeting {filters.city}, {filters.state} metro area</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={filters.radiusKm}
            onChange={(e) => setFilters({ ...filters, radiusKm: parseInt(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Toggle Advanced Filters Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{showAdvanced ? 'Hide Deep Audit Filters' : 'Show Deep Audit Filters'}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setFilters({
              industry: 'All Industries',
              city: 'Austin',
              state: 'TX',
              country: 'United States',
              radiusKm: 25,
              keyword: '',
              noWebsiteOnly: false,
              hasFacebookOnly: false,
              hasInstagramOnly: false,
              hasWhatsAppOnly: false,
              hasEmailOnly: false,
              hasPhoneOnly: true,
              noSslOnly: false,
              mobileUnfriendlyOnly: false,
              minRating: 4.0,
              minReviews: 20,
              verifiedOnly: false,
              openNowOnly: false,
              recentlyAddedOnly: false,
              businessSize: 'All Sizes'
            })}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Reset Filters
          </button>
        </div>

        {/* Deep Audit Filters Section */}
        {showAdvanced && (
          <div className="space-y-6 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
            {/* Technical Vulnerability Checks */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Digital Weakness / Service Need Toggles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  filters.noWebsiteOnly 
                    ? 'bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 font-bold' 
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={filters.noWebsiteOnly}
                    onChange={(e) => setFilters({ ...filters, noWebsiteOnly: e.target.checked })}
                    className="accent-purple-600 h-4 w-4 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold block">No Website Only</span>
                    <span className="text-[10px] text-slate-500">Highest conversion priority</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  filters.noSslOnly 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-bold' 
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={filters.noSslOnly}
                    onChange={(e) => setFilters({ ...filters, noSslOnly: e.target.checked })}
                    className="accent-rose-600 h-4 w-4 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold block">No SSL / Insecure HTTP</span>
                    <span className="text-[10px] text-slate-500">Security risk pitch</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  filters.mobileUnfriendlyOnly 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold' 
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={filters.mobileUnfriendlyOnly}
                    onChange={(e) => setFilters({ ...filters, mobileUnfriendlyOnly: e.target.checked })}
                    className="accent-amber-600 h-4 w-4 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold block">Mobile Unfriendly</span>
                    <span className="text-[10px] text-slate-500">PageSpeed & layout errors</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Social Presence & Contact Options */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Social Presence & Outreach Channels
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'hasFacebookOnly', label: 'Facebook Page' },
                  { key: 'hasInstagramOnly', label: 'Instagram Profile' },
                  { key: 'hasWhatsAppOnly', label: 'WhatsApp Contact' },
                  { key: 'hasPhoneOnly', label: 'Verified Phone Number' },
                  { key: 'hasEmailOnly', label: 'Direct Email Address' },
                ].map((item) => {
                  const isChecked = (filters as any)[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFilters({ ...filters, [item.key]: !isChecked })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '} {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google Reputation Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Minimum Google Rating</span>
                  <span className="text-amber-500 font-extrabold">★ {filters.minRating} Stars</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="5.0"
                  step="0.1"
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Minimum Reviews Count</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{filters.minReviews}+ Reviews</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={filters.minReviews}
                  onChange={(e) => setFilters({ ...filters, minReviews: parseInt(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Search Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSearching}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Scanning Local Business Intelligence Databases...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Run Compliant AI Discovery Search</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
