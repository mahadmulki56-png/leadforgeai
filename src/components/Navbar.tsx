import React, { useState } from 'react';
import { 
  Sparkles, Search, Bell, Sun, Moon, Shield, Zap, Download, 
  User, CheckCircle, Flame, Layers, Terminal, ChevronDown, LogIn, LogOut, Cloud
} from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface NavbarProps {
  user: UserProfile;
  firebaseUser: any;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  searchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  firebaseUser,
  onToggleTheme,
  onOpenCommandPalette,
  activeView,
  onSelectView,
  searchCount
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Firebase Auth Sign in failed:', err);
      alert(`Sign in failed: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  const notifications = [
    { id: 'n1', title: '🔥 Prime Lead Discovered', desc: 'Apex Dental Care (Austin, TX) has 312 reviews with NO SSL!', time: '10m ago' },
    { id: 'n2', title: '⚡ Sequence Triggered', desc: 'Cold Email sent to Vanguard Plumbing regarding emergency booking.', time: '1h ago' },
    { id: 'n3', title: '🎯 Deal Won!', desc: 'Elysian MedSpa accepted $5,500 proposal deck.', time: '3h ago' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-xl transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Brand / Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onSelectView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 text-white font-black text-lg tracking-wider">
                <Zap className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  LeadForge<span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                  PRO v2.4
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Local Lead Intelligence & Outreach Engine
              </p>
            </div>
          </div>
        </div>

        {/* Center Command Search Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span>Search leads, runs, sequences, or press Ctrl+K...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Credits Counter Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-sm">
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="hidden sm:inline">{user.creditsRemaining} / {user.totalCredits} Credits</span>
            <span className="sm:hidden">{user.creditsRemaining}</span>
          </div>

          {/* Quick Search CTA */}
          <button
            onClick={() => onSelectView('search')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Search</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {user.theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-indigo-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Lead Alerts</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Mark all read</span>
                </div>
                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 text-[11px] font-semibold">
                    <Shield className="h-3 w-3" />
                    {user.agencyName} ({user.plan})
                  </div>
                </div>

                <div className="space-y-1">
                  <button 
                    onClick={() => { onSelectView('admin'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Agency Settings & API Keys
                  </button>
                  <button 
                    onClick={() => { onSelectView('export'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="h-4 w-4 text-slate-400" />
                    Export & CRM Sync
                  </button>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                        Firestore Database
                      </span>
                      <span className="text-emerald-400 font-bold">Connected</span>
                    </div>

                    {firebaseUser ? (
                      <button
                        onClick={() => { handleSignOut(); setShowUserMenu(false); }}
                        className="w-full mt-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        Sign Out ({firebaseUser.email?.split('@')[0]})
                      </button>
                    ) : (
                      <button
                        onClick={() => { handleGoogleSignIn(); setShowUserMenu(false); }}
                        className="w-full mt-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                      >
                        <LogIn className="h-4 w-4 text-indigo-400" />
                        Sign In with Google
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
