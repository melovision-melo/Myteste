import React from 'react';
import { Link2, LogOut, Settings, Code2, Sparkles, User as UserIcon, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { isFirebaseConfigured } from '../config/firebase';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  onOpenConfig: () => void;
  onOpenCodeExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenConfig,
  onOpenCodeExport,
}) => {
  const firebaseActive = isFirebaseConfigured();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                MeloVision
              </span>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                Shortener
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
              Encurtador de links com Firebase Firestore & Auth
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase Status Tag */}
          <button
            id="btn-firebase-status"
            onClick={onOpenConfig}
            title={firebaseActive ? "Firebase Conectado" : "Configurar Chaves do Firebase"}
            className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all sm:flex ${
              firebaseActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${firebaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{firebaseActive ? 'Firebase Ativo' : 'Configurar Firebase'}</span>
            <Settings className="h-3.5 w-3.5 ml-0.5 opacity-70" />
          </button>

          {/* Export Code Button */}
          <button
            id="btn-export-code"
            onClick={onOpenCodeExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Ver arquivos do projeto para deploy (app.js, style.css, firebase.json, index.html)"
          >
            <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Arquivos do Projeto</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-3 dark:border-slate-700">
              {/* User Profile */}
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuário'}
                    className="h-8 w-8 rounded-full border border-indigo-200 object-cover shadow-sm dark:border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs dark:bg-indigo-900 dark:text-indigo-200">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                  </div>
                )}
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user.displayName || 'Usuário'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px] dark:text-slate-400">
                    {user.email || 'Conectado'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                id="btn-logout"
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                title="Sair da conta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
