import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BusinessLead } from '../types';
import { Sparkles, Star, Layers, MapPin, ExternalLink, ShieldAlert, CheckCircle2, Navigation } from 'lucide-react';
import { handleGoogleMapsClick } from '../lib/utils/googleMaps';

interface LeadMapViewProps {
  leads: BusinessLead[];
  onSelectLead: (lead: BusinessLead) => void;
  onAddToCrm: (lead: BusinessLead) => void;
}

// Component to dynamically fit map bounds to current leads
const AutoFitBounds: React.FC<{ leads: BusinessLead[] }> = ({ leads }) => {
  const map = useMap();

  React.useEffect(() => {
    if (leads.length === 0) return;
    const bounds = L.latLngBounds(leads.map(l => [l.coordinates.lat, l.coordinates.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [leads, map]);

  return null;
};

// Helper to create glowing HTML markers for lead scores
const createLeadMarkerIcon = (lead: BusinessLead, isSelected: boolean = false) => {
  const score = lead.opportunityScore;
  let colorBg = 'bg-amber-500';
  let borderColor = 'border-amber-400';
  let shadowGlow = 'shadow-[0_0_15px_rgba(245,158,11,0.6)]';

  if (score >= 80) {
    colorBg = 'bg-indigo-600';
    borderColor = 'border-indigo-400';
    shadowGlow = 'shadow-[0_0_20px_rgba(99,102,241,0.8)]';
  } else if (score < 50) {
    colorBg = 'bg-slate-700';
    borderColor = 'border-slate-500';
    shadowGlow = 'shadow-md';
  }

  const html = `
    <div class="relative group cursor-pointer">
      <div class="flex items-center justify-center min-w-[34px] h-[34px] px-2 rounded-full ${colorBg} border-2 ${borderColor} text-white font-black text-xs ${shadowGlow} transition-transform hover:scale-125 ${isSelected ? 'scale-125 ring-4 ring-indigo-400' : ''}">
        <span>${score}</span>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${colorBg} rotate-45 border-r border-b ${borderColor}"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-lead-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
  });
};

export const LeadMapView: React.FC<LeadMapViewProps> = ({ leads, onSelectLead, onAddToCrm }) => {
  const [tileStyle, setTileStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [showDensityRings, setShowDensityRings] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Default Austin, TX center fallback
  const defaultCenter: [number, number] = useMemo(() => {
    if (leads.length > 0) {
      const avgLat = leads.reduce((acc, l) => acc + l.coordinates.lat, 0) / leads.length;
      const avgLng = leads.reduce((acc, l) => acc + l.coordinates.lng, 0) / leads.length;
      return [avgLat, avgLng];
    }
    return [30.2672, -97.7431];
  }, [leads]);

  // Map Tile Layer URLs
  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  const tileAttributions = {
    dark: '&copy; <a href="https://carto.com/">CARTO</a>',
    light: '&copy; <a href="https://carto.com/">CARTO</a>',
    satellite: 'Tiles &copy; Esri',
  };

  return (
    <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 space-y-4 relative overflow-hidden">
      {/* Top Map Control Bar inside glass header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span>Geographic Lead Density Radar</span>
              <span className="glass-pill px-2.5 py-0.5 rounded-full text-[10px] font-black text-amber-400 border border-amber-500/30">
                {leads.length} Locations
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pins color-coded by Opportunity Score (Indigo = 80+ Prime Target)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Density Heat Rings Toggle */}
          <button
            type="button"
            onClick={() => setShowDensityRings(!showDensityRings)}
            className={`glass-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              showDensityRings
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Density Heat Rings</span>
          </button>

          {/* Map Tile Style Switcher */}
          <div className="flex p-1 rounded-xl bg-slate-950/80 border border-white/10">
            <button
              type="button"
              onClick={() => setTileStyle('dark')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                tileStyle === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Canvas
            </button>
            <button
              type="button"
              onClick={() => setTileStyle('light')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                tileStyle === 'light' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Light Voyager
            </button>
            <button
              type="button"
              onClick={() => setTileStyle('satellite')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                tileStyle === 'satellite' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Map Display Box */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 shadow-inner">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="w-full h-full z-10"
          style={{ background: '#020617' }}
        >
          <TileLayer
            url={tileUrls[tileStyle]}
            attribution={tileAttributions[tileStyle]}
          />

          <AutoFitBounds leads={leads} />

          {/* Density Buffer Rings */}
          {showDensityRings &&
            leads.map((lead) => {
              const score = lead.opportunityScore;
              let ringColor = '#6366f1';
              let fillOpacity = 0.12;

              if (score >= 85) {
                ringColor = '#818cf8';
                fillOpacity = 0.2;
              } else if (!lead.websiteAudit.hasWebsite) {
                ringColor = '#a855f7';
                fillOpacity = 0.22;
              }

              return (
                <Circle
                  key={`ring-${lead.id}`}
                  center={[lead.coordinates.lat, lead.coordinates.lng]}
                  radius={600 + lead.dealValue * 0.1}
                  pathOptions={{
                    color: ringColor,
                    fillColor: ringColor,
                    fillOpacity,
                    weight: 1.5,
                    dashArray: score >= 80 ? '4, 4' : undefined,
                  }}
                />
              );
            })}

          {/* Lead Location Pins */}
          {leads.map((lead) => (
            <Marker
              key={lead.id}
              position={[lead.coordinates.lat, lead.coordinates.lng]}
              icon={createLeadMarkerIcon(lead, selectedLeadId === lead.id)}
              eventHandlers={{
                click: () => setSelectedLeadId(lead.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -32]} opacity={0.95}>
                <div className="text-xs font-bold font-sans">
                  <p className="font-extrabold text-slate-900">{lead.name}</p>
                  <p className="text-[10px] text-indigo-600">${lead.dealValue} Deal • Score {lead.opportunityScore}</p>
                </div>
              </Tooltip>

              <Popup className="custom-glass-popup" maxWidth={300}>
                <div className="p-3 bg-slate-950 text-white font-sans rounded-2xl space-y-3 border border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                        {lead.industry}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {lead.opportunityScore} Score
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-white leading-tight">
                      {lead.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      📍 {lead.address}, {lead.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs border-y border-slate-800/80 py-2">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {lead.googleRating} ({lead.reviewCount})
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="font-bold text-emerald-400">${lead.dealValue} Est. Value</span>
                  </div>

                  {/* Audit Flaw Badges & Maps Verification */}
                  <div className="flex flex-wrap gap-1">
                    {lead.googleMapsVerified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        MAPS VERIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/50">
                        UNAVAILABLE
                      </span>
                    )}
                    {!lead.websiteAudit.hasWebsite ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        NO WEBSITE
                      </span>
                    ) : !lead.websiteAudit.sslValid ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        NO SSL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        SSL VALID
                      </span>
                    )}
                  </div>

                  {lead.googleMapsVerified && lead.googleMapsUrl && (
                    <button
                      type="button"
                      onClick={(e) => handleGoogleMapsClick(e, lead.googleMapsUrl, lead.id, lead.name)}
                      className="w-full py-1.5 px-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5 min-h-[38px]"
                    >
                      <Navigation className="h-3.5 w-3.5 text-indigo-400" />
                      <span>View on Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  {/* Actions inside popup */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onAddToCrm(lead)}
                      className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                    >
                      + CRM
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectLead(lead)}
                      className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Audit</span>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Floating Legend */}
        <div className="absolute bottom-4 right-4 z-20 glass-panel p-3 rounded-2xl border border-white/10 text-xs space-y-2 text-slate-300 backdrop-blur-xl">
          <p className="font-bold text-white text-[11px] uppercase tracking-wider">Opportunity Legend</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
              <span className="text-[11px]">Score 80+ (Prime Deal)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              <span className="text-[11px]">Score 50-79 (High Priority)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-600"></span>
              <span className="text-[11px]">Score &lt;50 (Nurture)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
