import React, { useState, useEffect } from 'react';
import { 
  MapPin, Flame, Globe, Phone, Mail, Star, Sparkles, 
  ExternalLink, ChevronRight, X, Layers, Crosshair 
} from 'lucide-react';
import { BusinessLead } from '../types';

interface MapViewProps {
  leads: BusinessLead[];
  onSelectLead: (lead: BusinessLead) => void;
  onAddToCrm: (lead: BusinessLead) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  leads,
  onSelectLead,
  onAddToCrm
}) => {
  const [selectedPin, setSelectedPin] = useState<BusinessLead | null>(leads[0] || null);

  useEffect(() => {
    setSelectedPin(leads[0] || null);
  }, [leads]);

  // Center around Austin TX coordinates roughly (30.2672, -97.7431)
  const mapCenter = { lat: 30.2672, lng: -97.7431 };

  // Calculate relative pixel position on mock SVG map canvas
  const getPinPos = (lat: number, lng: number) => {
    const latDiff = (lat - mapCenter.lat) * 2000;
    const lngDiff = (lng - mapCenter.lng) * 2000;
    const x = 50 + lngDiff; // percentage offset from center
    const y = 50 - latDiff;
    return {
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y))
    };
  };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-2xl">
      {/* Dynamic Map Canvas Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Grid Lines Overlay */}
      <svg className="absolute inset-0 w-full h-full stroke-slate-800/80 pointer-events-none" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-white backdrop-blur-md shadow-lg">
        <MapPin className="h-4 w-4 text-indigo-400" />
        <span className="text-xs font-bold">Austin, TX Lead Map Canvas</span>
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold border border-indigo-500/30">
          {leads.length} Markers
        </span>
      </div>

      {/* Map Pins Container */}
      <div className="absolute inset-0 p-8">
        {leads.map((lead) => {
          const pos = getPinPos(lead.coordinates.lat, lead.coordinates.lng);
          const isSelected = selectedPin?.id === lead.id;
          const isPrime = lead.opportunityScore >= 85;

          return (
            <div
              key={lead.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => setSelectedPin(lead)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            >
              {/* Pulse Ring for Prime Leads */}
              {isPrime && (
                <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
              )}

              {/* Pin Icon Container */}
              <div className={`relative p-2.5 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                isSelected
                  ? 'bg-indigo-600 text-white scale-125 ring-4 ring-indigo-400/50 z-30'
                  : isPrime
                    ? 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white group-hover:scale-110'
                    : 'bg-slate-800 text-indigo-300 border border-slate-700 group-hover:scale-110'
              }`}>
                {isPrime ? (
                  <Flame className="h-4 w-4 text-amber-200 fill-amber-200" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}

                {/* Score Badge floating on top */}
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-slate-950 text-white border border-slate-700 shadow-sm">
                  {lead.opportunityScore}
                </span>
              </div>

              {/* Hover Tooltip Preview */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 text-white text-[11px] font-extrabold whitespace-nowrap shadow-xl border border-slate-800">
                  {lead.name}
                </div>
                <div className="w-2 h-2 bg-slate-950 rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Lead Card Floating Drawer (Bottom / Right overlay) */}
      {selectedPin && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 bg-slate-900/95 border border-slate-800 text-white p-5 rounded-3xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Score: {selectedPin.opportunityScore}/100 • {selectedPin.opportunityLevel.toUpperCase()}
              </span>
              <h3 className="text-base font-bold text-white line-clamp-1">{selectedPin.name}</h3>
              <p className="text-xs text-slate-400">{selectedPin.industry} • {selectedPin.city}, {selectedPin.state}</p>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                {selectedPin.googleRating} ({selectedPin.reviewCount} reviews)
              </span>
              <span className="font-semibold text-emerald-400">Est. ${selectedPin.dealValue} Deal</span>
            </div>

            <p className="text-[11px] text-slate-400">
              📍 {selectedPin.address}
            </p>

            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 space-y-1">
              <p className="text-[10px] font-bold text-indigo-300 uppercase">Primary Sales Hook</p>
              <p className="text-xs text-slate-200">
                {selectedPin.aiOpportunityHighlights[0] || 'High local review count but website conversion flaws detected.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => onSelectLead(selectedPin)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full Audit & Pitch</span>
            </button>
            <button
              onClick={() => onAddToCrm(selectedPin)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              + CRM
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
