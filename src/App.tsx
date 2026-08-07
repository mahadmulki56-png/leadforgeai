/**
 * LeadForge AI - AI-Powered Local Business Lead Intelligence Platform
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SearchView } from './components/SearchView';
import { SearchResultsView } from './components/SearchResultsView';
import { LeadDetailsView } from './components/LeadDetailsView';
import { CrmPipelineView } from './components/CrmPipelineView';
import { AutomationView } from './components/AutomationView';
import { ExportHubView } from './components/ExportHubView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { CommandPalette } from './components/CommandPalette';

import { BusinessLead, UserProfile, SearchFilters, CrmStage, AutomationSequence, CrmTask } from './types';
import { auth, testConnection } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  subscribeLeads, saveLeadToFirestore, 
  subscribeTasks, saveTaskToFirestore, 
  subscribeSequences, saveSequenceToFirestore 
} from './lib/firestoreService';

const DEFAULT_SEQUENCES: AutomationSequence[] = [
  {
    id: 'seq-01',
    name: 'No Website Local Business Goldmine',
    channel: 'email',
    status: 'active',
    triggerEvent: 'Lead added with no website',
    stepsCount: 3,
    leadsEnrolled: 0,
    openRate: 68.4,
    responseRate: 24.1,
    createdAt: new Date().toISOString().split('T')[0],
    steps: [
      {
        delayDays: 0,
        subject: "Quick question regarding {{businessName}}'s web presence",
        template: "Hi {{ownerName}}, I noticed {{businessName}} has great local presence but no mobile website. You're likely missing out on direct appointment bookings..."
      },
      {
        delayDays: 3,
        subject: 'I built a quick concept homepage mockup for {{businessName}}',
        template: 'Hey {{ownerName}}, I put together a quick 2-minute video preview of what a modern mobile site for {{businessName}} could look like...'
      },
      {
        delayDays: 5,
        subject: 'Should I close your file for {{businessName}}?',
        template: 'Hi {{ownerName}}, following up one last time before I focus on other local service providers in {{city}}...'
      }
    ]
  },
  {
    id: 'seq-02',
    name: 'Non-SSL / Security Risk Outreach',
    channel: 'email',
    status: 'active',
    triggerEvent: 'Lead added with SSL invalid',
    stepsCount: 2,
    leadsEnrolled: 0,
    openRate: 74.2,
    responseRate: 31.0,
    createdAt: new Date().toISOString().split('T')[0],
    steps: [
      {
        delayDays: 0,
        subject: "Urgent security warning for {{businessName}}'s website",
        template: 'Hello {{businessName}} team, Chrome is currently displaying a "Not Secure" warning on {{websiteUrl}}. This is likely costing you patient consultations...'
      },
      {
        delayDays: 2,
        subject: "Easy fix for {{businessName}}'s SSL certificate",
        template: 'Hi again, we can help resolve your HTTPS security warning within 2 hours without disrupting your existing website...'
      }
    ]
  }
];

export default function App() {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [sequences, setSequences] = useState<AutomationSequence[]>(DEFAULT_SEQUENCES);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    name: 'Mahad Mulki',
    email: 'mahadmulki56@gmail.com',
    agencyName: 'Apex Growth Marketing LLC',
    avatarUrl: '',
    plan: 'Enterprise AI',
    creditsRemaining: 850,
    totalCredits: 1000,
    todaySearchesCount: 14,
    totalLeadsDiscovered: 1428,
    apiKey: 'lf_live_9f82a17b084e41c38d21a938e55e0',
    theme: 'dark'
  });

  // Verify Firestore Connection on initial boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen for Firebase Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        setUser(prev => ({
          ...prev,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || prev.name,
          email: currentUser.email || prev.email,
          avatarUrl: currentUser.photoURL || ''
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore collections when user is authenticated
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubLeads = subscribeLeads(uid, (remoteLeads) => {
      if (remoteLeads.length > 0) {
        setLeads(remoteLeads);
      }
    });

    const unsubTasks = subscribeTasks(uid, (remoteTasks) => {
      if (remoteTasks.length > 0) {
        setTasks(remoteTasks);
      }
    });

    const unsubSequences = subscribeSequences(uid, (remoteSequences) => {
      if (remoteSequences.length > 0) {
        setSequences(remoteSequences);
      }
    });

    return () => {
      unsubLeads();
      unsubTasks();
      unsubSequences();
    };
  }, [firebaseUser]);

  // Toggle Theme (add or remove 'dark' class on <html>)
  useEffect(() => {
    const root = document.documentElement;
    if (user.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [user.theme]);

  const toggleTheme = () => {
    setUser(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const handleSelectLead = (lead: BusinessLead) => {
    setSelectedLead(lead);
    setActiveView('details');
  };

  const handleAddToCrm = (lead: BusinessLead) => {
    const updatedLead: BusinessLead = { ...lead, crmStatus: 'new' };
    setLeads(prev => prev.map(l => l.id === lead.id ? updatedLead : l));
    if (firebaseUser) {
      saveLeadToFirestore(updatedLead, firebaseUser.uid);
    }
    alert(`Added ${lead.name} to CRM Sales Pipeline!`);
  };

  const handleUpdateCrmStage = (leadId: string, newStage: CrmStage) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (targetLead && firebaseUser) {
      const updated = { ...targetLead, crmStatus: newStage };
      saveLeadToFirestore(updated, firebaseUser.uid);
    }
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, crmStatus: newStage } : l));
  };

  const handleToggleSequence = (seqId: string) => {
    setSequences(prev => {
      const updated = prev.map(s => {
        if (s.id === seqId) {
          const newSeq = { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const };
          if (firebaseUser) {
            saveSequenceToFirestore(newSeq, firebaseUser.uid);
          }
          return newSeq;
        }
        return s;
      });
      return updated;
    });
  };

  const [searchSuggestions, setSearchSuggestions] = useState<string[] | undefined>(undefined);
  const [activeProviderName, setActiveProviderName] = useState<string>('OpenStreetMap / Google Places API');
  const [dataQualityReport, setDataQualityReport] = useState<any>(null);

  // Execute Search via Real Business Data Backend API
  const handleExecuteSearch = async (filters: SearchFilters) => {
    setIsSearching(true);
    setSearchSuggestions(undefined);

    try {
      const res = await fetch('/api/search-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          industry: filters.industry === 'All Industries' ? 'Local Services' : filters.industry,
          city: filters.city || 'Austin',
          state: filters.state || 'TX',
          country: filters.country || 'United States',
          radiusKm: filters.radiusKm || 25,
          keyword: filters.keyword || '',
          noWebsiteOnly: filters.noWebsiteOnly,
          noSslOnly: filters.noSslOnly,
          hasFacebookOnly: filters.hasFacebookOnly,
          hasInstagramOnly: filters.hasInstagramOnly,
          minRating: filters.minRating || 0,
          minReviews: filters.minReviews || 0
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Server search error (${res.status})`);
      }

      const data = await res.json();

      const searchResults: BusinessLead[] = data.results || [];
      setLeads(searchResults);
      setActiveProviderName(data.provider || 'Business Data Engine');
      setDataQualityReport(data.dataQuality || null);
      if (data.suggestions) {
        setSearchSuggestions(data.suggestions);
      }

      // Persist searched leads to Firestore if signed in
      if (firebaseUser) {
        searchResults.forEach(lead => {
          saveLeadToFirestore(lead, firebaseUser.uid);
        });
      }

      setUser(prev => ({
        ...prev,
        creditsRemaining: Math.max(0, prev.creditsRemaining - 10),
        todaySearchesCount: prev.todaySearchesCount + 1,
        totalLeadsDiscovered: prev.totalLeadsDiscovered + searchResults.length
      }));

      setActiveView('results');
    } catch (err: any) {
      console.error('Real search execution failed:', err);
      alert(`Search failed: ${err.message || 'Error communicating with business data provider'}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Business Name', 'Industry', 'Address', 'City', 'State', 'Phone', 'Email', 
      'Website', 'Google Rating', 'Reviews', 'Google Place ID', 'Google Maps URL', 
      'Google Maps Verified', 'Opportunity Score', 'Est Deal Value'
    ];
    const rows = leads.map(l => [
      `"${l.name}"`,
      `"${l.industry}"`,
      `"${l.address}"`,
      `"${l.city}"`,
      `"${l.state}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.website || 'NO WEBSITE'}"`,
      l.googleRating,
      l.reviewCount,
      `"${l.googlePlaceId || ''}"`,
      `"${l.googleMapsUrl || ''}"`,
      l.googleMapsVerified ? 'TRUE' : 'FALSE',
      l.opportunityScore,
      l.dealValue
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leadforge_local_leads_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        firebaseUser={firebaseUser}
        onToggleTheme={toggleTheme}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        activeView={activeView}
        onSelectView={(v) => { setActiveView(v); setSelectedLead(null); }}
        searchCount={user.todaySearchesCount}
      />

      <div className="flex">
        {/* Responsive Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => { setActiveView(v); setSelectedLead(null); }}
          savedLeadsCount={leads.length}
          crmCount={leads.filter(l => l.crmStatus !== 'new').length}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 pb-16">
          {activeView === 'dashboard' && (
            <DashboardView
              leads={leads}
              user={user}
              onSelectLead={handleSelectLead}
              onSelectView={setActiveView}
            />
          )}

          {activeView === 'search' && (
            <SearchView
              onExecuteSearch={handleExecuteSearch}
              isSearching={isSearching}
            />
          )}

          {activeView === 'results' && (
            <SearchResultsView
              leads={leads}
              onSelectLead={handleSelectLead}
              onAddToCrm={handleAddToCrm}
              onExportCsv={handleExportCsv}
              onOpenSearch={() => setActiveView('search')}
            />
          )}

          {activeView === 'details' && selectedLead && (
            <LeadDetailsView
              lead={selectedLead}
              onBack={() => setActiveView('results')}
              onAddToCrm={handleAddToCrm}
            />
          )}

          {(activeView === 'analyzer' || activeView === 'outreach') && (
            <LeadDetailsView
              lead={selectedLead || leads[0]}
              onBack={() => setActiveView('results')}
              onAddToCrm={handleAddToCrm}
            />
          )}

          {activeView === 'crm' && (
            <CrmPipelineView
              leads={leads}
              onSelectLead={handleSelectLead}
              onUpdateStage={handleUpdateCrmStage}
            />
          )}

          {activeView === 'automation' && (
            <AutomationView
              sequences={sequences}
              onToggleSequence={handleToggleSequence}
            />
          )}

          {activeView === 'export' && (
            <ExportHubView
              leads={leads}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeView === 'admin' && (
            <AdminConsoleView user={user} />
          )}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectView={(v) => { setActiveView(v); setSelectedLead(null); }}
      />
    </div>
  );
}
