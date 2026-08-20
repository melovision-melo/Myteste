import React, { useEffect, useState } from 'react';
import {
  Link2,
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AuthView } from './components/AuthView';
import { Dashboard } from './components/Dashboard';
import { RedirectScreen } from './components/RedirectScreen';
import { UserProfile } from './types';
import { subscribeToAuthChanges, logoutUser } from './services/authService';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [redirectSlug, setRedirectSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'analytics'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check URL pathname for short link pattern (e.g. /melovisionA1B2)
  useEffect(() => {
    const rawPath = window.location.pathname.replace(/^\/+/, '');
    if (/^melovision[a-zA-Z0-9]{4}$/i.test(rawPath)) {
      setRedirectSlug(rawPath);
    }
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // If visiting a short link slug directly
  if (redirectSlug) {
    return (
      <RedirectScreen
        slug={redirectSlug}
        onGoHome={() => {
          setRedirectSlug(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A1128]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#4D7C0F] border-t-[#A3E635]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Iniciando MeloVision...
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show Auth View
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A1128] text-[#F8FAFC] flex flex-col font-sans">
        <AuthView
          onAuthSuccess={() => {
            // Handled by auth listener
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#0A1128] font-sans text-[#F8FAFC]">
      {/* Dark Navy Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#080E21] flex-col shrink-0 border-r border-[#1C2B54]">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-[#1C2B54]/80">
          <div className="w-10 h-10 bg-[#1E3014] border border-[#365314] text-[#A3E635] rounded-xl flex items-center justify-center shadow-md shadow-black/40">
            <Link2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl tracking-tight">MeloVision</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A3E635]">Shortener Pro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#1E3014] text-[#A3E635] border border-[#365314] font-bold shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#101A36]'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              activeTab === 'dashboard' ? 'border-[#A3E635] bg-[#365314]/30' : 'border-[#334155]'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'dashboard' ? 'bg-[#A3E635]' : 'bg-transparent'}`} />
            </div>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'links'
                ? 'bg-[#1E3014] text-[#A3E635] border border-[#365314] font-bold shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#101A36]'
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
              activeTab === 'links' ? 'border-[#A3E635] bg-[#365314]/30' : 'border-[#334155]'
            }`}>
              <LinkIcon className={`w-3 h-3 ${activeTab === 'links' ? 'text-[#A3E635]' : 'text-[#64748B]'}`} />
            </div>
            <span>Meus Links</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#1E3014] text-[#A3E635] border border-[#365314] font-bold shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#101A36]'
            }`}
          >
            <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
              activeTab === 'analytics' ? 'border-[#A3E635] bg-[#365314]/30' : 'border-[#334155]'
            }`}>
              <BarChart3 className={`w-3 h-3 ${activeTab === 'analytics' ? 'text-[#A3E635]' : 'text-[#64748B]'}`} />
            </div>
            <span>Analytics</span>
          </button>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-[#1C2B54] bg-[#060B1A]">
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuário'}
                  className="w-9 h-9 rounded-full object-cover border border-[#1C2B54]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#1E3014] border border-[#365314] text-[#A3E635] flex items-center justify-center text-xs font-bold shrink-0">
                  {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'GM'}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-white font-semibold truncate">
                  {user.displayName || 'Gabriel Melo'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-[#94A3B8] hover:text-red-400 transition-colors text-left"
                >
                  Sair da conta
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-[#101A36] transition"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-[#080E21] border-b border-[#1C2B54] px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1E3014] border border-[#365314] text-[#A3E635] rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-lg text-white">MeloVision</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#94A3B8] hover:bg-[#101A36] text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#080E21] border-b border-[#1C2B54] px-4 py-4 space-y-2 animate-in slide-in-from-top">
            <div className="flex items-center gap-3 p-2 border-b border-[#1C2B54] mb-2">
              <div className="w-8 h-8 rounded-full bg-[#1E3014] border border-[#365314] text-[#A3E635] flex items-center justify-center text-xs font-bold">
                {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'GM'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.displayName || 'Gabriel Melo'}</p>
                <p className="text-[10px] text-[#94A3B8] truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:underline"
              >
                Sair
              </button>
            </div>

            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'dashboard' ? 'bg-[#1E3014] text-[#A3E635] border border-[#365314]' : 'text-[#94A3B8]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#A3E635]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('links'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'links' ? 'bg-[#1E3014] text-[#A3E635] border border-[#365314]' : 'text-[#94A3B8]'
              }`}
            >
              <LinkIcon className="w-4 h-4 text-[#A3E635]" />
              <span>Meus Links</span>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === 'analytics' ? 'bg-[#1E3014] text-[#A3E635] border border-[#365314]' : 'text-[#94A3B8]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#A3E635]" />
              <span>Analytics</span>
            </button>
          </div>
        )}

        {/* Dynamic Dashboard View */}
        <main className="flex-1 flex flex-col">
          <Dashboard
            user={user}
            activeTab={activeTab}
          />
        </main>
      </div>
    </div>
  );
}
